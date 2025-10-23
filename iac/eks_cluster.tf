module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name    = local.cluster_name
  kubernetes_version = "1.33"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  endpoint_public_access = true

  compute_config = {
    enabled = true
    node_pools = ["general-purpose"]
  }

  eks_managed_node_groups = {
    one = {
      name           = "node-group-1"
      instance_types = ["t3.small"]
      min_size       = 1
      max_size       = 3
      desired_size   = 1
    }

    # two = {
    #   name           = "node-group-2"
    #   ami_type       = "AL2_x86_64"
    #   instance_types = ["t3.small"]
    #   min_size       = 1
    #   max_size       = 2
    #   desired_size   = 1
    # }
  }
}
