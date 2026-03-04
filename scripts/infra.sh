#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="${REPO_ROOT}/infra/opentofu"
PLAN_FILE="${INFRA_DIR}/plan.tfplan"
AWS_PROFILE="${AWS_PROFILE:-duikvenster}"
export AWS_PROFILE

if ! command -v tofu >/dev/null 2>&1; then
  echo "error: tofu not found" >&2
  exit 1
fi

echo "Running OpenTofu init..."
tofu -chdir="${INFRA_DIR}" init

echo "Running OpenTofu plan..."
tofu -chdir="${INFRA_DIR}" plan -out="${PLAN_FILE}"

echo
echo "Plan saved to: ${PLAN_FILE}"
echo "If you're happy with this plan, run:"
echo "AWS_PROFILE=${AWS_PROFILE} tofu -chdir=${INFRA_DIR} apply ${PLAN_FILE}"
