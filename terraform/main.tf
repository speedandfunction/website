# Terraform configuration for SF Website Infrastructure
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.4"
    }
  }
  
  backend "s3" {
    # Backend configuration will be provided via backend.hcl files
    # Example: terraform init -backend-config=backend-dev.hcl
  }
}

# AWS Provider Configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = var.default_tags
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Hardcoded availability zones for us-east-1 to avoid IAM permission issues
# Comment out if you have ec2:DescribeAvailabilityZones permission
# data "aws_availability_zones" "available" {
#   state = "available"
# }

# Random password for Redis auth token
resource "random_password" "redis_auth_token" {
  length  = 32
  special = true
}

# Local values for common naming
locals {
  name_prefix = "sf-website"
  environment = var.environment
  
  # Hardcoded availability zones for us-east-1 (first 2)
  # Change this if using a different region
  azs = ["us-east-1a", "us-east-1b"]
  
  # If you have ec2:DescribeAvailabilityZones permission, uncomment this line and comment the one above:
  # azs = slice(data.aws_availability_zones.available.names, 0, 2)
  
  # Common tags for all resources
  common_tags = merge(var.default_tags, {
    Environment = var.environment
    Project     = "Website"
    CostCenter  = "Website"
    Owner       = "peter.ovchyn"
  })
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  vpc_cidr = var.vpc_cidr
  azs      = local.azs
  
  tags = local.common_tags
}

# Security Groups Module
module "security_groups" {
  source = "./modules/security_groups"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  vpc_id = module.vpc.vpc_id
  
  tags = local.common_tags
}

# S3 Module
module "s3" {
  source = "./modules/s3"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  tags = local.common_tags
}

# IAM Module
module "iam" {
  source = "./modules/iam"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  s3_attachments_bucket_arn = module.s3.attachments_bucket_arn
  ecr_repository_arn        = module.ecr.repository_arn
  
  # GitHub Actions configuration
  github_repo = var.github_repository
  
  tags = local.common_tags
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  tags = local.common_tags
}

# Parameter Store Module
module "parameter_store" {
  source = "./modules/parameter_store"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  # Secrets from tfvars
  documentdb_master_username = var.documentdb_master_username
  documentdb_master_password = var.documentdb_master_password
  session_secret            = var.session_secret
  
  # Auto-generated Redis auth token
  redis_auth_token = random_password.redis_auth_token.result
  
  # Optional Google Cloud Storage key
  gcs_service_account_key = var.gcs_service_account_key
  
  tags = local.common_tags
}

# DocumentDB Module
module "documentdb" {
  source = "./modules/documentdb"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  vpc_id                    = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnet_ids
  security_group_ids       = [module.security_groups.documentdb_sg_id]
  
  master_username = var.documentdb_master_username
  master_password = var.documentdb_master_password
  
  tags = local.common_tags
}

# ElastiCache Redis Module
module "redis" {
  source = "./modules/redis"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  vpc_id                    = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnet_ids
  security_group_ids       = [module.security_groups.redis_sg_id]
  
  auth_token = random_password.redis_auth_token.result
  
  tags = local.common_tags
}

# ALB Module
module "alb" {
  source = "./modules/alb"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  vpc_id             = module.vpc.vpc_id
  subnet_ids        = module.vpc.public_subnet_ids
  security_group_ids = [module.security_groups.alb_sg_id]
  
  domain_name     = var.domain_name
  certificate_arn = var.certificate_arn
  
  tags = local.common_tags
}

# CloudFront Module
module "cloudfront" {
  source = "./modules/cloudfront"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  s3_bucket_domain_name = module.s3.attachments_bucket_domain_name
  s3_bucket_id         = module.s3.attachments_bucket_id
  
  media_domain_name = var.media_domain_name
  certificate_arn   = var.certificate_arn
  
  tags = local.common_tags
}

# ECS Module
module "ecs" {
  source = "./modules/ecs"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  vpc_id             = module.vpc.vpc_id
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_ids = [module.security_groups.ecs_sg_id]
  
  # Service configuration
  ecr_repository_url = module.ecr.repository_url
  task_role_arn      = module.iam.ecs_task_role_arn
  execution_role_arn = module.iam.ecs_execution_role_arn
  
  # Target group for ALB
  target_group_arn = module.alb.target_group_arn
  
  # Environment variables
  environment_variables = {
    NODE_ENV                   = "production"
    APOS_MONGODB_URI          = "mongodb://${module.documentdb.cluster_endpoint}:27017/apostrophe"
    REDIS_URI                 = "redis://${module.redis.cluster_endpoint}:6379"
    BASE_URL                  = "https://${var.domain_name}"
    APOS_S3_BUCKET           = module.s3.attachments_bucket_id
    APOS_S3_REGION           = var.aws_region
    APOS_CDN_URL             = "https://${var.media_domain_name}"
    APOS_CDN_ENABLED         = "true"
  }
  
  # Secrets from Parameter Store
  secrets = {
    SESSION_SECRET               = module.parameter_store.session_secret_arn
    SERVICE_ACCOUNT_PRIVATE_KEY = module.parameter_store.gcs_service_account_key_arn
  }
  
  tags = local.common_tags
}

# CloudWatch Module
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  name_prefix = local.name_prefix
  environment = local.environment
  
  # Resources to monitor
  ecs_cluster_name     = module.ecs.cluster_name
  ecs_service_name     = module.ecs.service_name
  alb_arn_suffix       = module.alb.arn_suffix
  documentdb_cluster_id = module.documentdb.cluster_identifier
  redis_cluster_id     = module.redis.cluster_id
  
  # Slack webhook for notifications
  slack_webhook_url = var.slack_webhook_url
  
  tags = local.common_tags
} 