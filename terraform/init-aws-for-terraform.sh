#!/bin/bash

# Script to manage Terraform backend resources (S3 bucket and DynamoDB table)
# Usage: ./init-aws-for-terraform.sh [create|delete|status] [--profile PROFILE_NAME]

set -e

# Configuration from backend-dev.hcl
readonly BUCKET_NAME='sf-website-infrastructure'
readonly DYNAMODB_TABLE='sf-website-terraform-locks'
readonly AWS_REGION='us-east-1'

# Global variables
PROFILE=''

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Print colored output
print_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Get AWS CLI command with profile if specified
aws_cmd() {
  if [ -n "${PROFILE}" ]; then
    echo "aws --profile ${PROFILE}"
  else
    echo "aws"
  fi
}

# Check if AWS CLI is installed and configured
check_aws_cli() {
  if ! command -v aws &> /dev/null; then
    print_error 'AWS CLI is not installed'
    exit 1
  fi

  local aws_command
  aws_command=$(aws_cmd)
  
  # Check credentials by testing the command and capturing exit code
  if ${aws_command} sts get-caller-identity >/dev/null 2>&1; then
    if [ -n "${PROFILE}" ]; then
      print_info "Using AWS profile: ${PROFILE}"
    fi
  else
    if [ -n "${PROFILE}" ]; then
      print_error "AWS CLI profile '${PROFILE}' is not configured or credentials are invalid"
    else
      print_error 'AWS CLI is not configured or credentials are invalid'
    fi
    exit 1
  fi
}

# Check if S3 bucket exists
bucket_exists() {
  local aws_command
  aws_command=$(aws_cmd)
  ${aws_command} s3api head-bucket --bucket "${BUCKET_NAME}" \
    --region "${AWS_REGION}" 2>/dev/null
}

# Check if DynamoDB table exists
table_exists() {
  local aws_command
  aws_command=$(aws_cmd)
  ${aws_command} dynamodb describe-table --table-name "${DYNAMODB_TABLE}" \
    --region "${AWS_REGION}" &> /dev/null
}

# Create S3 bucket
create_s3_bucket() {
  if bucket_exists; then
    print_warning "S3 bucket '${BUCKET_NAME}' already exists"
    return 0
  fi

  print_info "Creating S3 bucket '${BUCKET_NAME}'..."
  
  local aws_command
  aws_command=$(aws_cmd)
  
  # Create bucket
  if [ "${AWS_REGION}" = 'us-east-1' ]; then
    ${aws_command} s3api create-bucket --bucket "${BUCKET_NAME}" \
      --region "${AWS_REGION}"
  else
    ${aws_command} s3api create-bucket --bucket "${BUCKET_NAME}" \
      --region "${AWS_REGION}" \
      --create-bucket-configuration LocationConstraint="${AWS_REGION}"
  fi

  # Enable versioning
  ${aws_command} s3api put-bucket-versioning --bucket "${BUCKET_NAME}" \
    --versioning-configuration Status=Enabled

  # Enable server-side encryption
  ${aws_command} s3api put-bucket-encryption --bucket "${BUCKET_NAME}" \
    --server-side-encryption-configuration '{
      "Rules": [
        {
          "ApplyServerSideEncryptionByDefault": {
            "SSEAlgorithm": "AES256"
          }
        }
      ]
    }'

  # Block public access
  ${aws_command} s3api put-public-access-block --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

  print_info "S3 bucket '${BUCKET_NAME}' created successfully"
}

# Create DynamoDB table
create_dynamodb_table() {
  if table_exists; then
    print_warning "DynamoDB table '${DYNAMODB_TABLE}' already exists"
    return 0
  fi

  print_info "Creating DynamoDB table '${DYNAMODB_TABLE}'..."
  
  local aws_command
  aws_command=$(aws_cmd)
  
  ${aws_command} dynamodb create-table \
    --table-name "${DYNAMODB_TABLE}" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "${AWS_REGION}"

  print_info "Waiting for DynamoDB table to be active..."
  ${aws_command} dynamodb wait table-exists --table-name "${DYNAMODB_TABLE}" \
    --region "${AWS_REGION}"

  print_info "DynamoDB table '${DYNAMODB_TABLE}' created successfully"
}

