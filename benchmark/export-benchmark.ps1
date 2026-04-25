param(
  [int]$Runs = 3,
  [int]$SampleIntervalSec = 2,
  [switch]$Rebuild
)

$ErrorActionPreference = "Stop"

function Convert-CpuPercent {
  param([string]$CpuText)
  if ([string]::IsNullOrWhiteSpace($CpuText)) { return 0.0 }
  return [double](($CpuText -replace "%", "").Trim())
}

function Get-AvgCpuFromSamples {
  param(
    [System.Collections.Generic.List[double]]$Samples
  )
  if ($Samples.Count -eq 0) { return 0.0 }
  return [Math]::Round((($Samples | Measure-Object -Average).Average), 3)
}

function Get-MetricValue {
  param(
    [object]$MetricNode,
    [string]$PrimaryKey,
    [string]$FallbackKey = ""
  )

  if ($null -eq $MetricNode) { return 0.0 }
  if ($MetricNode.PSObject.Properties.Name -contains "values") {
    $vals = $MetricNode.values
    if ($vals.PSObject.Properties.Name -contains $PrimaryKey) { return [double]$vals.$PrimaryKey }
    if ($FallbackKey -and $vals.PSObject.Properties.Name -contains $FallbackKey) { return [double]$vals.$FallbackKey }
  }
  if ($MetricNode.PSObject.Properties.Name -contains $PrimaryKey) { return [double]$MetricNode.$PrimaryKey }
  if ($FallbackKey -and $MetricNode.PSObject.Properties.Name -contains $FallbackKey) { return [double]$MetricNode.$FallbackKey }
  return 0.0
}

function Wait-Endpoint {
  param(
    [string]$Url,
    [int]$TimeoutSec = 60
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $resp = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -MaximumRedirection 0
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) { return }
    } catch {
      # Keep waiting until timeout.
    }
    Start-Sleep -Seconds 2
  }
}

function Run-OneCase {
  param(
    [string]$Architecture,
    [string]$UseMonolithValue,
    [string[]]$TargetContainers,
    [string]$OutputDir,
    [int]$RunIndex,
    [int]$SampleIntervalSec
  )

  $slug = $Architecture.ToLowerInvariant()
  $jsonPath = Join-Path $OutputDir "$slug-run$RunIndex-summary.json"
  $logPath = Join-Path $OutputDir "$slug-run$RunIndex-k6.log"
  $cpuSamplesPath = Join-Path $OutputDir "$slug-run$RunIndex-cpu-samples.csv"

  "timestamp,architecture,run,container,cpu_percent" | Out-File -FilePath $cpuSamplesPath -Encoding utf8

  if ($Architecture -eq "Monolith") {
    Wait-Endpoint -Url "http://localhost:3000/api/v1/courses" -TimeoutSec 60
  } else {
    Wait-Endpoint -Url "http://localhost:4000/api/v1/courses" -TimeoutSec 60
  }

  $runFolderName = Split-Path -Leaf $OutputDir
  $jsonPathInContainer = "/work/results/$runFolderName/$slug-run$RunIndex-summary.json"

  $argumentList = @(
    "run", "--rm",
    "-e", "USE_MONOLITH=$UseMonolithValue",
    "-v", "${PWD}:/work",
    "-w", "/work",
    "grafana/k6",
    "run",
    "--summary-export", $jsonPathInContainer,
    "k6/test.js"
  )

  $k6 = Start-Process -FilePath "docker" -ArgumentList $argumentList -NoNewWindow -RedirectStandardOutput $logPath -PassThru
  $cpuTotals = New-Object 'System.Collections.Generic.List[double]'

  while (-not $k6.HasExited) {
    $stats = & docker stats --no-stream --format "{{.Name}},{{.CPUPerc}}" $TargetContainers 2>$null
    if ($LASTEXITCODE -eq 0 -and $stats) {
      $now = (Get-Date).ToString("o")
      $sum = 0.0
      foreach ($line in $stats) {
        $parts = $line -split ",", 2
        if ($parts.Count -eq 2) {
          $name = $parts[0].Trim()
          $cpu = Convert-CpuPercent $parts[1]
          $sum += $cpu
          "$now,$Architecture,$RunIndex,$name,$cpu" | Out-File -FilePath $cpuSamplesPath -Append -Encoding utf8
        }
      }
      $cpuTotals.Add([Math]::Round($sum, 3))
    }
    Start-Sleep -Seconds $SampleIntervalSec
    $k6.Refresh()
  }

  if ($k6.ExitCode -ne 0 -and -not (Test-Path $jsonPath)) {
    throw "k6 failed for $Architecture run $RunIndex. Check $logPath"
  }

  $summary = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json
  [pscustomobject]@{
    timestamp       = (Get-Date).ToString("o")
    architecture    = $Architecture
    run             = $RunIndex
    rps             = [Math]::Round((Get-MetricValue -MetricNode $summary.metrics.http_reqs -PrimaryKey "rate"), 3)
    http_reqs_count = [int64](Get-MetricValue -MetricNode $summary.metrics.http_reqs -PrimaryKey "count")
    avg_ms          = [Math]::Round((Get-MetricValue -MetricNode $summary.metrics.http_req_duration -PrimaryKey "avg"), 3)
    p95_ms          = [Math]::Round((Get-MetricValue -MetricNode $summary.metrics.http_req_duration -PrimaryKey "p(95)"), 3)
    p99_ms          = [Math]::Round((Get-MetricValue -MetricNode $summary.metrics.http_req_duration -PrimaryKey "p(99)"), 3)
    avg_cpu_percent = Get-AvgCpuFromSamples $cpuTotals
    cpu_samples     = $cpuTotals.Count
    summary_json    = [IO.Path]::GetFileName($jsonPath)
    k6_log          = [IO.Path]::GetFileName($logPath)
    cpu_samples_csv = [IO.Path]::GetFileName($cpuSamplesPath)
  }
}

