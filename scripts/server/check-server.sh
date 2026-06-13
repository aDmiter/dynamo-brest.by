#!/bin/bash
echo "=== whoami / pwd ==="
whoami
pwd
echo ""
echo "=== disk / ram ==="
df -h /
free -h
echo ""
echo "=== software ==="
node -v 2>/dev/null || echo "Node: нет"
npm -v 2>/dev/null || echo "npm: нет"
pnpm -v 2>/dev/null || echo "pnpm: нет"
mysql --version 2>/dev/null || echo "MySQL client: нет"
nginx -v 2>&1 || echo "nginx: нет"
echo ""
echo "=== dirs ==="
ls -la ~
ls -la /var/www 2>/dev/null
ls -la /var/www/www-root/data 2>/dev/null
ls -la /var/www/www-root/data/www 2>/dev/null
