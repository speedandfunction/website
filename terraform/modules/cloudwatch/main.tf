# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/ecs/${var.name_prefix}-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.name_prefix}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", var.ecs_service_name, "ClusterName", var.ecs_cluster_name],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "ECS Service Metrics"
          period  = 300
        }
      }
    ]
  })
} 