# Delete S3 bucket (including all objects and versions)
delete_s3_bucket() {
  if ! bucket_exists; then
    print_warning "S3 bucket '${BUCKET_NAME}' does not exist"
    return 0
  fi

  print_info "Deleting all objects from S3 bucket '${BUCKET_NAME}'..."
  
  local aws_command
  aws_command=$(aws_cmd)
  
  # Delete all object versions and delete markers
  ${aws_command} s3api list-object-versions --bucket "${BUCKET_NAME}" \
    --query 'Versions[].{Key:Key,VersionId:VersionId}' \
    --output text | while read -r key version_id; do
    if [ -n "${key}" ] && [ -n "${version_id}" ]; then
      ${aws_command} s3api delete-object --bucket "${BUCKET_NAME}" \
        --key "${key}" --version-id "${version_id}"
    fi
  done

  # Delete all delete markers
  ${aws_command} s3api list-object-versions --bucket "${BUCKET_NAME}" \
    --query 'DeleteMarkers[].{Key:Key,VersionId:VersionId}' \
    --output text | while read -r key version_id; do
    if [ -n "${key}" ] && [ -n "${version_id}" ]; then
      ${aws_command} s3api delete-object --bucket "${BUCKET_NAME}" \
        --key "${key}" --version-id "${version_id}"
    fi
  done

  print_info "Deleting S3 bucket '${BUCKET_NAME}'..."
  ${aws_command} s3api delete-bucket --bucket "${BUCKET_NAME}" \
    --region "${AWS_REGION}"

  print_info "S3 bucket '${BUCKET_NAME}' deleted successfully"
}

# Delete DynamoDB table
delete_dynamodb_table() {
  if ! table_exists; then
    print_warning "DynamoDB table '${DYNAMODB_TABLE}' does not exist"
    return 0
  fi

  print_info "Deleting DynamoDB table '${DYNAMODB_TABLE}'..."
  
  local aws_command
  aws_command=$(aws_cmd)
  
  ${aws_command} dynamodb delete-table --table-name "${DYNAMODB_TABLE}" \
    --region "${AWS_REGION}"

  print_info "Waiting for DynamoDB table to be deleted..."
  ${aws_command} dynamodb wait table-not-exists --table-name "${DYNAMODB_TABLE}" \
    --region "${AWS_REGION}"

  print_info "DynamoDB table '${DYNAMODB_TABLE}' deleted successfully"
}

# Show status of resources
show_status() {
  print_info 'Checking Terraform backend resources status...'
  
  if bucket_exists; then
    print_info "S3 bucket '${BUCKET_NAME}' exists"
  else
    print_warning "S3 bucket '${BUCKET_NAME}' does not exist"
  fi

  if table_exists; then
    print_info "DynamoDB table '${DYNAMODB_TABLE}' exists"
  else
    print_warning "DynamoDB table '${DYNAMODB_TABLE}' does not exist"
  fi
}

# Create all resources
create_resources() {
  print_info 'Creating Terraform backend resources...'
  create_s3_bucket
  create_dynamodb_table
  print_info 'All resources created successfully!'
}

# Delete all resources
delete_resources() {
  print_warning 'This will delete all Terraform backend resources!'
  read -p 'Are you sure? (yes/no): ' confirmation
  
  if [ "${confirmation}" != 'yes' ]; then
    print_info 'Operation cancelled'
    return 0
  fi

  print_info 'Deleting Terraform backend resources...'
  delete_s3_bucket
  delete_dynamodb_table
  print_info 'All resources deleted successfully!'
}

# Show usage
show_usage() {
  echo 'Usage: ./init-aws-for-terraform.sh [create|delete|status] [--profile PROFILE_NAME]'
  echo ''
  echo 'Commands:'
  echo '  create  - Create S3 bucket and DynamoDB table'
  echo '  delete  - Delete S3 bucket and DynamoDB table'
  echo '  status  - Show status of resources'
  echo ''
  echo 'Options:'
  echo '  --profile PROFILE_NAME  - Use specified AWS profile'
  echo ''
  echo 'Examples:'
  echo '  ./init-aws-for-terraform.sh create'
  echo '  ./init-aws-for-terraform.sh create --profile tf-sf-website'
  echo '  ./init-aws-for-terraform.sh status --profile tf-sf-website'
  echo ''
  echo 'Resources managed:'
  echo "  S3 Bucket: ${BUCKET_NAME}"
  echo "  DynamoDB Table: ${DYNAMODB_TABLE}"
  echo "  Region: ${AWS_REGION}"
}

# Main function
main() {
  local command=''
  
  # Parse arguments directly in main function
  while [ $# -gt 0 ]; do
    case "$1" in
      'create'|'delete'|'status'|'help'|'-h'|'--help')
        command="$1"
        shift
        ;;
      '--profile')
        if [ -n "$2" ]; then
          PROFILE="$2"
          shift 2
        else
          print_error 'Profile name is required after --profile'
          exit 1
        fi
        ;;
      *)
        print_error "Unknown argument: $1"
        show_usage
        exit 1
        ;;
    esac
  done
  
  check_aws_cli

  case "${command}" in
    'create')
      create_resources
      ;;
    'delete')
      delete_resources
      ;;
    'status')
      show_status
      ;;
    'help'|'-h'|'--help')
      show_usage
      ;;
    '')
      show_usage
      exit 1
      ;;
    *)
      print_error "Unknown command: ${command}"
      show_usage
      exit 1
      ;;
  esac
}

# Run main function with all arguments
main "$@" 