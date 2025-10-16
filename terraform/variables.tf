variable "region" {
  description = "Availability region"
  type        = string
  default     = "us-east-1"
}

variable "cluster_name" {
  description = "eks cluster name"
  type        = string
  default     = "medimitra-eks-cluster"
}