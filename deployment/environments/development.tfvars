# Example Terraform Variables for SF Website Infrastructure
# Copy this file to terraform.tfvars and customize the values

# General Configuration
aws_region  = "us-east-1"
environment = "development"  # Can be any name: development, staging, production, qa, demo, sandbox, etc.

apos_release_id = "v1.0.0(0)"
# Domain Configuration
domain_name       = "sf-website-development.sandbox-prettyclear.com"
media_domain_name = "sf-website-media-development.sandbox-prettyclear.com"
certificate_arn   = "arn:aws:acm:us-east-1:695912022152:certificate/3dd0c51e-6749-485b-95f8-c92a4950ac93"

# GitHub Actions Configuration
github_repository = "speedandfunction/website"  # Format: owner/repo

# Monitoring Configuration (SENSITIVE)
slack_webhook_url = ""

# Optional: Route 53 Configuration
route53_zone_id = "Z031220720LW1I1AB9GUY"  # Leave empty to skip DNS record creation

# Container Configuration
container_image_tag = "latest"
container_cpu      = 1024  # 1024 = 1 vCPU
container_memory   = 2048  # 2048 MB = 2 GB
container_port     = 3000  # Application port
log_retention_days = 7     # CloudWatch log retention

# Scaling Configuration
ecs_desired_count = 1
ecs_max_capacity  = 3

# Environment-specific Instance Types
documentdb_instance_class = "db.t3.micro"
redis_node_type          = "cache.t3.micro"  # cache.t3.small for production

# Tags
default_tags = {
  Project    = "Website"
  Environment = "development"
  CostCenter = "Website"
  Owner      = "peter.ovchyn"
} 