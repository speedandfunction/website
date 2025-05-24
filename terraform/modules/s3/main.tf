# S3 Module for SF Website Infrastructure

# S3 Bucket for Attachments
resource "aws_s3_bucket" "attachments" {
  bucket = "${var.name_prefix}-s3-attachments-${var.environment}"

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-s3-attachments-${var.environment}"
    Type = "Attachments"
  })
}

# S3 Bucket for Logs
resource "aws_s3_bucket" "logs" {
  bucket = "${var.name_prefix}-s3-logs-${var.environment}"

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-s3-logs-${var.environment}"
    Type = "Logs"
  })
}

# Attachments Bucket Configuration
resource "aws_s3_bucket_versioning" "attachments" {
  bucket = aws_s3_bucket.attachments.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "attachments" {
  bucket = aws_s3_bucket.attachments.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "attachments" {
  bucket = aws_s3_bucket.attachments.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "attachments" {
  bucket = aws_s3_bucket.attachments.id

  rule {
    id     = "transition_to_ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }

  rule {
    id     = "expire_non_current_versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "attachments" {
  bucket = aws_s3_bucket.attachments.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = [
      "https://${var.domain_name}",
      "https://${var.media_domain_name}"
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Logs Bucket Configuration
resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "log_lifecycle"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}

# CloudFront Origin Access Control for Attachments Bucket
resource "aws_cloudfront_origin_access_control" "attachments" {
  name                              = "${var.name_prefix}-attachments-oac-${var.environment}"
  description                       = "OAC for attachments bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Bucket Policy for CloudFront Access
resource "aws_s3_bucket_policy" "attachments" {
  bucket = aws_s3_bucket.attachments.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.attachments.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = var.cloudfront_distribution_arn
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.attachments]
}

# Bucket Policy for Application Access (via IAM role)
data "aws_iam_policy_document" "attachments_access" {
  statement {
    sid    = "AllowECSTaskAccess"
    effect = "Allow"
    
    principals {
      type        = "AWS"
      identifiers = [var.ecs_task_role_arn]
    }

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]

    resources = ["${aws_s3_bucket.attachments.arn}/*"]
  }

  statement {
    sid    = "AllowECSTaskListBucket"
    effect = "Allow"
    
    principals {
      type        = "AWS"
      identifiers = [var.ecs_task_role_arn]
    }

    actions = ["s3:ListBucket"]

    resources = [aws_s3_bucket.attachments.arn]
  }
} 