## ✅ Final Terraform Infrastructure Plan

### 🌍 General

* **AWS Region**: `us-east-1`
* **Environments**: `dev`, `staging`, `prod`
* **Domain**: `snf-website-<env>.prettyclear.com`
* **Structure**: Modular Terraform setup for multi-environment support
* **Resource Tags** (applied to all resources):

  * `Project: Website`
  * `CostCenter: Website`
  * `Environment: <environment>`
  * `Owner: peter.ovchyn`

---

### 🪣 Amazon S3

1. **Attachments Bucket** (`sf-website-attachments-<env>`)
   * **Purpose**: Stores media assets and uploaded files for Apostrophe CMS
   * **Access**: Private access, accessible only through application
   * **Connection**: Referenced in `APOS_S3_BUCKET` environment variable
   * **CloudFront Integration**: Used as CloudFront origin for media delivery
   * **Lifecycle Rules**:
     * Transition infrequently accessed objects to Standard-IA after 30 days
     * Archive older assets to Glacier after 90 days (optional)
   * **Versioning**: Enabled with 30-day expiration for non-current versions
   * **Encryption**: Server-side encryption with Amazon S3-managed keys (SSE-S3)
   * **CORS**: Configured to allow uploads from application domain

2. **Logs Bucket** (`sf-website-logs-<env>`)
   * **Purpose**: Centralized logging for all infrastructure components
   * **Collects logs from**:
     * S3 buckets
     * CloudFront distributions
     * Load Balancer
     * ECS tasks
   * **Access**: Private, restricted to log delivery services and administrators
   * **Lifecycle Rules**: 
     * Transition to Glacier after 90 days
     * Expire after 365 days
   * **Encryption**: Server-side encryption (SSE-S3)
   * **Analysis Tools**: Connected to Athena for log analysis (optional)

---

### 🐳 Amazon ECR

* **Repository Name**: `sf-website-apostrophe-<env>`
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

### 👤 IAM (Identity and Access Management)

* **IAM Roles:**
  * **ECS Task Role** (`sf-website-apostrophe-<env>-task`)
    * Grants the application running in the container specific permissions to AWS services
    * S3 permissions limited to only required operations on specific buckets
    * Used instead of static access keys (follows AWS best practices)
    * Trust policy allows only `ecs-tasks.amazonaws.com` to assume the role
  
  * **ECS Task Execution Role** (`sf-website-apostrophe-<env>-execution`)
    * Grants permissions to the ECS service to pull container images and send logs
    * Allows reading from Parameter Store for secrets
    * Based on the `AmazonECSTaskExecutionRolePolicy` managed policy

* **S3 Bucket Access Policy:**
  * **Policy Name**: `sf-website-s3-access-<env>`
  * **Attached to**: ECS Task Role
  * **Permissions**:
    * `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` on specific paths
    * `s3:ListBucket` on the bucket
    * Scoped to specific environment's bucket only

* **IAM Best Practices Implemented:**
  * No static credentials (AWS automatically provides temporary credentials)
  * Least privilege access (permissions limited to specific operations and resources)
  * Task-specific roles (separation between execution and runtime permissions)
  * Credentials automatically rotated (temporary and managed by AWS)

---

### 🚢 Amazon ECS (Fargate)

* **Cluster Name**: `sf-website-apostrophe-<env>`
* **Service Name**: `apostrophe-cms`
* **Container Image**: Built from project Dockerfile and stored in ECR
* **ECR Integration**:
  * Pulls container image from `sf-website-apostrophe-<env>` repository
  * Task execution role has permissions to pull from ECR
  * Automatic redeployment on new image push via CI/CD
* **Port Mapping**: Container port 3000 → Host port 3000
* **CPU/Memory**: Minimum 1 vCPU, 2GB RAM (adjust based on load testing)
* **Auto-scaling**: Based on CPU usage (target: 70%)
* **Environment Variables**:
  * `NODE_ENV=production`
  * `APOS_MONGODB_URI=mongodb://<mongodb-hostname>:27017/apostrophe`
  * `SESSION_SECRET=<from parameter store>`
  * `APOS_S3_BUCKET=sf-website-attachments-<env>`
  * `APOS_S3_REGION=us-east-1`
  * `APOS_CDN_URL=<cloudfront-distribution-url>`
  * `APOS_CDN_ENABLED=true`
* **Security**: 
  * Uses IAM roles for S3 authentication (no static credentials)
  * AWS SDK automatically fetches temporary credentials from instance metadata
  * All sensitive values stored in AWS Parameter Store
* **IAM Role Integration**:
  * The ApostropheCMS uploadfs module uses the AWS SDK
  * AWS SDK uses the default credential provider chain
  * In ECS, this checks the task's IAM role via the ECS container credentials endpoint
  * No code changes required in ApostropheCMS application

* **ApostropheCMS S3 Integration Configuration:**
  * ApostropheCMS uses the `uploadfs` module for file storage
  * When running in an ECS task with IAM role:
    * AWS SDK automatically detects and uses the task role credentials
    * Only need to set `APOS_S3_BUCKET` and `APOS_S3_REGION` environment variables
    * Container credentials endpoint automatically provides temporary credentials
  * Task role must have appropriate S3 permissions:
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:PutObject",
            "s3:GetObject",
            "s3:DeleteObject",
            "s3:ListBucket",
            "s3:ListBucketMultipartUploads",
            "s3:ListMultipartUploadParts"
          ],
          "Resource": [
            "arn:aws:s3:::sf-website-attachments-<env>/*",
            "arn:aws:s3:::sf-website-attachments-<env>"
          ]
        }
      ]
    }
    ```
* **Networking**: Runs in private subnets with ALB in public subnets
* **Health Check**: HTTP GET on path `/` with 30s interval
* **Command**: `npm start`
* Integrated with:
  * ALB (for ingress)
  * CloudWatch (for logs & metrics)

---

### ⚖️ Application Load Balancer (ALB)

* Type: **HTTPS-only**
* SSL via **AWS ACM**
* Domain: `snf-website-<env>.prettyclear.com`
* Sends traffic to ECS Fargate service

---

### 🌐 CloudFront

* CDN for **media assets**
* Origin: Media S3 bucket
* Custom domain and SSL via ACM

---

### 📊 CloudWatch

* ECS logs and detailed metrics
* ALB metrics (e.g., 5xx, latency)
* CloudWatch alarms for key metrics
* Alerts sent to **Slack**
* Log retention: **90 days**

---

### 📄 MongoDB on EC2

* Single EC2 instance in **private subnet**
* Used as primary data store
* Backed by **EBS volume**
* Access restricted to ECS service
* Configured for future upgrade to a **replica set**
