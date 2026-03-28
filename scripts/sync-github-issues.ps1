param(
  [string]$Repo,
  [ValidateSet("open", "closed", "all")]
  [string]$State = "open",
  [string]$Label = "bug",
  [ValidateRange(1, 100)]
  [int]$PerPage = 100,
  [string]$OutputPath = "docs/bug_reports/github_issues_open.json",
  [string]$Token
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

function Invoke-IssuePage {
  param(
    [string]$RepoSlug,
    [string]$AuthToken,
    [string]$IssueState,
    [string]$IssueLabel,
    [int]$PageNo,
    [int]$PageSize
  )

  $uri = "https://api.github.com/repos/$RepoSlug/issues?state=$IssueState&per_page=$PageSize&page=$PageNo&sort=updated&direction=desc"
  if (-not [string]::IsNullOrWhiteSpace($IssueLabel)) {
    $encodedLabel = [uri]::EscapeDataString($IssueLabel)
    $uri = "$uri&labels=$encodedLabel"
  }

  $headers = @{
    Authorization           = "Bearer $AuthToken"
    Accept                  = "application/vnd.github+json"
    "X-GitHub-Api-Version"  = "2022-11-28"
    "User-Agent"            = "shizi-issue-sync-script"
  }

  return Invoke-RestMethod -Method Get -Uri $uri -Headers $headers
}

$repoSlug = Resolve-Repo -InputRepo $Repo
$authToken = Resolve-Token -InputToken $Token

$allIssues = @()
$page = 1

while ($true) {
  $pageItems = Invoke-IssuePage -RepoSlug $repoSlug -AuthToken $authToken -IssueState $State -IssueLabel $Label -PageNo $page -PageSize $PerPage
  if ($null -eq $pageItems -or $pageItems.Count -eq 0) {
    break
  }

  foreach ($item in $pageItems) {
    if ($null -ne $item.pull_request) {
      continue
    }

    $allIssues += [pscustomobject]@{
      number     = $item.number
      title      = $item.title
      state      = $item.state
      labels     = @($item.labels | ForEach-Object { $_.name })
      url        = $item.html_url
      created_at = $item.created_at
      updated_at = $item.updated_at
      user       = $item.user.login
      assignees  = @($item.assignees | ForEach-Object { $_.login })
      body       = $item.body
    }
  }

  if ($pageItems.Count -lt $PerPage) {
    break
  }
  $page += 1
}

$outDir = Split-Path -Path $OutputPath -Parent
if (-not [string]::IsNullOrWhiteSpace($outDir) -and -not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$payload = [pscustomobject]@{
  generated_at = (Get-Date).ToString("o")
  repo         = $repoSlug
  state        = $State
  label        = $Label
  count        = $allIssues.Count
  items        = $allIssues
}

$payload | ConvertTo-Json -Depth 8 | Set-Content -Path $OutputPath -Encoding utf8

Write-Host "Synced $($allIssues.Count) issues from $repoSlug to $OutputPath"
