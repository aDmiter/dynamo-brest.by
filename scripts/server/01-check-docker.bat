@echo off
chcp 65001 >nul
echo === Docker: bilety (ats) i Dynamo MySQL ===
docker ps --filter name=ats-web-1 --filter name=dynamo-mysql
echo.
echo === Bilety na localhost:80 ===
curl.exe -sI http://127.0.0.1 | findstr /I "HTTP"
echo.
pause