Write-Host "Preparing benchmark stack..."
if ($Rebuild) {
  docker compose -f docker-compose.benchmark.yml up -d --build | Out-Null
} else {
  docker compose -f docker-compose.benchmark.yml up -d | Out-Null
}

$resultsDir = Join-Path $PWD "results"
if (-not (Test-Path $resultsDir)) { New-Item -ItemType Directory -Path $resultsDir | Out-Null }
$runDir = Join-Path $resultsDir ("run-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $runDir | Out-Null

$allRows = @()

for ($i = 1; $i -le $Runs; $i++) {
  Write-Host "Run $i/$Runs - Monolith"
  $allRows += Run-OneCase -Architecture "Monolith" -UseMonolithValue "true" -TargetContainers @(
    "benchmark_monolith",
    "benchmark_monolith_db"
  ) -OutputDir $runDir -RunIndex $i -SampleIntervalSec $SampleIntervalSec

  Write-Host "Run $i/$Runs - Microservices"
  $allRows += Run-OneCase -Architecture "Microservices" -UseMonolithValue "false" -TargetContainers @(
    "benchmark_api_gateway",
    "benchmark_account_service",
    "benchmark_course_service",
    "benchmark_academic_service",
    "benchmark_account_db",
    "benchmark_course_db",
    "benchmark_academic_db",
    "benchmark_rabbitmq"
  ) -OutputDir $runDir -RunIndex $i -SampleIntervalSec $SampleIntervalSec
}

$allRunsCsv = Join-Path $runDir "benchmark-all-runs.csv"
$allRows | Export-Csv -Path $allRunsCsv -NoTypeInformation -Encoding utf8

$summaryRows = $allRows |
  Group-Object architecture |
  ForEach-Object {
    $items = $_.Group
    [pscustomobject]@{
      architecture    = $_.Name
      runs            = $items.Count
      rps_avg         = [Math]::Round((($items.rps | Measure-Object -Average).Average), 3)
      avg_ms_avg      = [Math]::Round((($items.avg_ms | Measure-Object -Average).Average), 3)
      p95_ms_avg      = [Math]::Round((($items.p95_ms | Measure-Object -Average).Average), 3)
      p99_ms_avg      = [Math]::Round((($items.p99_ms | Measure-Object -Average).Average), 3)
      cpu_percent_avg = [Math]::Round((($items.avg_cpu_percent | Measure-Object -Average).Average), 3)
    }
  }

$summaryCsv = Join-Path $runDir "benchmark-summary.csv"
$summaryRows | Export-Csv -Path $summaryCsv -NoTypeInformation -Encoding utf8

Write-Host ""
Write-Host "Done."
Write-Host "Detailed CSV: $allRunsCsv"
Write-Host "Summary CSV : $summaryCsv"
Write-Host "Run folder   : $runDir"
