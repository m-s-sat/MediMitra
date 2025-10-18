terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.17.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.7.2"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.1.0"
    }
    cloudinit = {
      source  = "hashicorp/cloudinit"
      version = "~> 2.3.7"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.38.0"
    }
  }
  backend "s3" {
    bucket = "medimitra-tfstate"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}
####