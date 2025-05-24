variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "documentdb_master_username" {
  description = "Master username for DocumentDB"
  type        = string
}

variable "documentdb_master_password" {
  description = "Master password for DocumentDB"
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "Session secret for the application"
  type        = string
  sensitive   = true
}

variable "redis_auth_token" {
  description = "Auth token for Redis"
  type        = string
  sensitive   = true
}

variable "gcs_service_account_key" {
  description = "Google Cloud Storage service account key (JSON)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
} 