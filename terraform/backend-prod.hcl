# Backend configuration for Production environment
bucket         = "sf-website-terraform-state-prod"
key            = "prod/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "sf-website-terraform-locks"
encrypt        = true 