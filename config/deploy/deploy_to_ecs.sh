#!/bin/bash
# deploy_to_ecs.sh - Comprehensive script to deploy ExpenseTracker to ECS Fargate
# Ensure the deploy user has following blanket policies attached. This list needs to be finetuned with restrictive permissions
#AmazonEC2ContainerRegistryFullAccess
#AmazonECS_FullAccess
#AmazonElasticContainerRegistryPublicFullAccess
#AmazonOpenSearchDirectQueryGlueCreateAccess
#AWSAppRunnerServicePolicyForECRAccess
#EC2InstanceProfileForImageBuilderECRContainerBuilds
#IAMFullAccess
#SecretsManagerReadWrite

set -e

# Configuration constants
IMAGE_NAME="expensetracker"
IMAGE_TAG="latest"
ECS_CLUSTER="expensetracker-cluster"
ECS_SERVICE="expensetracker-service"
TASK_DEFINITION_PATH="config/deploy/task-definition.json"
TASK_DEFINITION_NAME="expensetracker"
IAM_ROLE_NAME="ecsTaskExecutionRole"
SECURITY_GROUP_NAME="expensetracker-sg"
LOG_GROUP_NAME="/ecs/expensetracker"

AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REGISTRY="${ECR_REGISTRY}"
VPC_ID="${VPC_ID}"
SUBNET_IDS="${SUBNET_IDS}"
SECURITY_GROUP_ID="${SECURITY_GROUP_ID}"
SECRET_NAME="${SECRET_NAME}"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Look for .env.deploy in the same directory as the script
if [ -f "${SCRIPT_DIR}/.env.deploy" ]; then
source "${SCRIPT_DIR}/.env.deploy"
else
echo "Error: .env.deploy file not found in ${SCRIPT_DIR}"
exit 1
fi

# Full image reference
FULL_IMAGE_NAME="${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"




echo "Starting deployment process for ExpenseTracker to ECS Fargate..."

# Step 1: Set up IAM Role and Policies
echo "Step 1: Setting up IAM Role and Policies..."

# Check if role exists
if aws iam get-role --role-name ${IAM_ROLE_NAME} > /dev/null 2>/dev/null; then
 echo "IAM Role ${IAM_ROLE_NAME} already exists."
else
 echo "Creating IAM Role ${IAM_ROLE_NAME}..."
 aws iam create-role \
     --role-name ${IAM_ROLE_NAME} \
     --assume-role-policy-document file://config/deploy/trust-policy.json > /dev/null

 # Attach ECS Task Execution Policy
 echo "Attaching ECS Task Execution and Logging Policy..."
 aws iam attach-role-policy \
     --role-name ${IAM_ROLE_NAME} \
     --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
     --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess > /dev/null

 # Attach Secrets Manager Policy
 echo "Attaching Secrets Manager Policy..."
 aws iam put-role-policy \
     --role-name ${IAM_ROLE_NAME} \
     --policy-name SecretsManagerAccess \
     --policy-document file://config/deploy/secretsmanager-policy.json > /dev/null

 echo "IAM Role setup complete."
fi

# Step 2: Create Secret in Secrets Manager
echo "Step 2: Setting up Secrets Manager..."

# Check if secret exists
if aws secretsmanager describe-secret --secret-id ${SECRET_NAME} > /dev/null 2>/dev/null; then
 echo "Secret ${SECRET_NAME} already exists."
else
 echo "Creating Secret ${SECRET_NAME}..."
 # Generate a random secret key base
 SECRET_KEY_BASE=$(openssl rand -hex 64)

 aws secretsmanager create-secret \
     --name ${SECRET_NAME} \
     --description "Secret key base for ExpenseTracker Rails application" \
     --secret-string ${SECRET_KEY_BASE} > /dev/null

 echo "Secret created successfully."
fi

# Step 3: Set up Network Resources
echo "Step 3: Setting up Network Resources..."

