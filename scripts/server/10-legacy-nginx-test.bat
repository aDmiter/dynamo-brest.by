@echo off
chcp 65001 >nul
set CONF=C:\dynamo-brest\nginx\legacy.conf
if not exist "%CONF%" (
  echo Net fajla %CONF%
  echo Skopirujte nginx-legacy.conf v C:\dynamo-brest\nginx\legacy.conf
  pause
  exit /b 1
)
echo Kopirovanie v ats-web-1...
docker cp "%CONF%" ats-web-1:/etc/nginx/conf.d/legacy.conf
echo Proverka nginx...
docker exec ats-web-1 nginx -t
if errorlevel 1 (
  echo Oshibka konfiga. Bilety ne trogali, udalyaem legacy.conf iz kontejnera.
  docker exec ats-web-1 rm -f /etc/nginx/conf.d/legacy.conf
  pause
  exit /b 1
)
docker exec ats-web-1 nginx -s reload
echo.
echo Test s servera:
curl.exe -sI -H "Host: legacy.dynamo-brest.by" http://127.0.0.1/
echo.
echo Esli HTTP/1.1 200 ili 307 — otkrojte http://legacy.dynamo-brest.by v brauzere
pause
