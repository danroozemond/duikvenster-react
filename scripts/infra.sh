#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="${REPO_ROOT}/infra/opentofu"

if ! command -v tofu >/dev/null 2>&1; then
  echo "error: tofu not found" >&2
  exit 1
fi

echo "Running OpenTofu init..."
tofu -chdir="${INFRA_DIR}" init

echo "Running OpenTofu plan..."
tofu -chdir="${INFRA_DIR}" plan

echo
echo "If you're happy with this plan, run:"
echo "tofu -chdir=${INFRA_DIR} apply"
