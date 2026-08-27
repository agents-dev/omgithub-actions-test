#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE="${OMGHITHUB_DEPLOY_HOST:-ubuntu@100.127.77.25}"
DEST="${OMGHITHUB_DEPLOY_DIR:-/home/ubuntu/projects/omgithub}"
ARCHIVE="$(mktemp -t omgithub-site-XXXXXX.tar.gz)"
trap 'rm -f "$ARCHIVE"' EXIT

COPYFILE_DISABLE=1 tar --no-xattrs --no-mac-metadata -C "$ROOT/site" -czf "$ARCHIVE" \
  --exclude=node_modules --exclude=dist --exclude=data --exclude=.env .
ssh "$REMOTE" "mkdir -p '$DEST'"
scp -q "$ARCHIVE" "$REMOTE:/tmp/omgithub-site.tar.gz"
ssh "$REMOTE" "tar -xzf /tmp/omgithub-site.tar.gz -C '$DEST' && rm -f /tmp/omgithub-site.tar.gz && cd '$DEST' && docker compose up -d --build && docker compose ps"
