# Bastion Host Module

# Data source for latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Security Group for Bastion Host
resource "aws_security_group" "bastion" {
  name_prefix = "${var.name_prefix}-bastion-${var.environment}"
  description = "Security group for bastion host"
  vpc_id      = var.vpc_id
  
  # SSH access from allowed CIDR blocks
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }
  
  # All outbound traffic
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(var.tags, {
    Name = "${var.name_prefix}-bastion-sg-${var.environment}"
  })
}

# Bastion Host EC2 Instance
resource "aws_instance" "bastion" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type              = var.instance_type
  key_name                   = var.key_pair_name
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true
  
  # User data script for basic setup
  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y aws-cli
    
    # Start and enable SSM agent for Session Manager access
    systemctl start amazon-ssm-agent
    systemctl enable amazon-ssm-agent
    
    # Basic security hardening
    sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
    systemctl restart sshd
    
    # Install additional useful tools
    yum install -y htop vim wget curl git
    
    # Configure timezone
    timedatectl set-timezone UTC
    
    # Create a log file to verify user data execution
    echo "Bastion host user data script completed at $(date)" > /var/log/user-data.log
  EOF
  )
  
  tags = merge(var.tags, {
    Name = "${var.name_prefix}-bastion-${var.environment}"
  })
}

# Elastic IP for Bastion Host
resource "aws_eip" "bastion" {
  instance = aws_instance.bastion.id
  domain   = "vpc"
  
  tags = merge(var.tags, {
    Name = "${var.name_prefix}-bastion-eip-${var.environment}"
  })
  
  depends_on = [aws_instance.bastion]
} 