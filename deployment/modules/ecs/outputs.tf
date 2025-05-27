output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.main.name
}

output "cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "autoscaling_target_arn" {
  description = "Application Auto Scaling target ARN"
  value       = aws_appautoscaling_target.ecs_target.arn
}

output "cpu_scaling_policy_arn" {
  description = "CPU-based scaling policy ARN"
  value       = aws_appautoscaling_policy.scale_up.arn
}

output "memory_scaling_policy_arn" {
  description = "Memory-based scaling policy ARN"
  value       = aws_appautoscaling_policy.scale_memory.arn
} 