$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error 'Node.js is required to run Noma. Install it from https://nodejs.org/.'
  Read-Host 'Press Enter to close'
  exit 1
}

if (-not (Test-Path (Join-Path $PSScriptRoot 'dist\index.html'))) {
  Write-Error 'Noma production files are missing. Run npm run build:portable first.'
  Read-Host 'Press Enter to close'
  exit 1
}

node (Join-Path $PSScriptRoot 'server\desktop-server.mjs') "--dist=$(Join-Path $PSScriptRoot 'dist')" --open
if ($LASTEXITCODE -ne 0) { Read-Host 'Press Enter to close' }
