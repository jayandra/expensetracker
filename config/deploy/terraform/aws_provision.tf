####################################
###### Setting up AWS user #########
####################################
# Create a user in IAM Identity Center and give it power-user-access
#   refer https://www.youtube.com/watch?v=_KhrGFV_Npw for getting started on IAM Identity Center
# steps involved:
# - aws configure sso
#   follow the prompts and get the SSO user configured. You should see new profile entery in ~/.aws/config
# - aws configure list-profiles
#   This is to list profiles associated. The profile is used to login.
# - Set the profile provider "aws" > profile section via terraform variable
# - aws sso login --profile <your profile>

# Deprecated way using IAM user. Listed here for documentation purpose only, 
# create a deployer user in IAM and set its key and secret in ~/.aws/credentials
# run "aws configure". It should use the key and secrets from above steps, so keep hitting enter
# "aws sts get-caller-identity" should now be working
# Assign appropriate policies to the user via AWS console web interfact. 
  # An easy approach could be get till "terraform apply" step and whatever permission terraform says missing; keep adding them to the user


####################################
###### Provision aws resources #####
####################################
# - aws sso login --profile <your profile>
# - aws ecr-public get-login-password --region us-east-1 --profile <your profile> | docker login --username AWS --password-stdin public.ecr.aws
# - cd config/deploy/terraform
# - terraform init
# - terraform plan -var-file="production.tfvars"
# - terraform apply -var-file="production.tfvars"


####################################
###### Deploy with kamal ###########
####################################
# - kamal setup
# - kamal deploy


####################################
### MISC commands (for info only) ##
####################################
# To push an image manually to ECR
# - GIT_SHA=$(git rev-parse --short HEAD) 
# - docker build -t expensetracker .                                                                                                                                                                                                                                                                                                                                                                              
# - docker tag expensetracker:latest public.ecr.aws/a6a5f8a4/expense-tracker-repo:${GIT_SHA}
# - docker push public.ecr.aws/a6a5f8a4/expense-tracker-repo:${GIT_SHA}  


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
resource "aws_security_group" "rails_sg" {
  name        = "${var.project_name}-rails-security-group"
  description = "Allow inbound traffic from ALB to Rails container"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-rails-sg"
  }

  # Allow all HTTP traffic
  ingress {
    description = "Allow HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Allow HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Allow ssh from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "Allow ICMP ping from anywhere"
    protocol    = "icmp"
    from_port   = 8
    to_port     = -1
    cidr_blocks = ["0.0.0.0/0"]
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
##### EC2
##########################
resource "aws_key_pair" "deployer_key" {
  key_name   = var.ssh_key_pair_name
  public_key = file(var.ssh_public_key_path)
}

resource "aws_eip" "rails_eip" {
  instance = aws_instance.rails_server.id
  tags = {
    Name = "${var.project_name}-rails-eip"
  }
}

resource "aws_instance" "rails_server" {
  ami                         = var.ami_id  # Use an AMI with your Rails environment or Ubuntu/Amazon Linux
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.main_subnet_1.id
  associate_public_ip_address = false
  vpc_security_group_ids      = [aws_security_group.rails_sg.id]
  key_name                    = aws_key_pair.deployer_key.key_name

  tags = {
    Name = "${var.project_name}-rails-ec2"
  }

  user_data = <<-EOF
    #!/bin/bash
    # Update OS packages
    sudo yum update -y

    # Install Docker
    sudo yum install -y docker
    sudo service docker start
    systemctl enable docker

    #Add the ec2-user to the docker group so that you can run Docker commands without using sudo.
    sudo usermod -a -G docker ec2-user
  EOF
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
##### OUTPUTS
output "repository_uri" {
  value = aws_ecrpublic_repository.project_ecr.repository_uri
}

output "database_url"{
  value = aws_db_instance.rails_db.endpoint
}

output "server_ip"{
  value = aws_eip.rails_eip.public_ip
}