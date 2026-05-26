@echo off
chcp 65001 >nul
cd /d C:\dynamo-brest
set "PATH=C:\Program Files\nodejs;%PATH%"
set NODE_ENV=production
echo === Zapusk sajta http://127.0.0.1:3000 ===
echo Okno NE zakryvajte. Ostanovka: Ctrl+C
echo.
call pnpm start
