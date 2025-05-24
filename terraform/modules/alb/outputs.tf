output "target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.main.arn
}

output "alb_dns_name" {
  description = "DNS name of the ALB"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the ALB"
  value       = aws_lb.main.zone_id
}

output "arn_suffix" {
  description = "ARN suffix for CloudWatch monitoring"
  value       = aws_lb.main.arn_suffix
} 