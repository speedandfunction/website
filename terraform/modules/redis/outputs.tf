output "cluster_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.main.configuration_endpoint_address != "" ? aws_elasticache_replication_group.main.configuration_endpoint_address : aws_elasticache_replication_group.main.primary_endpoint_address
}

output "cluster_id" {
  description = "Redis cluster ID"
  value       = aws_elasticache_replication_group.main.replication_group_id
} 