module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = local.cluster_name
  kubernetes_version = "1.34"


  vpc_id                 = module.vpc.vpc_id
  subnet_ids             = module.vpc.private_subnets
  endpoint_public_access = true

  eks_managed_node_groups = {
    one = {
      name           = "node-group-1"
      instance_types = ["t3.medium"]
      ami_type       = "AL2023_x86_64_STANDARD"
      min_size       = 1
      max_size       = 2
      desired_size   = 1
    }
    # two = {
    #   name           = "node-group-2"
    #   instance_types = ["t3.medium"]
    #   ami_type       = "AL2023_x86_64_STANDARD"
    #   min_size       = 1
    #   max_size       = 2
    #   desired_size   = 1
    # }
  }

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}

#####