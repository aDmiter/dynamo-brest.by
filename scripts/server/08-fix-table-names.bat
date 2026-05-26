@echo off
chcp 65001 >nul
cd /d C:\dynamo-brest\scripts\server
echo === Pereimenovanie tablic (XAMPP -^> Prisma) ===
docker exec -i dynamo-mysql mysql -udynamo -pPassword28%% dynamo_brest < fix-windows-table-names.sql
if errorlevel 1 (
  echo.
  echo Chast tablic uzhe pereimenovana - eto normalno. Smotrite oshibki vyshe.
)
echo.
echo Obnovite stranitsu v brauzere Ctrl+F5
pause
