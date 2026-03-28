param(
  [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
  throw "Env file not found: $EnvFile"
}

function Read-EnvMap {
  param([string]$Path)
  $map = @{}
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line)) { return }
    if ($line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -le 0) { return }
    $key = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim()
    if ($value.StartsWith("'") -and $value.EndsWith("'")) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    if ($value.StartsWith('"') -and $value.EndsWith('"')) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    $map[$key] = $value
  }
  return $map
}

function Assert-Required {
  param(
    [hashtable]$Map,
    [string]$Name
  )
  if (-not $Map.ContainsKey($Name) -or [string]::IsNullOrWhiteSpace($Map[$Name])) {
    throw "Required env variable is missing or empty: $Name"
  }
}

function Assert-NotPlaceholder {
  param(
    [string]$Name,
    [string]$Value
  )

  $patterns = @(
    "^replace-with-",
    "^your-",
    "^change-me",
    "^local-check-",
    "example",
    "placeholder"
  )

  foreach ($p in $patterns) {
    if ($Value -match $p) {
      throw "$Name looks like a placeholder value: $Value"
    }
  }
}

$envMap = Read-EnvMap -Path $EnvFile

Assert-Required -Map $envMap -Name "JWT_SECRET"
Assert-Required -Map $envMap -Name "WX_APPID"
Assert-Required -Map $envMap -Name "WX_APP_SECRET"

Assert-NotPlaceholder -Name "JWT_SECRET" -Value $envMap["JWT_SECRET"]
Assert-NotPlaceholder -Name "WX_APPID" -Value $envMap["WX_APPID"]
Assert-NotPlaceholder -Name "WX_APP_SECRET" -Value $envMap["WX_APP_SECRET"]

if ($envMap["JWT_SECRET"].Length -lt 32) {
  throw "JWT_SECRET is too short. Use at least 32 characters."
}

Write-Host "Production env validation passed: $EnvFile"
