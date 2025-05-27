# Variables for Security Groups Module

variable "name_prefix" {
  description = "Name prefix for resources"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "container_port" {
  description = "Port that the container exposes"
  type        = number
  default     = 3000
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
} 