@echo off
chcp 65001 >nul
cd /d C:\dynamo-brest
set "PATH=C:\Program Files\nodejs;%PATH%"
echo === Tri sostava dlya COMET ===
call pnpm exec tsx prisma\seed-teams.ts
echo.
echo Posle etogo povtorite sinhronizaciyu matchej v adminke.
pause
