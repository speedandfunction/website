#!/bin/bash

# Script to manage Terraform backend resources (S3 bucket)
# Usage: ./init-aws-for-terraform.sh [create|delete|status] [--profile PROFILE_NAME]

set -e

# Configuration from backend-dev.hcl
BUCKET_NAME="${BUCKET_NAME:-sf-website-infrastructure}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Global variables
AWS_PROFILE="${AWS_PROFILE:-}"

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

# Execute AWS command with proper profile handling and error suppression
aws_exec() {
  if [ -n "${AWS_PROFILE}" ]; then
    # Suppress spurious head/cat errors that occur with some AWS CLI configurations
    aws --profile "${AWS_PROFILE}" "$@" 2> >(grep -v "head:" | grep -v "cat:" >&2)
  else
    aws "$@" 2> >(grep -v "head:" | grep -v "cat:" >&2)
  fi
}

# Check if AWS CLI is installed and configured
check_aws_cli() {
  if ! command -v aws &> /dev/null; then
    print_error 'AWS CLI is not installed'
    exit 1
  fi

  # Check credentials by testing the command and capturing exit code
  if aws_exec sts get-caller-identity >/dev/null 2>&1; then
    if [ -n "${AWS_PROFILE}" ]; then
      print_info "Using AWS profile: ${AWS_PROFILE}"
    fi
  else
    if [ -n "${AWS_PROFILE}" ]; then
      print_error "AWS CLI profile '${AWS_PROFILE}' is not configured or credentials are invalid"
    else
      print_error 'AWS CLI is not configured or credentials are invalid'
    fi
    exit 1
  fi
}

# Check if S3 bucket exists
bucket_exists() {
  aws_exec s3api head-bucket --bucket "${BUCKET_NAME}" \
    --region "${AWS_REGION}" >/dev/null 2>&1
  return $?
}

# Create S3 bucket
create_s3_bucket() {
  if bucket_exists; then
    print_warning "S3 bucket '${BUCKET_NAME}' already exists"
    return 0
  fi

  print_info "Creating S3 bucket '${BUCKET_NAME}'..."
  
  # Create bucket
  if [ "${AWS_REGION}" = 'us-east-1' ]; then
    aws_exec s3api create-bucket --bucket "${BUCKET_NAME}" \
      --region "${AWS_REGION}"
  else
    aws_exec s3api create-bucket --bucket "${BUCKET_NAME}" \
      --region "${AWS_REGION}" \
      --create-bucket-configuration LocationConstraint="${AWS_REGION}"
  fi

  # Enable versioning
  aws_exec s3api put-bucket-versioning --bucket "${BUCKET_NAME}" \
    --versioning-configuration Status=Enabled

  # Enable server-side encryption
  aws_exec s3api put-bucket-encryption --bucket "${BUCKET_NAME}" \
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
  aws_exec s3api put-public-access-block --bucket "${BUCKET_NAME}" \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

  print_info "S3 bucket '${BUCKET_NAME}' created successfully"
}

# Delete S3 bucket (including all objects and versions)
delete_s3_bucket() {
  if ! bucket_exists; then
    print_warning "S3 bucket '${BUCKET_NAME}' does not exist"
    return 0
  fi

  print_info "Deleting all objects from S3 bucket '${BUCKET_NAME}'..."
  
  # Delete all object versions and delete markers
  aws_exec s3api list-object-versions --bucket "${BUCKET_NAME}" \
    --query 'Versions[].{Key:Key,VersionId:VersionId}' \
    --output text | while read -r key version_id; do
    if [ -n "${key}" ] && [ -n "${version_id}" ]; then
      aws_exec s3api delete-object --bucket "${BUCKET_NAME}" \
        --key "${key}" --version-id "${version_id}"
    fi
  done

  # Delete all delete markers
  aws_exec s3api list-object-versions --bucket "${BUCKET_NAME}" \
    --query 'DeleteMarkers[].{Key:Key,VersionId:VersionId}' \
    --output text | while read -r key version_id; do
    if [ -n "${key}" ] && [ -n "${version_id}" ]; then
      aws_exec s3api delete-object --bucket "${BUCKET_NAME}" \
        --key "${key}" --version-id "${version_id}"
    fi
  done

  print_info "Deleting S3 bucket '${BUCKET_NAME}'..."
  aws_exec s3api delete-bucket --bucket "${BUCKET_NAME}" \
    --region "${AWS_REGION}"

  print_info "S3 bucket '${BUCKET_NAME}' deleted successfully"
}

# Show status of resources
show_status() {
  print_info 'Checking Terraform backend resources status...'
  
  if bucket_exists; then
    print_info "S3 bucket '${BUCKET_NAME}' exists"
  else
    print_warning "S3 bucket '${BUCKET_NAME}' does not exist"
  fi
}

# Create all resources
create_resources() {
  print_info 'Creating Terraform backend resources...'
  create_s3_bucket
  print_info 'All resources created successfully!'
}

# Delete all resources with automatic confirmation for non-interactive use
delete_resources() {
  # Check if running in non-interactive mode (for automation)
  if [ "${TERRAFORM_NON_INTERACTIVE:-false}" = "true" ] || [ ! -t 0 ]; then
    print_warning 'Running in non-interactive mode, skipping confirmation...'
    confirmation="yes"
  else
    print_warning 'This will delete all Terraform backend resources!'
    read -p 'Are you sure? (yes/no): ' confirmation
  fi
  
  if [ "${confirmation}" != 'yes' ]; then
    print_info 'Operation cancelled'
    return 0
  fi

  print_info 'Deleting Terraform backend resources...'
  delete_s3_bucket
  print_info 'All resources deleted successfully!'
}

# Show usage
show_usage() {
  echo 'Usage: ./init-aws-for-terraform.sh [create|delete|status] [--profile PROFILE_NAME]'
  echo ''
  echo 'Commands:'
  echo '  create  - Create S3 bucket'
  echo '  delete  - Delete S3 bucket'
  echo '  status  - Show status of resources'
  echo ''
  echo 'Options:'
  echo '  --profile PROFILE_NAME  - Use specified AWS profile'
  echo ''
  echo 'Environment Variables:'
  echo '  AWS_PROFILE            - AWS profile to use (can be overridden by --profile)'
  echo '  BUCKET_NAME            - S3 bucket name (default: sf-website-infrastructure)'
  echo '  AWS_REGION             - AWS region (default: us-east-1)'
  echo ''
  echo 'Examples:'
  echo '  ./init-aws-for-terraform.sh create'
  echo '  ./init-aws-for-terraform.sh create --profile tf-sf-website'
  echo '  ./init-aws-for-terraform.sh status --profile tf-sf-website'
  echo '  AWS_PROFILE=tf-sf-website ./init-aws-for-terraform.sh create'
  echo '  BUCKET_NAME=my-terraform-state AWS_REGION=us-west-2 ./init-aws-for-terraform.sh create'
  echo ''
  echo 'Resources managed:'
  echo "  S3 Bucket: ${BUCKET_NAME}"
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
          AWS_PROFILE="$2"
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