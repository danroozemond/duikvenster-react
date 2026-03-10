# Duikvenster React

React + Vite frontend for [duikvenster.nl](https://duikvenster.nl), focused on planning tidal dives in the Oosterschelde.

## Functional overview

The app helps divers choose safe/comfortable dive windows ("duikvensters") per dive site.

- User selects a dive site from a curated list of Oosterschelde locations.
- The app fetches Rijkswaterstaat timeseries for:
  - stroomsnelheid (current speed)
  - stroomrichting (current direction)
- A line chart shows current speed over time, with:
  - a visual threshold line at **20 cm/s** (common comfort guideline)
  - current-time marker ("nu")
  - zoom support with reset
- A "Duikvensters" table is calculated from the timeseries:
  - windows start/end where speed crosses the threshold
  - start/end timestamps are interpolated for cleaner boundaries
  - kentering moment and type (HW/LW) are inferred when possible
  - minimum window duration is enforced (30 minutes)
- Past windows are collapsible so upcoming windows stay primary.

## Architecture

### Frontend

- Stack: React 19 + TypeScript + Vite.
- UI layer:
  - `src/pages/HomePage.tsx` orchestrates selection, loading, and rendering.
  - `src/components/AppNavbar.tsx` handles dive-site selection.
  - `src/components/StromingLineChart.tsx` renders charting with ApexCharts.
  - `src/components/DuikvenstersTable.tsx` renders computed windows.
- Domain/data layer:
  - `src/utils/stromingsdata.ts` builds RWS API URLs, fetches speed + direction, merges events, and caches latest response in `localStorage`.
  - `src/utils/duikvensters.ts` converts timeseries into dive windows based on threshold logic.
  - `src/utils/Duikvenster.ts` encapsulates interpolation, minimum-duration checks, and kentering typing.
- Static configuration:
  - `src/data/diveSites.json` maps site IDs to user-facing location names.

### Hosting/infrastructure

Infrastructure in `infra/opentofu` provisions:

- Private S3 bucket for static assets
- CloudFront distribution (IPv4/IPv6, HTTPS redirect, SPA 403/404 fallback to `index.html`)
- CloudFront Function for `www.duikvenster.nl` -> `duikvenster.nl` (301)
- ACM certificate in `us-east-1` with DNS validation
- Route53 hosted zone/records (or reuse existing zone via variable)

## Local development

```bash
npm install
npm run dev
```

Other useful commands:

```bash
npm run test
npm run build
npm run lint
```

## Deployment

### Prerequisites

- `aws` CLI configured (profile defaults to `duikvenster`)
- OpenTofu (`tofu`)
- Access to manage S3, CloudFront, ACM, Route53
- Domain registrar access for `duikvenster.nl` (for NS changes on first setup)

### First-time infrastructure setup

```bash
cd infra/opentofu
cp terraform.tfvars.example terraform.tfvars
tofu init
tofu plan
tofu apply
```

Then get Route53 nameservers and set them at the registrar:

```bash
tofu output route53_name_servers
```

### Release deployment

From repository root:

```bash
./scripts/deploy.sh
```

What this script does:

1. Runs the test suite (`npm run test`)
2. Builds the frontend (`npm run build`)
3. Reads bucket/distribution outputs from OpenTofu state
4. Syncs `dist/` to S3
5. Invalidates CloudFront cache (`/*`)

### Verify

- <https://duikvenster.nl>
- <https://www.duikvenster.nl>

Both domains should serve via CloudFront over HTTPS.

## Operational notes

- If a Route53 zone already exists, set `create_hosted_zone = false`.
- CloudFront requires ACM certificates in `us-east-1`; this is handled in IaC.
