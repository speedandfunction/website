# Backend configuration for Development environment
bucket         = "sf-website-infrastructure"
key            = "terraform/terraform-dev.tfstate"
region         = "us-east-1"
dynamodb_table = "sf-website-terraform-locks"
encrypt        = true 