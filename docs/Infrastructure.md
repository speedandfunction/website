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

1. **Media Bucket**

   * Stores media assets
   * Private access
   * Used as CloudFront origin
2. **Logs Bucket**

   * Collects logs from:

     * S3
     * CloudFront
     * Load Balancer
   * Private access

---

### 🐳 Amazon ECR

* 1 repository
* Lifecycle policy: **delete untagged images after 30 days**

---

### 🚢 Amazon ECS (Fargate)

* 1 ECS service
* Auto-scales based on **CPU usage**
* Runs in a **new VPC** with subnets
* Secure communication to MongoDB EC2 instance
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
