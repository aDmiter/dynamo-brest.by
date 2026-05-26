@echo off
chcp 65001 >nul
cd /d C:\dynamo-brest
set "PATH=C:\Program Files\nodejs;%PATH%"
echo === Zapolnenie menyu ===
call pnpm exec tsx prisma\seed-menu.ts
echo.
echo Gotovo. Obnovite sajt v brauzere (Ctrl+F5).
pause
