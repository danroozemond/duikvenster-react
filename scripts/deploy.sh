#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="${REPO_ROOT}/infra/opentofu"
AWS_PROFILE="${AWS_PROFILE:-duikvenster}"
export AWS_PROFILE

cd "${REPO_ROOT}"

if ! command -v aws >/dev/null 2>&1; then
  echo "error: aws CLI not found" >&2
  exit 1
fi

if ! command -v tofu >/dev/null 2>&1; then
  echo "error: tofu not found" >&2
  exit 1
fi

echo "Building frontend..."
npm run build

echo "Resolving deployment targets from OpenTofu outputs..."
BUCKET_NAME="$(tofu -chdir="${INFRA_DIR}" output -raw bucket_name)"
DISTRIBUTION_ID="$(tofu -chdir="${INFRA_DIR}" output -raw cloudfront_distribution_id)"

echo "Syncing dist/ to s3://${BUCKET_NAME} ..."
aws s3 sync "${REPO_ROOT}/dist/" "s3://${BUCKET_NAME}" --delete

echo "Creating CloudFront invalidation..."
aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*"

echo "Deploy complete."
