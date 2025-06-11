# Session Secret Parameter
resource "aws_ssm_parameter" "session_secret" {
  name  = "/${var.name_prefix}/${var.environment}/session-secret"
  type  = "SecureString"
  value = var.session_secret

  tags = var.tags
}

# DocumentDB Master Username Parameter
resource "aws_ssm_parameter" "documentdb_username" {
  name  = "/${var.name_prefix}/${var.environment}/documentdb-username"
  type  = "String"
  value = var.documentdb_master_username

  tags = var.tags
}

# DocumentDB Master Password Parameter
resource "aws_ssm_parameter" "documentdb_password" {
  name  = "/${var.name_prefix}/${var.environment}/documentdb-password"
  type  = "SecureString"
  value = var.documentdb_master_password

  tags = var.tags
}

# Redis Auth Token Parameter
resource "aws_ssm_parameter" "redis_auth_token" {
  name  = "/${var.name_prefix}/${var.environment}/redis-auth-token"
  type  = "SecureString"
  value = var.redis_auth_token

  tags = var.tags
}

# Google Cloud Storage Service Account Key Parameter (optional)
resource "aws_ssm_parameter" "gcs_service_account_key" {
  count = var.gcs_service_account_key != "" ? 1 : 0
  
  name  = "/${var.name_prefix}/${var.environment}/gcs-service-account-key"
  type  = "SecureString"
  value = var.gcs_service_account_key

  tags = var.tags
} 