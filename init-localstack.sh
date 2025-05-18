#!/bin/bash

# Use environment variables from Docker Compose
# If not set, use defaults
BUCKET_NAME=${BUCKET_NAME:-"apostrophe-test-bucket"}
REGION=${REGION:-"us-east-1"}

echo "Starting S3 bucket initialization..."
echo "Using bucket name: $BUCKET_NAME"
echo "Using region: $REGION"

# Wait for LocalStack to be fully running
echo "Waiting for LocalStack to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
until awslocal s3 ls > /dev/null 2>&1; do
  ATTEMPT=$((ATTEMPT+1))
  if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    echo "LocalStack failed to start after $MAX_ATTEMPTS attempts. Exiting."
    exit 1
  fi
  echo "LocalStack not ready yet... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done

echo "LocalStack is ready!"

# Check if bucket already exists
if awslocal s3 ls "s3://$BUCKET_NAME" > /dev/null 2>&1; then
  echo "Bucket $BUCKET_NAME already exists. Skipping setup."
  exit 0
fi

# Create the bucket
echo "Creating S3 bucket: $BUCKET_NAME"
if ! awslocal s3 mb s3://$BUCKET_NAME --region $REGION; then
  echo "Failed to create bucket. Exiting."
  exit 1
fi

# Set the bucket to allow public access
echo "Making bucket publicly accessible..."
if ! awslocal s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"; then
  echo "Warning: Failed to set public access block configuration"
fi

# Apply public read policy (ensuring all objects can be read)
echo "Setting public read access policy..."
if ! awslocal s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::'$BUCKET_NAME'/*"
      ]
    }
  ]
}'; then
  echo "Warning: Failed to set bucket policy"
fi

# Configure CORS for the bucket
echo "Configuring CORS..."
if ! awslocal s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "MaxAgeSeconds": 3000,
      "ExposeHeaders": ["ETag", "x-amz-meta-custom-header", "x-amz-server-side-encryption"]
    }
  ]
}'; then
  echo "Warning: Failed to set CORS configuration"
fi

# Create a test file to verify the bucket works
echo "Creating a test file..."
echo "This is a test file" > /tmp/test.txt
if ! awslocal s3 cp /tmp/test.txt s3://$BUCKET_NAME/test.txt --acl public-read; then
  echo "Warning: Failed to upload test file"
fi

# List bucket contents to verify
echo "Verifying bucket contents:"
awslocal s3 ls s3://$BUCKET_NAME/

echo "S3 bucket initialization completed successfully!"

# Additional step to make existing files public
echo "Making all existing objects public readable..."
awslocal s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ --recursive --acl public-read || echo "Warning: Failed to set ACLs on objects"

# Verify connectivity
echo "Testing S3 connectivity from localstack container:"
if curl -s http://localstack:4566/health | grep -q "\"s3\": \"running\""; then
  echo "S3 service is running correctly!"
else
  echo "Warning: S3 service health check failed"
fi

echo "Initialization complete!" 