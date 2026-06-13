#!/bin/bash
# Проверка статусов отправлений на Белпочте (заказы со статусом «Отправлен»).
# В .env сайта должен быть CRON_SECRET=...

set -euo pipefail

SITE_DIR="${SITE_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
LOG_DIR="${LOG_DIR:-$HOME/logs}"
LOG_FILE="${LOG_FILE:-$LOG_DIR/belpost-cron.log}"
ENV_FILE="${ENV_FILE:-$SITE_DIR/.env}"
PORT="${PORT:-10000}"
TIMEOUT_SEC="${TIMEOUT_SEC:-300}"

mkdir -p "$LOG_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "$(date -Is) .env не найден: $ENV_FILE" >>"$LOG_FILE"
  exit 1
fi

CRON_SECRET="$(grep -E '^CRON_SECRET=' "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '\r' | sed 's/^["'\'']//; s/["'\'']$//')"
if [ -z "$CRON_SECRET" ]; then
  echo "$(date -Is) CRON_SECRET не задан в $ENV_FILE" >>"$LOG_FILE"
  exit 1
fi

if grep -qE '^PORT=' "$ENV_FILE"; then
  PORT="$(grep -E '^PORT=' "$ENV_FILE" | head -n1 | cut -d= -f2- | tr -d '\r' | sed 's/^["'\'']//; s/["'\'']$//')"
fi

URL="http://127.0.0.1:${PORT}/api/cron/sync-belpost-orders?token=${CRON_SECRET}"

{
  echo "=== $(date -Is) Belpost sync start ==="
  curl -fsS --max-time "$TIMEOUT_SEC" "$URL"
  echo ""
  echo "=== $(date -Is) Belpost sync done ==="
} >>"$LOG_FILE" 2>&1
