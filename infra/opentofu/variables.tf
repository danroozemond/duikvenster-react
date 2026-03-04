variable "aws_region" {
  description = "Primary AWS region for S3 and Route 53 resources."
  type        = string
  default     = "eu-west-2"
}

variable "domain_name" {
  description = "Apex domain name."
  type        = string
  default     = "duikvenster.nl"
}

variable "aliases" {
  description = "Domain aliases to attach to the CloudFront distribution."
  type        = list(string)
  default     = ["duikvenster.nl", "www.duikvenster.nl"]
}

variable "bucket_name" {
  description = "S3 bucket name for static assets."
  type        = string
  default     = "duikvenster-react"
}

variable "create_hosted_zone" {
  description = "Create a Route 53 hosted zone for the apex domain."
  type        = bool
  default     = true
}
