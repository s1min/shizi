param(
  [string]$Repo,
  [string]$Token,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path "$PSScriptRoot\..")

function Resolve-Repo {
  param([string]$InputRepo)
  if ($InputRepo) {
    return $InputRepo
  }

  $remote = (git remote get-url origin).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remote)) {
    throw "Failed to resolve git origin remote. Pass -Repo <owner/repo>."
  }

  $match = [regex]::Match($remote, "github\.com[:/](?<slug>[^/]+/[^/]+?)(?:\.git)?$")
  if (-not $match.Success) {
    throw "Cannot parse GitHub repo from origin remote: $remote. Pass -Repo <owner/repo>."
  }

  return $match.Groups["slug"].Value
}

function Resolve-Token {
  param([string]$InputToken)
  if ($InputToken) {
    return $InputToken
  }
  if ($env:GITHUB_TOKEN) {
    return $env:GITHUB_TOKEN
  }
  if ($env:GH_TOKEN) {
    return $env:GH_TOKEN
  }
  throw "Missing GitHub token. Set -Token or env GITHUB_TOKEN / GH_TOKEN."
}

function Get-Headers {
  param([string]$AuthToken)
  return @{
    Authorization           = "Bearer $AuthToken"
    Accept                  = "application/vnd.github+json"
    "X-GitHub-Api-Version"  = "2022-11-28"
    "User-Agent"            = "shizi-label-bootstrap"
  }
}

function Label-Exists {
  param(
    [string]$RepoSlug,
    [hashtable]$Headers,
    [string]$Name
  )
  $encoded = [uri]::EscapeDataString($Name)
  $uri = "https://api.github.com/repos/$RepoSlug/labels/$encoded"
  try {
    Invoke-RestMethod -Method Get -Uri $uri -Headers $Headers | Out-Null
    return $true
  } catch {
    if ($null -ne $_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -eq 404) {
      return $false
    }
    throw
  }
}

function Ensure-Label {
  param(
    [string]$RepoSlug,
    [hashtable]$Headers,
    [hashtable]$LabelDef,
    [bool]$Simulate
  )
  $exists = Label-Exists -RepoSlug $RepoSlug -Headers $Headers -Name $LabelDef.name
  $body = @{
    name        = $LabelDef.name
    color       = $LabelDef.color
    description = $LabelDef.description
  } | ConvertTo-Json

  if ($exists) {
    $encoded = [uri]::EscapeDataString($LabelDef.name)
    $uri = "https://api.github.com/repos/$RepoSlug/labels/$encoded"
    if ($Simulate) {
      Write-Host "[DryRun] PATCH $($LabelDef.name)"
      return
    }
    Invoke-RestMethod -Method Patch -Uri $uri -Headers $Headers -Body $body -ContentType "application/json" | Out-Null
    Write-Host "Updated label: $($LabelDef.name)"
    return
  }

  $createUri = "https://api.github.com/repos/$RepoSlug/labels"
  if ($Simulate) {
    Write-Host "[DryRun] POST $($LabelDef.name)"
    return
  }
  Invoke-RestMethod -Method Post -Uri $createUri -Headers $Headers -Body $body -ContentType "application/json" | Out-Null
  Write-Host "Created label: $($LabelDef.name)"
}

$repoSlug = Resolve-Repo -InputRepo $Repo
$authToken = Resolve-Token -InputToken $Token
$headers = Get-Headers -AuthToken $authToken

$labels = @(
  @{ name = "bug"; color = "d73a4a"; description = "Confirmed defect" },
  @{ name = "S0"; color = "b60205"; description = "Blocking core flow or submission" },
  @{ name = "S1"; color = "d93f0b"; description = "Major functional issue" },
  @{ name = "S2"; color = "fbca04"; description = "Minor issue or polish" },
  @{ name = "ios"; color = "1d76db"; description = "Affects iOS mini-program runtime" },
  @{ name = "android"; color = "0e8a16"; description = "Affects Android mini-program runtime" },
  @{ name = "backend"; color = "5319e7"; description = "Backend/API related" },
  @{ name = "frontend"; color = "a371f7"; description = "Frontend or UI related" },
  @{ name = "needs-repro"; color = "e99695"; description = "Needs reproducible steps or evidence" },
  @{ name = "fixed-await-regression"; color = "0e8a16"; description = "Fix merged, waiting regression verification" }
)

foreach ($labelDef in $labels) {
  Ensure-Label -RepoSlug $repoSlug -Headers $headers -LabelDef $labelDef -Simulate:$DryRun
}

Write-Host "Label bootstrap completed for $repoSlug"
