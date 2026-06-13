#!/bin/bash
# Быстрая пересборка Next.js на сервере (без pnpm install).
# Использование: bash scripts/server/rebuild.sh
# Или alias: deploy='bash ~/www/dynamo-brest.by/scripts/server/rebuild.sh'

set -euo pipefail

SITE_DIR="${SITE_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
NODE_BIN="${NODE_BIN:-/var/www/www-root/data/.nvm/versions/node/v20.20.2/bin}"

export PATH="$NODE_BIN:$PATH"
cd "$SITE_DIR"

echo "=== rebuild $(date -Is) ==="
echo "dir: $SITE_DIR"
node -v

export NODE_OPTIONS=--max-old-space-size=1536
npx next build --webpack

echo "=== OK ==="
echo "Перезапустите Node в ISPmanager."
