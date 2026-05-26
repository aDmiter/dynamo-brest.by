@echo off
chcp 65001 >nul
cd /d C:\dynamo-brest
echo ============================================
echo  POLNYJ PERENOS Bazy s dev (tolko server)
echo  Dev localhost / XAMPP NE TROGAETSYA
echo ============================================
echo.
if not exist "C:\dynamo-brest\dynamo-dev.sql" (
  echo OSHIBKA: net fajla C:\dynamo-brest\dynamo-dev.sql
  echo Snachala s PK: mysqldump iz XAMPP na Rabochij stol, skopirovat syuda.
  pause
  exit /b 1
)
echo [1/4] Ostanovka i peresozdanie MySQL (lower-case-table-names=1)...
docker compose -f docker-compose.db.yml down -v
docker compose -f docker-compose.db.yml up -d
echo Podozhdite 45 sek...
timeout /t 45 /nobreak >nul
echo.
echo [2/4] Kopirovanie dampa v kontejner...
docker cp C:\dynamo-brest\dynamo-dev.sql dynamo-mysql:/tmp/dynamo-dev.sql
echo.
echo [3/4] Import (1-3 min)...
docker exec dynamo-mysql sh -c "mysql -udynamo -p'Password28%%' dynamo_brest < /tmp/dynamo-dev.sql"
if errorlevel 1 (
  echo Import zavershilsya s oshibkoj. Proverite parol v .env
  pause
  exit /b 1
)
echo.
echo [4/4] Proverka...
docker exec dynamo-mysql mysql -udynamo -p'Password28%%' dynamo_brest -e "SELECT COUNT(*) AS products FROM product; SELECT COUNT(*) AS players FROM player; SELECT COUNT(*) AS menu FROM menuitem;"
echo.
echo Gotovo. Zapustite 04-start-site.bat i proverte sajt Ctrl+F5
echo 08-fix-table-names.bat NE NUZHEN posle etogo sposoba.
pause
