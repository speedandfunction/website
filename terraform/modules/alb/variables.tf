variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the ALB will be created"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the ALB"
  type        = list(string)
}

variable "security_group_ids" {
  description = "List of security group IDs for the ALB"
  type        = list(string)
}

variable "domain_name" {
  description = "Domain name for the ALB"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
}

variable "container_port" {
  description = "Port that the container exposes"
  type        = number
  default     = 3000
}

variable "health_check_path" {
  description = "Path for ALB health checks"
  type        = string
  default     = "/health"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
} 