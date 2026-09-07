@echo off
setlocal
cd /d "%~dp0"

set "NOMA_NODE=%~dp0runtime\node.exe"
if not exist "%NOMA_NODE%" set "NOMA_NODE=node"
if "%NOMA_NODE%"=="node" where node >nul 2>nul
if "%NOMA_NODE%"=="node" if errorlevel 1 (
  echo Node.js is required to run Noma.
  echo Install Node.js from https://nodejs.org/ and run Noma.cmd again.
  pause
  exit /b 1
)

if not exist "%~dp0dist\index.html" (
  echo Noma production files are missing.
  echo Run npm run build:portable from the project first.
  pause
  exit /b 1
)

set "NOMA_SERVER=%~dp0server\desktop-server.mjs"
if not exist "%NOMA_SERVER%" set "NOMA_SERVER=%~dp0scripts\desktop-server.mjs"
"%NOMA_NODE%" "%NOMA_SERVER%" --dist="%~dp0dist" --open
set "NOMA_EXIT=%ERRORLEVEL%"
if not "%NOMA_EXIT%"=="0" pause
exit /b %NOMA_EXIT%
