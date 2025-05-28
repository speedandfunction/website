# Variables for Bastion Host Module

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where bastion host will be deployed"
  type        = string
}

variable "subnet_id" {
  description = "Public subnet ID where bastion host will be deployed"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for bastion host"
  type        = string
  default     = "t3.micro"
}

variable "key_pair_name" {
  description = "Name of the EC2 key pair for SSH access (optional - leave null for Session Manager only)"
  type        = string
  default     = null
}

variable "allowed_cidr_blocks" {
  description = "List of CIDR blocks allowed to SSH to bastion host"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
} 