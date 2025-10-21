#!/usr/bin/env bash
set -euo pipefail

echo "StuZync setup starting..."

# Node & PM2
if ! command -v pm2 >/dev/null 2>&1; then
  npm i -g pm2
fi

echo "Create .env.local with Mongo, NextAuth, R2, Redis, etc."

# Nginx + SSL (manual steps summary)
cat <<'NGINX'
# /etc/nginx/sites-available/stuzync
server {
  listen 443 ssl http2;
  server_name YOUR_DOMAIN;

  ssl_certificate     /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NGINX

echo "Done. Configure Cloudflare R2 + CDN and set envs: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_CDN_BASE"

