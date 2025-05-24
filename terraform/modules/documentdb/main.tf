# DocumentDB Subnet Group
resource "aws_docdb_subnet_group" "main" {
  name       = "${var.name_prefix}-${var.environment}-docdb-subnet-group"
  subnet_ids = var.subnet_ids

  tags = var.tags
}

# DocumentDB Cluster
resource "aws_docdb_cluster" "main" {
  cluster_identifier      = "${var.name_prefix}-${var.environment}-docdb-cluster"
  engine                  = "docdb"
  master_username         = var.master_username
  master_password         = var.master_password
  db_subnet_group_name    = aws_docdb_subnet_group.main.name
  vpc_security_group_ids  = var.security_group_ids
  storage_encrypted       = true
  skip_final_snapshot     = true

  tags = var.tags
}

# DocumentDB Instance
resource "aws_docdb_cluster_instance" "cluster_instances" {
  identifier         = "${var.name_prefix}-${var.environment}-docdb"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = "db.t3.medium"

  tags = var.tags
} 