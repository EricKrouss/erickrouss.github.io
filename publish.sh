#!/usr/bin/env bash
set -euo pipefail

# Run from this repository even when invoked from another directory.
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if [[ "${1:-}" == "--help" ]]; then
  echo 'Usage: ./publish.sh [commit message]'
  echo 'Build, commit all non-ignored changes, and push main to deploy the site.'
  exit 0
fi

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo 'Switch to main before publishing: git switch main' >&2
  exit 1
fi

git fetch origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo 'Remote main has changes. Commit your work and integrate origin/main before publishing.' >&2
  exit 1
fi

npm run build
git add -A
if ! git diff --cached --quiet; then
  git commit -m "${*:-Update blog and website}"
else
  echo 'No new changes to commit; pushing any existing local commits.'
fi
git push origin main

echo 'Push complete. GitHub Actions deploys new commits and publishes Standard.site articles.'
echo 'Deployment status: https://github.com/EricKrouss/erickrouss.github.io/actions/workflows/deploy.yml'
