# Outputs for S3 Module

output "attachments_bucket_id" {
  description = "ID of the attachments bucket"
  value       = aws_s3_bucket.attachments.id
}

output "attachments_bucket_arn" {
  description = "ARN of the attachments bucket"
  value       = aws_s3_bucket.attachments.arn
}

output "attachments_bucket_domain_name" {
  description = "Domain name of the attachments bucket"
  value       = aws_s3_bucket.attachments.bucket_domain_name
}

output "logs_bucket_id" {
  description = "ID of the logs bucket"
  value       = aws_s3_bucket.logs.id
}

output "logs_bucket_arn" {
  description = "ARN of the logs bucket"
  value       = aws_s3_bucket.logs.arn
}

output "cloudfront_oac_id" {
  description = "ID of the CloudFront Origin Access Control"
  value       = aws_cloudfront_origin_access_control.attachments.id
} 