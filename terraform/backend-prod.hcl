# Backend configuration for Prod environment
bucket         = "sf-website-infrastructure"
key            = "terraform/terraform-prod.tfstate"
region         = "us-east-1"
dynamodb_table = "sf-website-terraform-locks"
encrypt        = true 