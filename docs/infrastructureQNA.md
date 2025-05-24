# Infrastructure Q&A for Terraform Implementation

## Questions and Answers

### Q1: Certificate ARNs
**Question**: What are the actual ARN values for your existing SSL certificates?
- Main app certificates: `sf-website-{env}.sandbox-prettyclear.com`
- Media certificates: `sf-website-media-{env}.sandbox-prettyclear.com`

**Answer**: Wildcard certificate `*.sandbox-prettyclear.com` covers all subdomains
**ARN**: `arn:aws:acm:us-east-1:548271326349:certificate/7e11016f-f90e-4800-972d-622bf1a82948`

---

### Q2: Route 53 Hosted Zone ID
**Question**: What's the hosted zone ID for `sandbox-prettyclear.com`?

**Answer**: [Skipped for now - will address later]

---

### Q3: Parameter Store Secrets
**Question**: Should I generate these automatically or do you have specific values?
- DocumentDB master username/password
- SESSION_SECRET
- Any other app secrets?

**Answer**: 
- **DocumentDB master username/password**: Store in tfvars files
- **SESSION_SECRET**: User will provide specific value in tfvars
- **Other secrets**: Based on docker-compose.yml:
  - **REDIS_URI**: Will be auto-generated (ElastiCache endpoint)
  - **BASE_URL**: Will be auto-generated from ALB domain
  - **SERVICE_ACCOUNT_PRIVATE_KEY**: User will provide if using Google Cloud Storage
  - **NODE_ENV**: Will be set to 'production'

---

### Q4: Deployment Scope
**Question**: Should I create Terraform to deploy all three environments at once, or one environment at a time (which one first)?

**Answer**: Terraform script should create 1 environment at a time. Environment should be specified via tfvars file.

---

### Q5: Remote State
**Question**: Do you want S3 backend for Terraform state storage?

**Answer**: Yes, use S3 bucket for Terraform state storage with DynamoDB for state locking.

---

### Q6: CI/CD Integration
**Question**: Do you need IAM roles for GitHub Actions to deploy?

**Answer**: Yes, include all 3:
- IAM role that GitHub Actions can assume
- Permissions for Terraform operations (creating/updating resources)  
- ECR permissions for pushing Docker images

---

### Q7: CloudWatch Alerts
**Question**: For notifications, do you have Slack webhook URLs, or should I create SNS topics instead?

**Answer**: Slack webhook URLs - should be provided in tfvars file 