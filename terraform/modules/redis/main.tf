# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.name_prefix}-${var.environment}-redis-subnet-group"
  subnet_ids = var.subnet_ids

  tags = var.tags
}

# ElastiCache Redis Cluster
resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.name_prefix}-${var.environment}-redis"
  description                = "Redis cluster for ${var.name_prefix} ${var.environment}"
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  num_cache_clusters         = 1
  
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = var.security_group_ids
  
  auth_token                 = var.auth_token
  transit_encryption_enabled = true
  at_rest_encryption_enabled = true

  tags = var.tags
} 