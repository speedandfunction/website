## ✅ Final Terraform Infrastructure Plan

### 🌍 General

* **AWS Region**: `us-east-1`
* **Environments**: `dev`, `staging`, `prod`
* **Domain**: `sf-website-<env>.prettyclear.com`
* **Structure**: Modular Terraform setup for multi-environment support
* **Resource Tags** (applied to all resources):

  * `Name: sf-website-<resource>-<env>`
  * `Project: Website`
  * `CostCenter: Website`
  * `Environment: <environment>`
  * `Owner: peter.ovchyn`

---

### 🪣 Amazon S3

* **Attachments Bucket**:
  * **Bucket Name**: `sf-website-s3-attachments-<env>`
  * **Purpose**: Stores media assets and uploaded files for Apostrophe CMS
  * **Resource Tags**:
    * `Name: sf-website-s3-attachments-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * CloudFront Distribution (origin for media delivery)
    * ECS Cluster (via APOS_S3_BUCKET environment variable)
  * **Access**: Private access, accessible only through application
  * **Connection**: Referenced in `APOS_S3_BUCKET` environment variable
  * **Lifecycle Rules**:
    * Transition infrequently accessed objects to Standard-IA after 30 days
    * Archive older assets to Glacier after 90 days (optional)
  * **Versioning**: Enabled with 30-day expiration for non-current versions
  * **Encryption**: Server-side encryption with Amazon S3-managed keys (SSE-S3)
  * **CORS**: Configured to allow uploads from application domain

* **Logs Bucket**:
  * **Bucket Name**: `sf-website-s3-logs-<env>`
  * **Purpose**: Centralized logging for all infrastructure components
  * **Resource Tags**:
    * `Name: sf-website-s3-logs-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * S3 buckets (log delivery)
    * CloudFront distributions (log delivery)
    * Load Balancer (log delivery)
    * ECS tasks (log delivery)
    * Athena (optional for log analysis)
  * **Access**: Private, restricted to log delivery services and administrators
  * **Lifecycle Rules**: 
    * Transition to Glacier after 90 days
    * Expire after 365 days
  * **Encryption**: Server-side encryption (SSE-S3)

---

### 👤 IAM (Identity and Access Management)

* **ECS Task Role**:
  * **Role Name**: `sf-website-ecs-task-<env>`
  * **Purpose**: Grants the application running in the container specific permissions to AWS services
  * **Resource Tags**:
    * `Name: sf-website-ecs-task-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * ECS Fargate Tasks
    * S3 Attachments Bucket
  * **Permissions**: S3 permissions limited to only required operations on specific buckets
  * **Trust Policy**: Allows only `ecs-tasks.amazonaws.com` to assume the role
  
* **ECS Task Execution Role**:
  * **Role Name**: `sf-website-ecs-execution-<env>`
  * **Purpose**: Grants permissions to the ECS service to pull container images and send logs
  * **Resource Tags**:
    * `Name: sf-website-ecs-execution-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * ECS Service
    * ECR Repository
    * Parameter Store
  * **Permissions**: Based on the `AmazonECSTaskExecutionRolePolicy` managed policy
  * **Access**: Allows reading from Parameter Store for secrets

* **S3 Bucket Access Policy**:
  * **Policy Name**: `sf-website-s3-access-<env>`
  * **Purpose**: Provides specific S3 access permissions to ECS tasks
  * **Resource Tags**:
    * `Name: sf-website-s3-access-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * ECS Task Role
    * S3 Attachments Bucket
  * **Permissions**:
    * `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on specific paths
    * `s3:ListBucket` on the bucket
    * Scoped to specific environment's bucket only

---

### 🐳 Amazon ECR

* **Apostrophe Repository**: 
  * **Repository Name**: `sf-website-ecr-<env>`
  * **Purpose**: Stores and manages Docker container images for the Apostrophe CMS application running in the `Apostrophe ECS cluster`
  * **Resource Tags**:
    * `Name: sf-website-ecr-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * Apostrophe ECS Cluster
  * **Environment-specific Tags**: `latest`, `v1.x.x`, `<git-sha>`
  * **CI/CD Integration**: Automated image builds and pushes via GitHub Actions
  * **Image Versioning**: Tagged with git commit SHA and environment
  * **Scan on Push**: Enabled for vulnerability detection
  * **Permissions**: 
    * ECS task execution role granted pull access
    * CI/CD service account granted push access
  * **Security Features**:
    * Encryption at rest with AWS KMS
    * Image scanning enabled
  * **Lifecycle Policy**: 
    * Delete untagged images after 30 days
    * Keep only last 5 images per environment tag

---

### 🚢 Amazon ECS (Fargate)

* **Apostrophe ECS Cluster**: 
  * **Cluster Name**: `sf-website-ecs-cluster-<env>`
  * **Purpose**: Runs the containerized Apostrophe CMS application
  * **Resource Tags**:
    * `Name: sf-website-ecs-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * ECR (container image repository)
    * ALB (for ingress)
    * CloudWatch (for logs & metrics)
    * MongoDB EC2 instance (database)
    * S3 Attachments Bucket
  * **Service Name**: `sf-website`
  * **Container Image**: Built from project Dockerfile and stored in ECR
  * **Port Mapping**: Container port 3000 → Host port 3000
  * **CPU/Memory**: Minimum 1 vCPU, 2GB RAM (adjust based on load testing)
  * **Auto-scaling**: Based on CPU usage (target: 70%)
  * **Environment Variables**:
    * `NODE_ENV=production`
    * `APOS_MONGODB_URI=mongodb://<mongodb-hostname>:27017/apostrophe`
    * `SESSION_SECRET=<from parameter store>`
    * `APOS_S3_BUCKET=sf-website-s3-attachments-<env>`
    * `APOS_S3_REGION=us-east-1`
    * `APOS_CDN_URL=<cloudfront-distribution-url>`
    * `APOS_CDN_ENABLED=true`
  * **Security**: 
    * Uses IAM roles for S3 authentication (no static credentials)
    * All sensitive values stored in AWS Parameter Store
  * **Networking**: Runs in private subnets with ALB in public subnets
  * **Health Check**: HTTP GET on path `/` with 30s interval
  * **Command**: `npm start`

