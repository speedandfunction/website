output "session_secret_arn" {
  description = "ARN of the session secret parameter"
  value       = aws_ssm_parameter.session_secret.arn
}

output "documentdb_username_arn" {
  description = "ARN of the DocumentDB username parameter"
  value       = aws_ssm_parameter.documentdb_username.arn
}

output "documentdb_password_arn" {
  description = "ARN of the DocumentDB password parameter"
  value       = aws_ssm_parameter.documentdb_password.arn
}

output "redis_auth_token_arn" {
  description = "ARN of the Redis auth token parameter"
  value       = aws_ssm_parameter.redis_auth_token.arn
}

output "gcs_service_account_key_arn" {
  description = "ARN of the GCS service account key parameter"
  value       = var.gcs_service_account_key != "" ? aws_ssm_parameter.gcs_service_account_key[0].arn : ""
} 