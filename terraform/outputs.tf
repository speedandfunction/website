# Outputs for SF Website Infrastructure

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

# S3 Outputs
output "attachments_bucket_name" {
  description = "Name of the S3 attachments bucket"
  value       = module.s3.attachments_bucket_id
}

output "logs_bucket_name" {
  description = "Name of the S3 logs bucket"
  value       = module.s3.logs_bucket_id
}

# ECR Outputs
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = module.ecr.repository_url
}

output "ecr_repository_arn" {
  description = "ARN of the ECR repository"
  value       = module.ecr.repository_arn
}

# ALB Outputs
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.alb.alb_zone_id
}

output "domain_name" {
  description = "Domain name for the application"
  value       = var.domain_name
}

# CloudFront Outputs
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.distribution_domain_name
}

output "media_domain_name" {
  description = "Domain name for media CDN"
  value       = var.media_domain_name
}

# Database Outputs
output "documentdb_cluster_endpoint" {
  description = "DocumentDB cluster endpoint"
  value       = module.documentdb.cluster_endpoint
  sensitive   = true
}

# Cache Outputs
output "redis_cluster_endpoint" {
  description = "ElastiCache Redis cluster endpoint"
  value       = module.redis.cluster_endpoint
  sensitive   = true
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

# IAM Outputs
output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = module.iam.ecs_task_role_arn
}

output "ecs_execution_role_arn" {
  description = "ARN of the ECS execution role"
  value       = module.iam.ecs_execution_role_arn
}

output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions IAM role"
  value       = module.iam.github_actions_role_arn
}

# Security Group Outputs
output "security_groups" {
  description = "Security group IDs"
  value = {
    alb        = module.security_groups.alb_sg_id
    ecs        = module.security_groups.ecs_sg_id
    documentdb = module.security_groups.documentdb_sg_id
    redis      = module.security_groups.redis_sg_id
  }
}

# Application URLs
output "application_url" {
  description = "URL to access the application"
  value       = "https://${var.domain_name}"
}

output "media_url" {
  description = "URL for media assets"
  value       = "https://${var.media_domain_name}"
}

# Environment Information
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
} 