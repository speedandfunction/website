# Security Groups Module for SF Website Infrastructure

# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "${var.name_prefix}-alb-sg-${var.environment}"
  description = "Security group for Application Load Balancer"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-alb-sg-${var.environment}"
  })
}

# ECS Security Group
resource "aws_security_group" "ecs" {
  name        = "${var.name_prefix}-ecs-sg-${var.environment}"
  description = "Security group for ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    description     = "HTTP from ALB"
    from_port       = var.container_port
    to_port         = var.container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-ecs-sg-${var.environment}"
  })
}

# SSH access from bastion to ECS (optional rule)
resource "aws_security_group_rule" "ecs_ssh_from_bastion" {
  count = var.bastion_security_group_id != "" ? 1 : 0
  
  type                     = "ingress"
  from_port                = 22
  to_port                  = 22
  protocol                 = "tcp"
  source_security_group_id = var.bastion_security_group_id
  security_group_id        = aws_security_group.ecs.id
  description              = "SSH from bastion host"
}

# DocumentDB Security Group
resource "aws_security_group" "documentdb" {
  name        = "${var.name_prefix}-documentdb-sg-${var.environment}"
  description = "Security group for DocumentDB cluster"
  vpc_id      = var.vpc_id

  ingress {
    description     = "MongoDB from ECS"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-documentdb-sg-${var.environment}"
  })
}

# MongoDB access from bastion to DocumentDB (for debugging)
resource "aws_security_group_rule" "documentdb_from_bastion" {
  count = var.bastion_security_group_id != "" ? 1 : 0
  
  type                     = "ingress"
  from_port                = 27017
  to_port                  = 27017
  protocol                 = "tcp"
  source_security_group_id = var.bastion_security_group_id
  security_group_id        = aws_security_group.documentdb.id
  description              = "MongoDB from bastion host"
}

# Redis Security Group
resource "aws_security_group" "redis" {
  name        = "${var.name_prefix}-redis-sg-${var.environment}"
  description = "Security group for ElastiCache Redis cluster"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Redis from ECS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-redis-sg-${var.environment}"
  })
}

# Redis access from bastion (for debugging)
resource "aws_security_group_rule" "redis_from_bastion" {
  count = var.bastion_security_group_id != "" ? 1 : 0
  
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = var.bastion_security_group_id
  security_group_id        = aws_security_group.redis.id
  description              = "Redis from bastion host"
} 