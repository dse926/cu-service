#!/usr/bin/env bash
# Run on a machine where `gh` is logged in (your laptop).
# Creates/uses a public GitHub repo, pushes main, enables Pages via Actions.
set -euo pipefail

OWNER="${GITHUB_OWNER:-dse926}"
REPO="${GITHUB_REPO:-cu-service}"
FULL="$OWNER/$REPO"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/" >&2
  exit 1
fi

gh auth status >/dev/null

if ! gh repo view "$FULL" >/dev/null 2>&1; then
  echo "Creating public repo $FULL ..."
  gh repo create "$FULL" --public --source=. --remote=github --push
else
  echo "Repo $FULL exists — adding/updating remote and pushing ..."
  if git remote get-url github >/dev/null 2>&1; then
    git remote set-url github "https://github.com/$FULL.git"
  else
    git remote add github "https://github.com/$FULL.git"
  fi
  git push -u github main
fi

echo "Setting Pages build type to GitHub Actions ..."
# API: build_type = workflow enables Actions as Pages source
gh api -X PUT "repos/$FULL/pages" \
  -f build_type=workflow \
  -f source[branch]=main \
  -f source[path]=/ \
  2>/dev/null || \
gh api -X POST "repos/$FULL/pages" \
  -f build_type=workflow \
  -f source[branch]=main \
  -f source[path]=/ \
  2>/dev/null || \
  echo "Could not auto-enable Pages via API. In the repo UI: Settings → Pages → Source: GitHub Actions"

echo "Triggering deploy workflow ..."
gh workflow run "Deploy to GitHub Pages" --repo "$FULL" || true

echo
echo "Watch: https://github.com/$FULL/actions"
echo "Site (after green deploy): https://$OWNER.github.io/$REPO/"
