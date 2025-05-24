# Backend configuration for Development environment
bucket         = "sf-website-terraform-state-dev"
key            = "dev/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "sf-website-terraform-locks"
encrypt        = true 