# Duikvenster React

React + Vite frontend for `duikvenster.nl`.

## App development

```bash
npm install
npm run dev
```

Build production assets:

```bash
npm run build
```

## AWS static hosting with OpenTofu

Infrastructure code lives in `infra/opentofu` and creates:

- Private S3 bucket (`duikvenster-react`)
- CloudFront distribution with IPv4 + IPv6
- HTTPS-only viewer policy (HTTP redirects to HTTPS)
- 301 redirect from `www.duikvenster.nl` to `duikvenster.nl`
- ACM certificate in `us-east-1` with DNS validation
- Route 53 hosted zone and `A`/`AAAA` alias records for:
  - `duikvenster.nl`
  - `www.duikvenster.nl`

### 1. Prerequisites

- OpenTofu installed (`tofu`)
- AWS CLI configured with credentials that can manage S3, CloudFront, ACM, and Route 53
- Domain registrar access for `duikvenster.nl`

### 2. Configure variables

```bash
cd infra/opentofu
cp terraform.tfvars.example terraform.tfvars
```

Defaults are already set for your requested setup:

- `bucket_name = "duikvenster-react"`
- `domain_name = "duikvenster.nl"`
- `aliases = ["duikvenster.nl", "www.duikvenster.nl"]`
- `aws_region = "eu-west-2"`
- `create_hosted_zone = true`

### 3. Provision infrastructure

```bash
tofu init
tofu plan
tofu apply
```

After apply, capture the Route 53 nameservers:

```bash
tofu output route53_name_servers
```

Update the NS records at your registrar for `duikvenster.nl` to these AWS nameservers.

### 4. Deploy the site build

From repository root:

```bash
./scripts/deploy.sh
```

### 5. Verify

- `https://duikvenster.nl`
- `https://www.duikvenster.nl`

Both should resolve over CloudFront and work on IPv4/IPv6.

## Notes

- If you already have a Route 53 hosted zone, set `create_hosted_zone = false`.
- ACM cert for CloudFront must stay in `us-east-1` by AWS design; this is handled in the IaC while the rest defaults to `eu-west-2`.
