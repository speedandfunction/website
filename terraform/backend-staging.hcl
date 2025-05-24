# Backend configuration for Staging environment
bucket         = "sf-website-infrastructure"
key            = "terraform/terraform-staging.tfstate"
region         = "us-east-1"
dynamodb_table = "sf-website-terraform-locks"
encrypt        = true 