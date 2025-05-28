#!/bin/bash

# Terraform Deployment Script
# This script runs terraform plan and terraform apply for the SF Website infrastructure
# Run this script from the project root directory

set -e  # Exit on any error

# Configuration from existing setup
AWS_PROFILE="tf-sf-website"
AWS_REGION="us-east-1"
TERRAFORM_DIR="terraform"

echo "🚀 Starting Terraform deployment process..."

# Change to terraform directory
echo "📁 Changing to terraform directory..."
cd $TERRAFORM_DIR

# Step 1: Initialize Terraform (if needed)
echo "🔧 Initializing Terraform..."
AWS_PROFILE=$AWS_PROFILE terraform init

# Step 2: Run Terraform Plan
echo "📋 Running Terraform Plan..."
AWS_PROFILE=$AWS_PROFILE terraform plan -out=tfplan

# Step 3: Apply the changes automatically
echo "🚀 Applying Terraform changes..."
AWS_PROFILE=$AWS_PROFILE terraform apply tfplan

echo "✅ Terraform deployment completed successfully!"

# Clean up plan file
rm -f tfplan

echo "🎉 All done!" 