#!/bin/bash
set -e
cd /var/www/www-root/data/www/dynamo-brest.by

echo "=== Node ==="
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js не найден. Установите Node 20 LTS (nvm или через поддержку hoster.by)."
  exit 1
fi
node -v
npm -v

echo "=== pnpm ==="
if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm
fi
pnpm -v

echo "=== install ==="
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

echo "=== prisma ==="
pnpm exec prisma generate

echo "=== build ==="
pnpm build

echo "=== OK ==="
echo "Дальше: pnpm start (порт 3000) + nginx proxy"
