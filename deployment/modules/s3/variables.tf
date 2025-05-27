# Variables for S3 Module

variable "name_prefix" {
  description = "Name prefix for resources"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "domain_name" {
  description = "Application domain name for CORS"
  type        = string
  default     = ""
}

variable "media_domain_name" {
  description = "Media domain name for CORS"
  type        = string
  default     = ""
}

variable "cloudfront_distribution_arn" {
  description = "ARN of CloudFront distribution for bucket policy"
  type        = string
  default     = ""
}

variable "ecs_task_role_arn" {
  description = "ARN of ECS task role for bucket access"
  type        = string
  default     = ""
} 