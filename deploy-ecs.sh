#!/bin/bash

# ECS Deployment Script
# This script rebuilds the Docker image, pushes it to ECR, and restarts the ECS service

set -e  # Exit on any error

# Configuration
AWS_PROFILE="tf-sf-website"
AWS_REGION="us-east-1"
ECR_REPOSITORY="695912022152.dkr.ecr.us-east-1.amazonaws.com/sf-website-development"
ECS_CLUSTER="sf-website-dev-cluster"
ECS_SERVICE="sf-website-dev-service"
IMAGE_TAG="latest"

echo "🚀 Starting ECS deployment process..."

# Step 1: Login to ECR
echo "📝 Logging into ECR..."
AWS_PROFILE=$AWS_PROFILE aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY

# Step 2: Build the Docker image
echo "🔨 Building Docker image for linux/amd64 platform..."
docker build --platform linux/amd64 -t $ECR_REPOSITORY:$IMAGE_TAG .

# Step 3: Push the image to ECR
echo "📤 Pushing image to ECR..."
docker push $ECR_REPOSITORY:$IMAGE_TAG

# Step 4: Force ECS service to restart with new image
echo "🔄 Restarting ECS service..."
AWS_PROFILE=$AWS_PROFILE aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment \
  --region $AWS_REGION

# Step 5: Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
AWS_PROFILE=$AWS_PROFILE aws ecs wait services-stable \
  --cluster $ECS_CLUSTER \
  --services $ECS_SERVICE \
  --region $AWS_REGION

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at: https://sf-website-dev.sandbox-prettyclear.com" 