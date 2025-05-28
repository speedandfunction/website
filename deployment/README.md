# SF Website Infrastructure - Terraform

This Terraform configuration implements the complete infrastructure for the SF Website project as documented in `docs/Infrastructure.md`.

## 🏗️ **Architecture Overview**

- **VPC**: Multi-AZ setup with public/private subnets
- **ECS Fargate**: Containerized ApostropheCMS application  
- **DocumentDB**: MongoDB-compatible database
- **ElastiCache Redis**: Session storage and caching
- **S3**: Media attachments and logs storage
- **CloudFront**: CDN for media delivery
- **ALB**: Load balancer with SSL termination
- **CloudWatch**: Monitoring and alerting

## 📋 **Prerequisites**

1. **AWS CLI** configured with appropriate permissions
2. **Terraform** >= 1.0 installed
3. **S3 buckets** for Terraform state storage (see Backend Setup)
4. **SSL Certificate** in AWS Certificate Manager
5. **Route 53 hosted zone** (optional)

## 🚀 **Quick Start**

### 1. **Clone and Setup**
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

### 2. **Configure Variables**
Edit `terraform.tfvars` with your specific values:
- Domain names
- Certificate ARN
- Database credentials
- GitHub repository
- Slack webhook URL

### 3. **Setup Backend Storage**
Create S3 buckets and DynamoDB table for state management:
```bash
# Create S3 buckets for each environment
aws s3 mb s3://sf-website-terraform-state-development
aws s3 mb s3://sf-website-terraform-state-staging  
aws s3 mb s3://sf-website-terraform-state-production

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket sf-website-terraform-state-development \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name sf-website-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 4. **Initialize and Deploy**
```bash
# Initialize with backend
terraform init -backend-config=backend-development.hcl

# Plan deployment
terraform plan

# Apply changes
terraform apply
```

## 🌍 **Environment Management**

Deploy different environments using different backend configurations:

```bash
# Development
terraform init -backend-config=backend-development.hcl
terraform apply -var-file=development.tfvars

# Staging  
terraform init -backend-config=backend-staging.hcl
terraform apply -var-file=staging.tfvars

# Production
terraform init -backend-config=backend-production.hcl
terraform apply -var-file=production.tfvars
```

## 📁 **File Structure**

```
terraform/
├── main.tf                    # Main configuration
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output values
├── terraform.tfvars.example   # Example variables
├── backend-{env}.hcl          # Backend configurations
├── modules/
│   ├── vpc/                   # VPC and networking
│   ├── security_groups/       # Security groups
│   ├── s3/                    # S3 buckets
│   ├── iam/                   # IAM roles and policies
│   ├── ecr/                   # Container registry
│   ├── parameter_store/       # Secrets management
│   ├── documentdb/            # Database cluster
│   ├── redis/                 # Cache cluster
│   ├── alb/                   # Load balancer
│   ├── cloudfront/            # CDN
│   ├── ecs/                   # Container service
│   └── cloudwatch/            # Monitoring
└── README.md                  # This file
```

## 🔐 **Security Best Practices**

### **Secrets Management**
- All sensitive values are stored in AWS Parameter Store
- Database credentials are provided via tfvars (never committed)
- Redis auth token is auto-generated

### **Network Security**
- Private subnets for all data services
- Security groups with least-privilege access
- VPC Flow Logs enabled

### **IAM Security**
- Separate roles for ECS tasks and execution
- GitHub Actions OIDC integration (no long-term keys)
- Scoped permissions for each service

## 🏷️ **Resource Naming**

All resources follow the naming convention:
```
sf-website-{resource-type}-{environment}
```

Examples:
- `sf-website-vpc-development`
- `sf-website-ecs-cluster-production`
- `sf-website-documentdb-staging`

## 📊 **Monitoring & Alerts**

CloudWatch alarms are configured for:
- ECS CPU/Memory utilization
- DocumentDB connections and performance
- Redis memory usage and hit ratio
- ALB response times and error rates

Alerts are sent to Slack via webhook URL.

## 🔄 **CI/CD Integration**

The configuration includes IAM roles for GitHub Actions:
- **Terraform Role**: Deploy infrastructure changes
- **ECR Push Role**: Build and push container images

Example GitHub Actions workflow:
```yaml
name: Deploy Infrastructure
on:
  push:
    branches: [main]
    paths: ['terraform/**']

