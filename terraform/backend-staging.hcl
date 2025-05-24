# Backend configuration for Staging environment
bucket         = "sf-website-terraform-state"
key            = "staging/terraform.tfstate"
region         = "us-east-1"
dynamodb_table = "sf-website-terraform-locks"
encrypt        = true 