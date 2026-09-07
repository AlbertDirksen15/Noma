$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host 'Node.js is required to run Noma. Install it from https://nodejs.org/.'
  Read-Host 'Press Enter to close'
  exit 1
}

if (-not (Test-Path (Join-Path $PSScriptRoot 'dist\index.html'))) {
  Write-Host 'Noma production files are missing. Run npm run build:portable first.'
  Read-Host 'Press Enter to close'
  exit 1
}

$server = Join-Path $PSScriptRoot 'server\desktop-server.mjs'
if (-not (Test-Path $server)) { $server = Join-Path $PSScriptRoot 'scripts\desktop-server.mjs' }
node $server "--dist=$(Join-Path $PSScriptRoot 'dist')" --open
$nomaExit = $LASTEXITCODE
if ($nomaExit -ne 0) { Read-Host 'Press Enter to close' }
exit $nomaExit
