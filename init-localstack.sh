#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be fully started..."
while ! curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "running"'; do
  sleep 1
done

# Create S3 bucket
echo "Creating S3 bucket: apostrophe-test-bucket"
awslocal s3 mb s3://apostrophe-test-bucket

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