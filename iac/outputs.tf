output "cluster_name" {
  description = "cluster name of the eks"
  value       = module.eks.cluster_name
}
output "cluster_endpoint" {
  description = "cluster endpoint of the eks"
  value       = module.eks.cluster_endpoint
}
output "region" {
  description = "cluster region"
  value       = var.region
}
output "cluster_security_group_id" {
  description = "cluster security group id"
  value       = module.eks.cluster_security_group_id
}

#