# Check if security group exists
if [ -z "${SECURITY_GROUP_ID}" ]; then
 echo "Checking for existing security group..."
 SG_ID=$(aws ec2 describe-security-groups \
     --filters "Name=group-name,Values=${SECURITY_GROUP_NAME}" "Name=vpc-id,Values=${VPC_ID}" \
     --query "SecurityGroups[0].GroupId" --output text 2>/dev/null || echo "")

 if [ "${SG_ID}" != "None" ] && [ ! -z "${SG_ID}" ]; then
     echo "Security group ${SECURITY_GROUP_NAME} already exists with ID: ${SG_ID}"
     SECURITY_GROUP_ID=${SG_ID}
 else
     echo "Creating security group ${SECURITY_GROUP_NAME}..."
     SG_ID=$(aws ec2 create-security-group \
         --group-name ${SECURITY_GROUP_NAME} \
         --description "Security group for ExpenseTracker ECS tasks" \
         --vpc-id ${VPC_ID} \
         --query "GroupId" --output text)

     SECURITY_GROUP_ID=${SG_ID}
     echo "Security group created with ID: ${SECURITY_GROUP_ID}"

     # Add inbound rules
     echo "Adding inbound rules to security group..."
     aws ec2 authorize-security-group-ingress \
         --group-id ${SECURITY_GROUP_ID} \
         --protocol tcp \
         --port 3000 \
         --cidr 0.0.0.0/0 > /dev/null

     echo "Security group setup complete."
 fi
fi

# Step 4: Create CloudWatch Log Group
echo "Step 4: Setting up CloudWatch Log Group..."

# Check if log group exists
if aws logs describe-log-groups --log-group-name-prefix ${LOG_GROUP_NAME} --query "logGroups[?logGroupName=='${LOG_GROUP_NAME}']" --output text | grep -q ${LOG_GROUP_NAME}; then
 echo "Log group ${LOG_GROUP_NAME} already exists."
else
 echo "Creating log group ${LOG_GROUP_NAME}..."
 aws logs create-log-group --log-group-name ${LOG_GROUP_NAME} > /dev/null

 # Set retention policy (e.g., 30 days)
 aws logs put-retention-policy \
     --log-group-name ${LOG_GROUP_NAME} \
     --retention-in-days 1 > /dev/null

 echo "Log group created successfully."
fi

# Step 5: Create ECS Cluster
echo "Step 5: Setting up ECS Cluster..."

# Check cluster status
CLUSTER_STATUS=$(aws ecs describe-clusters --clusters ${ECS_CLUSTER} --query "clusters[0].status" --output text > /dev/null 2>/dev/null || echo "NONEXISTENT")
echo "Cluster status: ${CLUSTER_STATUS}"

if [ "${CLUSTER_STATUS}" = "ACTIVE" ]; then
echo "ECS Cluster ${ECS_CLUSTER} already exists and is active."
else
if [ "${CLUSTER_STATUS}" = "INACTIVE" ]; then
    echo "Cluster exists but is inactive. Deleting inactive cluster..."
    aws ecs delete-cluster --cluster ${ECS_CLUSTER}
    echo "Waiting for cluster deletion to complete..."
    sleep 10
fi

echo "Creating ECS Cluster ${ECS_CLUSTER}..."
aws ecs create-cluster --cluster-name ${ECS_CLUSTER} > /dev/null
echo "ECS Cluster created successfully."
fi

# Step 6: Build and Push Docker Image
echo "Step 6: Building and Pushing Docker Image..."

echo "Building Docker image..."
docker build -t ${IMAGE_NAME} .

echo "Tagging image for ECR..."
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${FULL_IMAGE_NAME}

# Get the digest of the remote image
REMOTE_DIGEST=$(docker inspect --format='{{.Id}}' ${FULL_IMAGE_NAME} 2>/dev/null || echo "")

# Push only if we couldn't get a remote digest or if it's different
if [ -z "$REMOTE_DIGEST" ]; then
 echo "No existing image found in ECR. Will push new image."
 NEEDS_PUSH=true
else
 # Get the digest of the local image
 LOCAL_DIGEST=$(docker inspect --format='{{.Id}}' ${IMAGE_NAME}:${IMAGE_TAG})

 if [ "$LOCAL_DIGEST" = "$REMOTE_DIGEST" ]; then
   echo "Images are identical. Skipping push."
   NEEDS_PUSH=false
 else
   echo "Images differ. Will push new image."
   NEEDS_PUSH=true
 fi
fi

# Only push if needed
if [ "${NEEDS_PUSH}" = true ]; then
 echo "Logging in to ECR..."
 aws ecr-public get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

 echo "Pushing image to ECR..."
 docker push ${FULL_IMAGE_NAME}
 echo "Image pushed successfully."
else
 echo "Skipping image push as no changes were detected."
fi

# Step 7: Update Task Definition with current values
echo "Step 7: Updating Task Definition..."

