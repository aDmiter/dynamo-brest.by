# Локальный cron: полная синхронизация COMET (нужен запущенный pnpm dev / production)
# В .env задайте CRON_SECRET=ваш-секрет
param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$Token = $env:CRON_SECRET
)

if (-not $Token) {
  Write-Error "CRON_SECRET не задан. Добавьте в .env: CRON_SECRET=..."
  exit 1
}

$uri = "$BaseUrl/api/cron/sync-comet?token=$Token"
Write-Host "GET $uri"
try {
  $response = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 600
  $response | ConvertTo-Json -Depth 6
} catch {
  Write-Error $_
  exit 1
}
