param(
  [Parameter(Mandatory = $true)]
  [string]$RunDir
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $RunDir)) {
  throw "RunDir not found: $RunDir"
}

Write-Host "Validating run dir: $RunDir"

$summaryCsv = Join-Path $RunDir "benchmark-summary.csv"
$allRunsCsv = Join-Path $RunDir "benchmark-all-runs.csv"

if (Test-Path $summaryCsv) {
  $rows = Import-Csv -Path $summaryCsv
  if ($rows.Count -lt 1) { throw "benchmark-summary.csv exists but has no data rows." }
  Write-Host ("[OK] summary rows: " + $rows.Count)
} else {
  Write-Host "[INFO] benchmark-summary.csv not yet generated."
}

if (Test-Path $allRunsCsv) {
  $rows = Import-Csv -Path $allRunsCsv
  if ($rows.Count -lt 1) { throw "benchmark-all-runs.csv exists but has no data rows." }
  Write-Host ("[OK] all-runs rows: " + $rows.Count)
} else {
  Write-Host "[INFO] benchmark-all-runs.csv not yet generated."
}

$jsonFiles = Get-ChildItem -Path $RunDir -File -Filter "*-summary.json"
if ($jsonFiles.Count -eq 0) {
  Write-Host "[INFO] no case summary json yet."
} else {
  foreach ($f in $jsonFiles) {
    $obj = Get-Content -Raw -Path $f.FullName | ConvertFrom-Json
    if ($null -eq $obj.metrics -or $null -eq $obj.metrics.http_reqs) {
      throw "Invalid json schema: $($f.Name)"
    }
  }
  Write-Host ("[OK] summary json files parsed: " + $jsonFiles.Count)
}

$cpuFiles = Get-ChildItem -Path $RunDir -File -Filter "*-cpu-samples.csv"
if ($cpuFiles.Count -gt 0) {
  foreach ($f in $cpuFiles) {
    $header = Get-Content -Path $f.FullName -TotalCount 1
    if ($header -notmatch "^timestamp,architecture,run,users,scenario,workload,source,cpu_percent$") {
      throw "Unexpected cpu csv header: $($f.Name)"
    }
  }
  Write-Host ("[OK] cpu sample csv files checked: " + $cpuFiles.Count)
} else {
  Write-Host "[INFO] no cpu sample csv yet."
}

Write-Host "Validation completed."

