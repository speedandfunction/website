#!/bin/bash

set -e

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be fully started..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s http://localstack:4566/_localstack/health | grep -q '"s3": "running"'; then
    echo "LocalStack S3 service is running"
    break
  fi
  echo "Waiting for LocalStack S3 service to be ready... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "ERROR: LocalStack S3 service did not become ready within the timeout period"
  exit 1
fi

# Create S3 bucket
echo "Creating S3 bucket: apostrophe-test-bucket"
awslocal s3 mb s3://apostrophe-test-bucket || echo "Bucket might already exist"

# Configure bucket for public access
echo "Configuring bucket for public access"
awslocal s3api put-bucket-acl --bucket apostrophe-test-bucket --acl public-read

# Set CORS configuration for the bucket
echo "Setting CORS configuration"
awslocal s3api put-bucket-cors --bucket apostrophe-test-bucket --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}'

echo "LocalStack initialization completed successfully" 