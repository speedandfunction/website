# Variables for SF Website Infrastructure

# General Configuration
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod, qa, demo, sandbox, etc.)"
  type        = string
}

variable "default_tags" {
  description = "Default tags to apply to all resources"
  type        = map(string)
  default = {
    Project    = "Website"
    CostCenter = "Website"
    Owner      = "peter.ovchyn"
  }
}

# Networking Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
  
  validation {
    condition = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application (e.g., sf-website-dev.sandbox-prettyclear.com)"
  type        = string
}

variable "media_domain_name" {
  description = "Domain name for media CDN (e.g., sf-website-media-dev.sandbox-prettyclear.com)"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of the SSL certificate from ACM"
  type        = string
}

# Database Configuration
variable "documentdb_master_username" {
  description = "Master username for DocumentDB cluster"
  type        = string
  sensitive   = true
}

variable "documentdb_master_password" {
  description = "Master password for DocumentDB cluster"
  type        = string
  sensitive   = true
  
  validation {
    condition = length(var.documentdb_master_password) >= 8
    error_message = "DocumentDB master password must be at least 8 characters long."
  }
}

# Application Secrets
variable "session_secret" {
  description = "Secret key for session management"
  type        = string
  sensitive   = true
  
  validation {
    condition = length(var.session_secret) >= 32
    error_message = "Session secret must be at least 32 characters long."
  }
}

variable "gcs_service_account_key" {
  description = "Google Cloud Storage service account private key (optional)"
  type        = string
  default     = ""
  sensitive   = true
}

# GitHub Actions Configuration
variable "github_repository" {
  description = "GitHub repository in the format 'owner/repo' for OIDC integration"
  type        = string
}

# Monitoring Configuration
variable "slack_webhook_url" {
  description = "Slack webhook URL for CloudWatch alerts"
  type        = string
  sensitive   = true
}

# Route 53 Configuration (optional)
variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for DNS records"
  type        = string
  default     = ""
}

# Container Configuration
variable "container_image_tag" {
  description = "Container image tag to deploy"
  type        = string
  default     = "latest"
}

variable "container_cpu" {
  description = "CPU units for the container (1024 = 1 vCPU)"
  type        = number
  default     = 1024
  
  validation {
    condition = contains([256, 512, 1024, 2048, 4096], var.container_cpu)
    error_message = "Container CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "container_memory" {
  description = "Memory in MB for the container"
  type        = number
  default     = 2048
  
  validation {
    condition = var.container_memory >= 512 && var.container_memory <= 30720
    error_message = "Container memory must be between 512 and 30720 MB."
  }
}

# Scaling Configuration
variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
  
  validation {
    condition = var.ecs_desired_count >= 1 && var.ecs_desired_count <= 10
    error_message = "ECS desired count must be between 1 and 10."
  }
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks for auto-scaling"
  type        = number
  default     = 3
  
  validation {
    condition = var.ecs_max_capacity >= var.ecs_desired_count
    error_message = "ECS max capacity must be greater than or equal to desired count."
  }
}

# Environment-specific Instance Types
variable "documentdb_instance_class" {
  description = "DocumentDB instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
} 