###### Setting up AWS user ######
# If a user is setup via IAM Identity Center (preferred):
# - aws configure sso
#   follow the prompts and get the SSO user configured. You should see new profile entery in ~/.aws/config
# - aws configure list-profiles
#   This is to list profiles associated. The profile is used to login.
# - Set the profile provider "aws" > profile section via terraform variable
# - aws sso login --profile <your profile>

# Alternatively, create a deployer user in IAM and set its key and secret in ~/.aws/credentials
# run "aws configure". It should use the key and secrets from above steps, so keep hitting enter
# "aws sts get-caller-identity" should now be working
# Assign appropriate policies to the user via AWS console web interfact. 
  # An easy approach could be get till "terraform apply" step and whatever permission terraform says missing; keep adding them to the user

###### Build and push the image (use bin/deploy for deployment; listed here for info only) ######
# docker build -t expensetracker .

# aws sso login --profile <your profile>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
# aws ecr-public get-login-password --region us-east-1 --profile <your profile> | docker login --username AWS --password-stdin public.ecr.aws     
# OR (for traditional IAM user with credentials stored in .aws/credentials)
# aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws

# Get the latest git commit SHA                                                                                                                                                                            
#  GIT_SHA=$(git rev-parse --short HEAD)                                                                                                                                                                                                                                                                                                                                                                               
#  docker tag expensetracker:latest public.ecr.aws/a6a5f8a4/expense-tracker-repo:${GIT_SHA}                                                                                                                   
#  docker tag expensetracker:latest public.ecr.aws/a6a5f8a4/expense-tracker-repo:latest                                                                                                                       
#  docker push public.ecr.aws/a6a5f8a4/expense-tracker-repo:${GIT_SHA}                                                                                                                                        
#  docker push public.ecr.aws/a6a5f8a4/expense-tracker-repo:latest     

###### Deploy the image (use bin/deploy for deployment; listed here for info only) ######
###### refer variables.tf to identify what variables need to be set in production.tfvars)
###### the terraform file uses :latest tag. Replace it with the tag from above step, otherwise it will be a no-op
# cd config/deploy/terraform
# terraform init
# terraform plan -var-file="production.tfvars"
# terraform apply -var-file="production.tfvars"

data "aws_availability_zones" "available" {
  state = "available"
}
##########################
##### PROVIDER CONFIGURATION
provider "aws" {
  region = var.aws_region
  profile = var.aws_profile
}

##########################
##### VPC AND NETWORK SETUP
# Creating the main VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Creating the main subnet within the VPC
resource "aws_subnet" "main_subnet_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = element(data.aws_availability_zones.available.names, 0)
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-subnet-1"
  }
}
resource "aws_subnet" "main_subnet_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = element(data.aws_availability_zones.available.names, 1)
  map_public_ip_on_launch = false   #This will be private subnet

  tags = {
    Name = "${var.project_name}-subnet-2"
  }
}


# Creating the Internet Gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-gateway"
  }
}

# Creating private and public route tables
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  
  tags = {
    Name = "${var.project_name}-public-route-table"
  }
}
resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "${var.project_name}-private-route-table"
  }
}

# Associate public subnet with public route table
resource "aws_route_table_association" "public_subnet_1_association" {
  subnet_id      = aws_subnet.main_subnet_1.id
  route_table_id = aws_route_table.public_route_table.id
}

# Associate private subnet with private route table
resource "aws_route_table_association" "private_subnet_2_association" {
  subnet_id      = aws_subnet.main_subnet_2.id
  route_table_id = aws_route_table.private_route_table.id
}

