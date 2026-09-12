@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Deploy PrintSahaj website

echo.
echo This deploys the PrintSahaj WEBSITE to Firebase Hosting.
echo It does not start the artwork verification tool.
echo It does not upload gemini-key.txt.
echo.

where firebase >nul 2>&1
if errorlevel 1 (
  echo Firebase CLI was not found.
  echo.
  echo 1. Install Node.js from https://nodejs.org
  echo 2. Open a new Command Prompt
  echo 3. Run:  npm install -g firebase-tools
  echo 4. Run:  firebase login
  echo 5. Double-click this file again
  echo.
  pause
  exit /b 1
)

firebase projects:list >nul 2>&1
if errorlevel 1 (
  echo Firebase is not logged in on this computer.
  echo Run this once, then double-click this file again:
  echo.
  echo   firebase login
  echo.
  pause
  exit /b 1
)

echo Building the website...
cd /d "%~dp0web"
call npm install
if errorlevel 1 (
  echo npm install failed.
  pause
  exit /b 1
)
call npm run build
if errorlevel 1 (
  echo Website build failed.
  pause
  exit /b 1
)

cd /d "%~dp0"
echo Deploying to Firebase project printsahaj...
firebase deploy --only hosting
echo.
pause
exit /b %ERRORLEVEL%
