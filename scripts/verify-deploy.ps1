param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Set-Location (Resolve-Path "$PSScriptRoot\..")

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $Command $($Arguments -join ' ')"
  }
}

function Assert-EnvPresent {
  param([string]$Name)
  $ok = Select-String -Path ".env" -Pattern "^\s*$Name\s*=\s*.+$" -Quiet
  if (-not $ok) {
    throw ".env missing required non-empty value: $Name"
  }
}

if (-not (Test-Path ".env")) {
  throw ".env not found in repository root. Create it first: Copy-Item .env.production.example .env"
}

Assert-EnvPresent "JWT_SECRET"
Assert-EnvPresent "WX_APPID"
Assert-EnvPresent "WX_APP_SECRET"

Write-Host "[1/6] Validate compose configuration"
Invoke-Checked -Command "docker" -Arguments @("compose", "config")

if (-not $SkipBuild) {
  Write-Host "[2/6] Build backend image"
  Invoke-Checked -Command "docker" -Arguments @("build", "-f", "shizi-backend/Dockerfile", "-t", "shizi-backend:local-check", ".")
} else {
  Write-Host "[2/6] Skip build (--SkipBuild)"
}

Write-Host "[3/6] Start services"
Invoke-Checked -Command "docker" -Arguments @("compose", "up", "-d")

Write-Host "[4/6] Check health endpoint"
$healthRaw = & curl.exe -fsS http://localhost/api/health
if ($LASTEXITCODE -ne 0) {
  throw "Command failed: curl.exe -fsS http://localhost/api/health"
}
$health = $healthRaw | ConvertFrom-Json
if ($health.data.status -ne "ok") {
  throw "/api/health did not return status=ok. Raw response: $healthRaw"
}

Write-Host "[5/6] Seed data"
Invoke-Checked -Command "docker" -Arguments @("compose", "exec", "-T", "app", "node", "dist/scripts/seed.js")

Write-Host "[6/6] Check libraries endpoint"
$librariesRaw = & curl.exe -fsS http://localhost/api/libraries
if ($LASTEXITCODE -ne 0) {
  throw "Command failed: curl.exe -fsS http://localhost/api/libraries"
}
$libraries = $librariesRaw | ConvertFrom-Json
if ($null -eq $libraries.data -or $libraries.data.Count -eq 0) {
  throw "/api/libraries returned empty data. Raw response: $librariesRaw"
}

Write-Host "Deployment verification passed."
