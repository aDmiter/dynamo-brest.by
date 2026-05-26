@echo off
chcp 65001 >nul
cd /d C:\dynamo-brest
echo === Zapusk dynamo-mysql ===
docker compose -f docker-compose.db.yml up -d
timeout /t 5 /nobreak >nul
docker ps --filter name=dynamo-mysql
echo.
pause
