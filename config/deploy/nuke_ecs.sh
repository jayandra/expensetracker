#!/bin/bash
 # nuke_ecs.sh - Script to completely remove all AWS resources related to the ExpenseTracker application

 set -e

 # Configuration constants
 ECS_CLUSTER="expensetracker-cluster"
 ECS_SERVICE="expensetracker-service"
 ECR_REPOSITORY="expensetracker"
 TASK_DEFINITION_PREFIX="expensetracker"
 LOG_GROUP="/ecs/expensetracker"
 SECRET_ID="/expensetracker/production/secret_key_base"
 SECURITY_GROUP="sg-0509dd940f83369a0"
 IAM_ROLE="ecsTaskExecutionRole"

 echo "WARNING: This script will delete ALL AWS resources related to ExpenseTracker."
 echo "This action cannot be undone and will result in data loss."
 read -p "Are you sure you want to continue? (y/n) " -n 1 -r
 echo
 if [[ ! $REPLY =~ ^[Yy]$ ]]
 then
     echo "Operation cancelled."
     exit 1
 fi

 echo "Starting cleanup process..."

 # 1. ECS Resources
 echo "Step 1: Removing ECS resources..."

 echo "Setting desired count to 0 for service..."
 aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --desired-count 0 || echo "Service already deleted or not found."

 echo "Stopping any running tasks..."
 TASKS=$(aws ecs list-tasks --cluster $ECS_CLUSTER --query 'taskArns' --output text || echo "")
 if [ ! -z "$TASKS" ]; then
     for TASK in $TASKS; do
         echo "Stopping task $TASK..."
         aws ecs stop-task --cluster $ECS_CLUSTER --task $TASK || echo "Failed to stop task $TASK"
     done
 fi

 echo "Deleting service..."
 aws ecs delete-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force || echo "Service already deleted or not found."

 echo "Waiting for service to be deleted..."
 sleep 10

 echo "Deleting cluster..."
 aws ecs delete-cluster --cluster $ECS_CLUSTER || echo "Cluster already deleted or not found."

# # 2. ECR Repository
# echo "Step 2: Removing ECR repository..."
#
# echo "Deleting all images in repository..."
# IMAGES=$(aws ecr-public list-images --repository-name $ECR_REPOSITORY --query 'imageIds[*]' --output json 2>/dev/null || echo "[]")
# if [ "$IMAGES" != "[]" ]; then
#     aws ecr-public batch-delete-image --repository-name $ECR_REPOSITORY --image-ids "$IMAGES" || echo "Failed to delete images or repository not found."
# fi
#
# echo "Deleting repository..."
# aws ecr-public delete-repository --repository-name $ECR_REPOSITORY --force || echo "Repository already deleted or not found."

 # 3. CloudWatch Logs
 echo "Step 3: Removing CloudWatch logs..."

 echo "Deleting log group..."
 aws logs delete-log-group --log-group-name $LOG_GROUP || echo "Log group already deleted or not found."

 # 4. IAM Roles and Policies
# echo "Step 4: Cleaning up IAM roles and policies..."
#
# echo "Detaching policies from role..."
# POLICIES=$(aws iam list-attached-role-policies --role-name $IAM_ROLE --query 'AttachedPolicies[].PolicyArn' --output text 2>/dev/null || echo "")
# if [ ! -z "$POLICIES" ]; then
#     for POLICY in $POLICIES; do
#         echo "Detaching policy $POLICY..."
#         aws iam detach-role-policy --role-name $IAM_ROLE --policy-arn $POLICY || echo "Failed to detach policy $POLICY"
#     done
# fi
#
# echo "NOTE: Not deleting IAM role '$IAM_ROLE' as it might be used by other services."
# echo "If you want to delete it, run: aws iam delete-role --role-name $IAM_ROLE"
#
# # 5. Secrets Manager
# echo "Step 5: Removing secrets..."
#
# echo "Deleting secret..."
# aws secretsmanager delete-secret --secret-id $SECRET_ID --force-delete-without-recovery || echo "Secret already deleted or not found."
#
# # 6. Task Definitions
# echo "Step 6: Deregistering task definitions..."
#
# echo "Deregistering all revisions of task definition..."
# TASK_DEFS=$(aws ecs list-task-definitions --family-prefix $TASK_DEFINITION_PREFIX --status ACTIVE --query 'taskDefinitionArns' --output text 2>/dev/null || echo "")
# if [ ! -z "$TASK_DEFS" ]; then
#     for TASK_DEF in $TASK_DEFS; do
#         echo "Deregistering task definition $TASK_DEF..."
#         aws ecs deregister-task-definition --task-definition $TASK_DEF || echo "Failed to deregister task definition $TASK_DEF"
#     done
# fi
#
# # 7. Network Resources (Optional)
# echo "Step 7: Network resources..."
#
# echo "NOTE: Not deleting security group '$SECURITY_GROUP' as it might be used by other services."
# echo "If you want to delete it, run: aws ec2 delete-security-group --group-id $SECURITY_GROUP"
#
# echo "NOTE: Not deleting VPC resources as they might be used by other services."
# echo "If you created a specific VPC for this project, you'll need to manually delete:"
# echo "- Subnets"
# echo "- Route tables"
# echo "- Internet Gateway"
# echo "- VPC itself"
#
# # Verification
# echo "Step 8: Verifying deletion..."
#
# echo "Checking ECS resources..."
# aws ecs describe-clusters --clusters $ECS_CLUSTER 2>/dev/null && echo "WARNING: Cluster still exists!" || echo "Cluster successfully deleted."
# aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE 2>/dev/null && echo "WARNING: Service still exists!" || echo "Service successfully deleted."
# aws ecs list-task-definitions --family-prefix $TASK_DEFINITION_PREFIX --status ACTIVE 2>/dev/null && echo "WARNING: Task definitions still exist!" || echo "Task definitions successfully deregistered."
#
# echo "Checking ECR repository..."
# aws ecr-public describe-repositories --repository-names $ECR_REPOSITORY 2>/dev/null && echo "WARNING: Repository still exists!" || echo "Repository successfully deleted."
#
# echo "Checking CloudWatch logs..."
# aws logs describe-log-groups --log-group-name-prefix $LOG_GROUP 2>/dev/null && echo "WARNING: Log group still exists!" || echo "Log group successfully deleted."
#
# echo "Checking Secrets Manager..."
# aws secretsmanager describe-secret --secret-id $SECRET_ID 2>/dev/null && echo "WARNING: Secret still exists!" || echo "Secret successfully deleted."

 echo "Cleanup process completed."
 echo "Please check the AWS Console to verify all resources have been properly deleted."
 echo "Remember to check your AWS billing dashboard to ensure no unexpected charges occur."