##########################
##### SECURITY GROUP SETUP
resource "aws_security_group" "rails_lb_sg" {
  name        = "${var.project_name}-lb-security-group"
  description = "Allow inbound HTTP and HTTPS traffic to ALB"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-load-balancer-sg"
  }

  # Allow HTTP traffic from the public internet to the ALB
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTPS traffic from the public internet to the ALB
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic (by default, ALB can send outbound traffic to your ECS tasks)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_security_group" "rails_sg" {
  name        = "${var.project_name}-rails-security-group"
  description = "Allow inbound traffic from ALB to Rails container"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-rails-sg"
  }

  # Allow traffic from ALB to Rails container on port 3000
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    security_groups = [aws_security_group.rails_lb_sg.id]  # Allow only ALB to talk to Rails container
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_security_group" "rails_db_sg" {
  name        = "${var.project_name}-db-security-group"
  description = "Allow inbound traffic to the database from ECS task"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-db-sg"
  }

  # Allow inbound traffic from Rails container on PostgreSQL port (5432)
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Public access (be cautious with this)
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

##########################
##### SECRETS MANAGER
##########################
# List all secrets that match the name filter
data "aws_secretsmanager_secrets" "existing_secrets" {
  filter {
    name   = "name"
    values = ["${var.project_name}-project_secrets"]
  }
}
locals {                                                                                                                                                                                                           
  # Check if the secret exists by length of filtered list
  secret_exists = length(data.aws_secretsmanager_secrets.existing_secrets.arns) > 0

  # Get existing secret info if found
  existing_secret_arn = local.secret_exists ? tolist(data.aws_secretsmanager_secrets.existing_secrets.arns)[0] : ""                                                                                                                     

  # Use the existing secret's ID and arn if it exists, otherwise use the new resource's ID                                                                                                                                                                                                                       
  secret_arn = local.secret_exists ? local.existing_secret_arn : aws_secretsmanager_secret.project_secrets[0].arn                                                                                                                                                                                                                                                                                         
 }

# Storing sensitive data like database credentials in Secrets Manager
resource "aws_secretsmanager_secret" "project_secrets" {
  # Only create if the secret doesn't exist                                                                                                                                                                        
  count = local.secret_exists ? 0 : 1
  name        = "${var.project_name}-project_secrets"
  description = "Secrets for the Rails application"
  
  tags = {
    Name = "${var.project_name}-secrets"
  }
}

# Creating a version for the secret containing the database credentials
resource "aws_secretsmanager_secret_version" "project_secrets_version" {
  secret_id     = local.secret_arn
  secret_string = jsonencode({
    DB_HOST     = aws_db_instance.rails_db.address
    DB_USERNAME = var.db_username
    DB_PASSWORD = var.db_password
    DB_NAME     = var.db_name
    RAILS_MASTER_KEY = var.rails_master_key
    MAILER_HOST = var.mailer_host
    DISABLE_ASYNC_JOBS = var.disable_async_jobs
  })
}

##########################
##### ECR REPOSITORY FOR DOCKER IMAGES
# Creating an ECR repository to store Docker images for the Rails app
resource "aws_ecrpublic_repository" "project_ecr" {
  repository_name = "${var.project_name}-repo"

  tags = {
    Name = "${var.project_name}-ecr-repository"
  }
}

##########################
##### DATABASE SETUP
# Creating a PostgreSQL database instance for the Rails application
resource "aws_db_instance" "rails_db" {
  identifier          = "${var.project_name}-db-instance"
  allocated_storage   = 20
  engine              = "postgres"
  engine_version      = "17.4"
  instance_class      = "db.t4g.micro"
  db_name             = var.db_name
  username            = var.db_username
  password            = var.db_password
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rails_db_sg.id]
  multi_az            = false
  storage_type        = "gp2"
  backup_retention_period = 7
  publicly_accessible = true
  deletion_protection = true

  # Final snapshot settings
  skip_final_snapshot = true
  final_snapshot_identifier = "${var.project_name}-final-snapshot-${formatdate("20060102-150405", timestamp())}"

  tags = {
    Name = "${var.project_name}-db-instance"
  }
}

# Creating a subnet group for the RDS database
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.main_subnet_1.id, aws_subnet.main_subnet_2.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

