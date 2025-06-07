# DocumentDB Subnet Group
resource "aws_docdb_subnet_group" "main" {
  name       = "${var.name_prefix}-${var.environment}-docdb-subnet-group"
  subnet_ids = var.subnet_ids

  tags = var.tags
}

# DocumentDB Parameter Group
resource "aws_docdb_cluster_parameter_group" "main" {
  family      = "docdb5.0"
  name        = "${var.name_prefix}-${var.environment}-docdb-parameter-group"
  description = "DocumentDB cluster parameter group for ${var.name_prefix}-${var.environment}"

  parameter {
    name  = "tls"
    value = "enabled"
  }

  tags = var.tags
}

# DocumentDB Cluster
resource "aws_docdb_cluster" "main" {
  cluster_identifier              = "${var.name_prefix}-${var.environment}-docdb-cluster"
  engine                          = "docdb"
  engine_version                  = "5.0.0"
  master_username                 = var.master_username
  master_password                 = var.master_password
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.main.name
  db_subnet_group_name            = aws_docdb_subnet_group.main.name
  vpc_security_group_ids          = var.security_group_ids
  storage_encrypted               = true
  skip_final_snapshot             = true
  
  # Enable audit logging for security compliance
  enabled_cloudwatch_logs_exports = ["audit"]
  
  # Backup configuration
  backup_retention_period   = 7
  preferred_backup_window   = "03:00-04:00"
  preferred_maintenance_window = "sun:04:00-sun:05:00"

  tags = var.tags
}

# DocumentDB Instance
resource "aws_docdb_cluster_instance" "cluster_instances" {
  identifier         = "${var.name_prefix}-${var.environment}-docdb"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = "db.t3.medium"

  tags = var.tags
} 