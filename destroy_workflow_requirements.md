# AWS Environment Destroy Workflow Requirements

## Overview
Create a GitHub Actions workflow to destroy AWS environments created by the "Deploy to AWS" workflow.

## Trigger Configuration
- **Manual trigger only**: `workflow_dispatch` 
- **No automatic triggers**: Only humans can initiate the workflow
- **Environment selection**: Human selects environment when initiating workflow

## Environment Support
- **Current scope**: Development environment only
- **Future scope**: Staging and Production environments are not ready yet
- **Environment source**: Match existing deploy workflow environment configuration

## Safety Measures
### Approval Process
- **Method**: Use Manual Workflow Approval action (`trstringer/manual-approval@v1`)
- **Approver**: @killev (GitHub username)
- **Minimum approvals**: 1 approval required
- **Process**: Creates GitHub issue assigned to approver, requires "approve"/"deny" response

### Confirmation Requirements
- **No manual confirmation typing**: User does not need to type "DESTROY" or environment name
- **Plan-only option**: Include "destroy plan only" option to preview what will be destroyed
- **Safety warnings**: Display warnings about what will be destroyed in approval issue

## Workflow Structure
### Job 1: destroy-plan
- Run `terraform destroy -plan` 
- Show what resources would be destroyed
- Store destroy plan file in S3 bucket
- Always runs when workflow is triggered

### Job 2: manual-approval  
- Use `trstringer/manual-approval@v1` action
- Create GitHub issue assigned to @killev
- Require 1 approval to proceed
- Only runs if `destroy-plan-only` is false

### Job 3: destroy-apply
- Execute actual infrastructure destruction using stored plan
- Only runs after approval
- Only runs if `destroy-plan-only` is false

## Technical Configuration
### AWS Configuration
- **Region**: us-east-1
- **Credentials**: Same as deploy workflow (`TF_AWS_ACCESS_KEY_ID`, `TF_AWS_SECRET_ACCESS_KEY`)
- **S3 bucket**: sf-website-infrastructure (for storing plans)

### Terraform Configuration  
- **Version**: 1.12.0
- **Backend**: Use same backend configuration as deploy workflow
- **Directory**: `deployment/`
- **Backend config**: `environments/backend-Development.hcl`

### Workflow Inputs
```yaml
environment:
  description: 'Environment to destroy'
  required: true
  type: choice
  options:
    - Development
  default: Development

destroy-plan-only:
  description: 'Plan only (show what would be destroyed without destroying)'
  required: false
  type: boolean
  default: false
```

## Infrastructure Scope
Based on existing Terraform configuration, the workflow will destroy:
- VPC and networking components
- ECS cluster and services  
- DocumentDB cluster
- ElastiCache Redis cluster
- Application Load Balancer
- CloudFront distribution
- S3 buckets
- ECR repository
- IAM roles and policies
- CloudWatch resources
- Parameter Store secrets

## Security Considerations
- Manual approval required before destruction
- Only authorized approver (@killev) can approve
- Plan-only option allows safe preview
- No automatic triggers prevent accidental execution
- Uses same secure credential management as deploy workflow
- Clear audit trail via GitHub issues
- Workflow will wait indefinitely for approval (subject to 35-day GitHub limit)

## Setup Requirements
- **Permissions**: Workflow needs `issues: write` permission to create approval issues
- **Approver access**: @killev must have repository access to comment on issues
- **No additional environment setup required**

## File Location
- **Path**: `.github/workflows/destroy_aws_environment.yml`
- **Repository**: Same repository as existing deploy workflow 