# Create a temporary task definition with updated values
TMP_TASK_DEF=$(mktemp)
cat ${TASK_DEFINITION_PATH} | \
 jq --arg image "${FULL_IMAGE_NAME}" \
    --arg role "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/${IAM_ROLE_NAME}" \
    --arg secret_arn "arn:aws:secretsmanager:${AWS_REGION}:$(aws sts get-caller-identity --query Account --output text):secret:${SECRET_NAME}" \
    --arg log_group "${LOG_GROUP_NAME}" \
    --arg region "${AWS_REGION}" \
 '.containerDefinitions[0].image = $image |
  .executionRoleArn = $role |
  .containerDefinitions[0].secrets[0].valueFrom = $secret_arn |
  .containerDefinitions[0].logConfiguration.options."awslogs-group" = $log_group |
  .containerDefinitions[0].logConfiguration.options."awslogs-region" = $region' > ${TMP_TASK_DEF}

echo "Registering task definition..."
aws ecs register-task-definition --cli-input-json file://${TMP_TASK_DEF} > /dev/null

# Step 8: Create or Update ECS Service
echo "Step 8: Creating or Updating ECS Service..."

# Check if service exists
SERVICE_EXISTS=false

# First check if the cluster exists and is ACTIVE
CLUSTER_STATUS=$(aws ecs describe-clusters --clusters ${ECS_CLUSTER} --query "clusters[0].status" --output text 2>/dev/null || echo "NONEXISTENT")
echo "Cluster status: ${CLUSTER_STATUS}"

if [ "${CLUSTER_STATUS}" = "ACTIVE" ]; then
# Cluster exists and is active, now check for service
SERVICE_STATUS=$(aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} --query "services[0].status" --output text 2>/dev/null || echo "NONEXISTENT")
echo "Service status: ${SERVICE_STATUS}"

if [ "${SERVICE_STATUS}" = "ACTIVE" ]; then
   SERVICE_EXISTS=true
fi
fi

if [ "$SERVICE_EXISTS" = true ]; then
echo "Updating existing ECS Service ${ECS_SERVICE}..."
aws ecs update-service \
   --cluster ${ECS_CLUSTER} \
   --service ${ECS_SERVICE} \
   --task-definition ${TASK_DEFINITION_NAME} \
   --force-new-deployment > /dev/null
else
echo "Creating new ECS Service ${ECS_SERVICE}..."
# Create a temporary service definition with updated values
TMP_SERVICE_DEF=$(mktemp)
cat config/deploy/service.json | \
   jq --arg cluster "${ECS_CLUSTER}" \
      --arg service "${ECS_SERVICE}" \
      --arg task "${TASK_DEFINITION_NAME}" \
      --arg subnet "${SUBNET_IDS}" \
      --arg sg "${SECURITY_GROUP_ID}" \
   '.cluster = $cluster |
    .serviceName = $service |
    .taskDefinition = $task |
    .networkConfiguration.awsvpcConfiguration.subnets = [$subnet] |
    .networkConfiguration.awsvpcConfiguration.securityGroups = [$sg]' > ${TMP_SERVICE_DEF}

aws ecs create-service --cli-input-json file://${TMP_SERVICE_DEF} > /dev/null
fi

# Step 9: Monitor Deployment
echo "Step 9: Monitoring Deployment..."

echo "Waiting for service to stabilize..."
aws ecs wait services-stable --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE}

#echo "Deployment status:"
#aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE} \
# --query "services[0].{Status:status,DesiredCount:desiredCount,RunningCount:runningCount,PendingCount:pendingCount,Events:events[0].message}"

# Get the public IP of the task
echo "Retrieving task information..."
TASK_ARN=$(aws ecs list-tasks --cluster ${ECS_CLUSTER} --service-name ${ECS_SERVICE} --query "taskArns[0]" --output text)

if [ "${TASK_ARN}" != "None" ]; then
 echo "Getting network interface details..."
 ENI_ID=$(aws ecs describe-tasks --cluster ${ECS_CLUSTER} --tasks ${TASK_ARN} \
     --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text)

 if [ ! -z "${ENI_ID}" ]; then
     PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids ${ENI_ID} \
         --query "NetworkInterfaces[0].Association.PublicIp" --output text)

     echo "Application deployed successfully!"
     echo "You can access your application at: http://${PUBLIC_IP}:3000"
 else
     echo "Could not retrieve network interface details."
 fi
else
 echo "No running tasks found. Please check the ECS console for more details."
fi

echo "Deployment process completed."