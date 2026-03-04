output "bucket_name" {
  description = "S3 bucket name for site assets."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "route53_zone_id" {
  description = "Route 53 hosted zone ID in use."
  value       = local.zone_id
}

output "route53_name_servers" {
  description = "Name servers to configure at your registrar when create_hosted_zone is true."
  value       = var.create_hosted_zone ? aws_route53_zone.primary[0].name_servers : []
}
