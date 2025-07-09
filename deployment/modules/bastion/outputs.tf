# Outputs for Bastion Host Module

output "instance_id" {
  description = "ID of the bastion host instance"
  value       = aws_instance.bastion.id
}

output "public_ip" {
  description = "Public IP address of the bastion host"
  value       = aws_eip.bastion.public_ip
}

output "private_ip" {
  description = "Private IP address of the bastion host"
  value       = aws_instance.bastion.private_ip
}

output "security_group_id" {
  description = "ID of the bastion host security group"
  value       = aws_security_group.bastion.id
}

output "ssh_command" {
  description = "SSH command to connect to bastion host"
  value       = "ssh -i /path/to/${var.key_pair_name}.pem ec2-user@${aws_eip.bastion.public_ip}"
} 