---

### ⚖️ Application Load Balancer (ALB)

* **ALB**:
  * **Load Balancer Name**: `sf-website-alb-<env>`
  * **Purpose**: Provides HTTPS access to the Apostrophe CMS application
  * **Resource Tags**:
    * `Name: sf-website-alb-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * ECS Apostrophe Cluster
    * ACM (for SSL certificates)
  * **Type**: HTTPS-only
  * **SSL**: Via AWS ACM
  * **Domain**: `sf-website-<env>.prettyclear.com`

---

### 🌐 CloudFront

* **Media Distribution**:
  * **Distribution Name**: `sf-website-media-<env>`
  * **Purpose**: CDN for media assets uploaded through ApostropheCMS
  * **Resource Tags**:
    * `Name: sf-website-media-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * S3 Attachments Bucket (origin)
    * ACM (for SSL certificates)
    * ECS Cluster (via APOS_CDN_URL environment variable)
  * **Origin**: S3 bucket `sf-website-s3-attachments-<env>`
  * **Access**: Origin access identity (OAI) to restrict direct S3 access
  * **Custom domain**: `sf-website-media-<env>.prettyclear.com`
  * **SSL Certificate**: Managed through AWS ACM
  * **Cache Behavior**:
    * Default TTL: 86400 seconds (1 day)
    * Compress objects automatically
    * Forward query strings and selected headers
  * **Price Class**: Price Class 100 (US, Canada, Europe)
  * **Security**:
    * HTTPS only
    * Modern TLS protocol versions only
    * Security headers added via response headers policy

---

### 📊 CloudWatch

* **Monitoring**:
  * **Resource Name**: `sf-website-cloudwatch-<env>`
  * **Purpose**: Logs and metrics for all infrastructure components
  * **Resource Tags**:
    * `Name: sf-website-cloudwatch-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * ECS Apostrophe Cluster
    * ALB
    * Slack (for alerts)
  * **Features**:
    * ECS logs and detailed metrics
    * ALB metrics (e.g., 5xx, latency)
    * CloudWatch alarms for key metrics
  * **Alerts**: Sent to Slack
  * **Log retention**: 90 days

---

### 📄 MongoDB on EC2

* **MongoDB**:
  * **Instance Name**: `sf-website-mongodb-<env>`
  * **Purpose**: Primary data store for ApostropheCMS
  * **Resource Tags**:
    * `Name: sf-website-mongodb-<env>`
    * `Project: Website`
    * `CostCenter: Website`
    * `Environment: <environment>`
    * `Owner: peter.ovchyn`
  * **Resource Integration**:
    * ECS Apostrophe Cluster
    * AWS Backup service
    * CloudWatch (for monitoring)
    * Parameter Store (for credentials)
  * **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
  * **Storage**: 100GB gp3 EBS volume with 3000 IOPS
  * **AMI**: Amazon Linux 2
  * **Deployment**: Single EC2 instance in private subnet
  * **Security**:
    * No public IP assigned
    * Security group allows ingress only from ECS service security group on port 27017
    * SSH access via Session Manager (no direct SSH allowed)
  * **Authentication**: Username/password authentication enabled
    * Credentials stored in AWS Parameter Store
    * Referenced in ECS task environment variables
  * **Backup Strategy**:
    * Daily automated snapshots of EBS volume
    * Retention period: 7 daily, 4 weekly
    * Snapshot automation via AWS Backup service
  * **Monitoring**:
    * CloudWatch agent for system metrics
    * Custom MongoDB metrics published to CloudWatch
    * Alerts for disk usage, connections, and query performance
  * **High Availability**:
    * Configured for future upgrade to a replica set
    * Placeholder DNS record for future replica nodes