##########################
##### ECS CLUSTER SETUP
# Creating the ECS cluster for the Rails application
resource "aws_ecs_cluster" "rails_cluster" {
  name = "${var.project_name}-cluster"
 
  tags = {
    Name = "${var.project_name}-ecs-cluster"
  }
}

##########################
##### Cloudwatch Log SETUP
# Creating the cloudwatch log group and stream
resource "aws_cloudwatch_log_group" "rails_log_group" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 1  # Optional: Set retention period (in days)
}

resource "aws_cloudwatch_log_stream" "rails_log_stream" {
  name           = "${var.project_name}-log-stream"
  log_group_name = aws_cloudwatch_log_group.rails_log_group.name 
}

##########################
##### IAM POLICY AND ROLES FOR ECS TASK AND EXECUTION

# Creating the IAM policy for ECS execution role
resource "aws_iam_policy" "ecs_execution_policy" {
  name        = "${var.project_name}-ecs-execution-policy"
  description = "Policy for ECS task execution, allowing CloudWatch Logs, Secrets Manager, and ECR access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Effect   = "Allow"
        Resource = local.secret_arn
      },
      {
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:GetRepositoryUri"
        ]
        Effect   = "Allow"
        Resource = aws_ecrpublic_repository.project_ecr.arn
      }
    ]
  })
}

# Creating an IAM role for ECS task execution
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.project_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Attaching the execution policy to the ECS execution role
resource "aws_iam_role_policy_attachment" "ecs_execution_policy_attachment" {
  policy_arn = aws_iam_policy.ecs_execution_policy.arn
  role       = aws_iam_role.ecs_execution_role.name
}

# Creating the IAM policy for ECS task role (example policy if needed)
resource "aws_iam_policy" "ecs_task_policy" {
  name        = "${var.project_name}-ecs-task-policy"
  description = "Policy for ECS tasks to allow necessary actions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:ListBucket",  # Example action
          "s3:GetObject",
          "secretsmanager:GetSecretValue"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Creating an IAM role for ECS tasks
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Attaching the ECS task policy to the ECS task role
resource "aws_iam_role_policy_attachment" "ecs_task_policy_attachment" {
  policy_arn = aws_iam_policy.ecs_task_policy.arn
  role       = aws_iam_role.ecs_task_role.name
}

##########################
##### ECS TASK DEFINITION
# Defining the ECS task for the Rails application
locals {
  ecs_task_common_environment = [
    {
      name  = "RAILS_ENV"
      value = "production"
    },
    {
      name = "BINDING",
      value = "0.0.0.0"
    },
    {
      name = "DB_ADAPTER",
      value = "postgresql"
    }
  ]

  ecs_task_common_secrets = [
    {
      name      = "DB_HOSTNAME"
      valueFrom = "${local.secret_arn}:DB_HOST::"
    },
    {
      name      = "DB_USERNAME"
      valueFrom = "${local.secret_arn}:DB_USERNAME::"
    },
    {
      name      = "DB_PASSWORD"
      valueFrom = "${local.secret_arn}:DB_PASSWORD::"
    },
    {
      name      = "DB_NAME"
      valueFrom = "${local.secret_arn}:DB_NAME::"
    },
    {
      name      = "RAILS_MASTER_KEY"
      valueFrom = "${local.secret_arn}:RAILS_MASTER_KEY::"
    },
    {
      name      = "MAILER_HOST"
      valueFrom = "${local.secret_arn}:MAILER_HOST::"
    },
    {
      name      = "DISABLE_ASYNC_JOBS"
      valueFrom = "${local.secret_arn}:DISABLE_ASYNC_JOBS::"
    }
  ]

  ecs_common_log_configuration = {
    logDriver = "awslogs"
    options = {
      "awslogs-group"         = "/ecs/${var.project_name}"
      "awslogs-region"        = var.aws_region
      "awslogs-stream-prefix" = "ecs"
    }
  }
}
resource "aws_ecs_task_definition" "rails_task" {
  family                   = "${var.project_name}-rails-task"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-app"
      image     = "${aws_ecrpublic_repository.project_ecr.repository_uri}:latest"
      essential = true
      # publicly_accessible = true
      logConfiguration = local.ecs_common_log_configuration
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      environment = local.ecs_task_common_environment
      secrets = local.ecs_task_common_secrets
    }
  ])

  depends_on = [
    aws_db_instance.rails_db
  ]

  tags = {
    Name = "${var.project_name}-ecs-rails-task-definition"
  }
}
resource "aws_ecs_task_definition" "worker_task" {
  family                   = "${var.project_name}-worker-task"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-app"
      image     = "${aws_ecrpublic_repository.project_ecr.repository_uri}:latest"
      essential = true
      # publicly_accessible = true
      logConfiguration = local.ecs_common_log_configuration
      environment = local.ecs_task_common_environment
      secrets = local.ecs_task_common_secrets
      command = ["./bin/thrust", "./bin/jobs"]
    }
  ])

  depends_on = [
    aws_db_instance.rails_db
  ]

  tags = {
    Name = "${var.project_name}-ecs-worker-task-definition"
  }
}