jobs:
  terraform:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
          
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        
      - name: Terraform Init
        run: terraform init -backend-config=backend-production.hcl
        
      - name: Terraform Apply
        run: terraform apply -auto-approve
```

## 📋 **Common Commands**

```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Plan with specific var file
terraform plan -var-file=production.tfvars

# Show current state
terraform show

# List resources
terraform state list

# Import existing resource
terraform import aws_s3_bucket.example bucket-name

# Destroy environment (BE CAREFUL!)
terraform destroy
```

## 🔧 **Customization**

### **Environment-Specific Variables**
Create separate tfvars files for each environment:
- `development.tfvars`
- `staging.tfvars` 
- `production.tfvars`

### **Scaling Configuration**
Adjust container resources and auto-scaling:
```hcl
# For production
container_cpu      = 2048  # 2 vCPU
container_memory   = 4096  # 4 GB
ecs_desired_count  = 2
ecs_max_capacity   = 10
```

### **Database Sizing**
Configure instance types per environment:
```hcl
# Development
documentdb_instance_class = "db.t3.medium"
redis_node_type          = "cache.t3.micro"

# Production  
documentdb_instance_class = "db.r5.large"
redis_node_type          = "cache.r6g.large"
```

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Backend bucket doesn't exist**
   ```bash
   aws s3 mb s3://sf-website-terraform-state-development
   ```

2. **Certificate ARN invalid**
   - Verify certificate exists in correct region
   - Ensure certificate covers required domains

3. **State lock conflicts**
   ```bash
   terraform force-unlock LOCK_ID
   ```

4. **Module source errors**
   ```bash
   terraform get -update
   ```

### **Getting Help**
- Check AWS CloudTrail for API errors
- Review CloudWatch logs for application issues
- Validate Terraform syntax: `terraform validate`

## 📈 **Cost Optimization**

- Use `t3.micro` instances for development
- Schedule ECS tasks to scale down during off-hours
- Enable S3 lifecycle policies for log retention
- Consider Reserved Instances for production

## 🔄 **Updates and Maintenance**

1. **Provider Updates**: Regularly update AWS provider version
2. **Module Updates**: Test module changes in development first
3. **State Backup**: S3 versioning provides automatic backups
4. **Security Updates**: Monitor AWS security bulletins

---

**Next Steps**: After deploying infrastructure, configure your CI/CD pipeline to build and deploy the ApostropheCMS application to the created ECS cluster.

# Terraform Infrastructure Setup

This directory contains the Terraform configuration and initialization scripts for the SF Website infrastructure.

## Quick Start

### Initialize AWS Resources

The `init-aws-for-terraform.sh` script manages the Terraform backend resources (S3 bucket and DynamoDB table).

```bash
# Create resources
./init-aws-for-terraform.sh create --profile tf-sf-website

# Check status
./init-aws-for-terraform.sh status --profile tf-sf-website

# Delete resources (interactive)
./init-aws-for-terraform.sh delete --profile tf-sf-website

# Delete resources (non-interactive for automation)
TERRAFORM_NON_INTERACTIVE=true ./init-aws-for-terraform.sh delete --profile tf-sf-website
```

### Non-Interactive Mode

The script supports non-interactive mode for automation and CI/CD pipelines:

- Set `TERRAFORM_NON_INTERACTIVE=true` environment variable
- The script will automatically skip confirmation prompts
- Useful for automated deployments and scripts

### Error Handling

The script includes robust error handling:

- Proper AWS CLI profile support
- Graceful handling of existing resources
- Suppression of spurious AWS CLI configuration errors
- Clear status reporting and logging

## Script Features

- ✅ **Non-interactive support** - No user prompts when `TERRAFORM_NON_INTERACTIVE=true`
- ✅ **AWS Profile support** - Works with named AWS profiles
- ✅ **Error suppression** - Filters out spurious AWS CLI configuration errors
- ✅ **Resource validation** - Checks if resources exist before creating/deleting
- ✅ **Comprehensive logging** - Clear status messages and error reporting
- ✅ **Safe deletion** - Confirms before deleting resources (unless non-interactive)

## Resources Managed

- **S3 Bucket**: `sf-website-infrastructure` (with versioning and encryption)
- **DynamoDB Table**: `sf-website-terraform-locks` (for state locking)
- **Region**: `us-east-1` 