##########################
##### ECS SERVICE SETUP
# Deploying the ECS service to the cluster using Fargate
resource "aws_ecs_service" "rails_service" {
  name            = "${var.project_name}-rails-service"
  cluster         = aws_ecs_cluster.rails_cluster.id
  task_definition = aws_ecs_task_definition.rails_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.main_subnet_1.id]
    security_groups = [aws_security_group.rails_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.rails_target_group.arn
    container_name   = "${var.project_name}-app"
    container_port   = 3000
  }

  depends_on = [
    aws_ecs_task_definition.rails_task,
    aws_lb_listener.rails_listener
  ]

  tags = {
    Name = "${var.project_name}-ecs-rails-service"
  }
}
resource "aws_ecs_service" "worker_service" {
  name            = "${var.project_name}-worker-service"
  cluster         = aws_ecs_cluster.rails_cluster.id
  task_definition = aws_ecs_task_definition.worker_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.main_subnet_1.id]
    security_groups = [aws_security_group.rails_sg.id]
    assign_public_ip = true
  }

  depends_on = [
    aws_ecs_task_definition.worker_task
  ]

  tags = {
    Name = "${var.project_name}-ecs-worker-service"
  }
}

##########################
##### LOAD BALANCER
# Creating the Application Load Balancer
resource "aws_lb" "rails_lb" {
  name               = "${var.project_name}-load-balancer"
  internal           = false
  load_balancer_type = "application"
  security_groups   = [aws_security_group.rails_lb_sg.id]
  subnets            = [aws_subnet.main_subnet_1.id, aws_subnet.main_subnet_2.id]

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-load-balancer"
  }
}

# Defining the Target Group for the Load Balancer
resource "aws_lb_target_group" "rails_target_group" {
  name     = "${var.project_name}-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  target_type = "ip"

  health_check {
    interval            = 30
    path                = "/up"
    port                = 3000
    protocol            = "HTTP"
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "${var.project_name}-target-group"
  }
}

# Defining the Load Balancer Listener
resource "aws_lb_listener" "rails_listener" {
  load_balancer_arn = aws_lb.rails_lb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.rails_target_group.arn
  }
}

##########################
##### OUTPUTS
output "ecs_cluster_name" {
  value = aws_ecs_cluster.rails_cluster.name
}

output "ecs_service_names" {
  value = {
    server = aws_ecs_service.rails_service.name,
    worker   = aws_ecs_service.worker_service.name
  }
}

output "load_balancer_url" {
  value = aws_lb.rails_lb.dns_name
}

output "repository_uri" {
  value = aws_ecrpublic_repository.project_ecr.repository_uri
}

output "database_url"{
  value = aws_db_instance.rails_db.endpoint
}
