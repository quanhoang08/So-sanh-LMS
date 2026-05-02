param(
  [int]$Runs = 3,
  [int]$SampleIntervalSec = 2,
  [ValidateSet("ramp", "concurrent")]
  [string]$ScenarioType = "ramp",
  [ValidateSet("mixed", "read", "write", "stress")]
  [string]$WorkloadType = "mixed",
  [string]$UserLevels = "100,500,1000",
  [int]$StageStepVus = 100,
  [string]$StageDuration = "30s",
  [string]$ConcurrentDuration = "2m",
  [string]$BaseUrl = "http://localhost:5000",
  [int]$CaseRetryCount = 1,
  [int]$RetryDelaySec = 20,
  [int]$CaseCooldownSec = 5,
  [double]$MaxFailedRequestRate = 0.05,
  [switch]$SkipHealthCheck
)

$ErrorActionPreference = "Stop"

# Đảm bảo working directory luôn là thư mục chứa script này (benchmark/)
# để Resolve-Path "./k6/test.js" và ".\plot_results.py" hoạt động đúng dù gọi từ đâu
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
$parsedUserLevels = @(
  $UserLevels -split "[,; ]+" |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
    ForEach-Object { [int]$_ } |
    Sort-Object -Unique
)
if ($parsedUserLevels.Count -eq 0) {
  throw "UserLevels khong hop le. Vi du: -UserLevels `"100,500,1000`""
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
    [hashtable]$Headers = @{},
    [int]$TimeoutSec = 60
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $resp = Invoke-WebRequest -Uri $Url -Method GET -Headers $Headers -TimeoutSec 5 -MaximumRedirection 0 -UseBasicParsing -ErrorAction Stop
      if ( ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) -or $resp.StatusCode -eq 401 -or $resp.StatusCode -eq 403 ) {
        return $true
      }
    } catch {
      # 401/403 có thể được throw exception; lấy StatusCode từ exception để vẫn coi service đã sẵn sàng.
      try {
        $statusFromExceptionRaw = $_.Exception.Response.StatusCode
        $statusFromException = $null
        try {
          $statusFromException = [int]$statusFromExceptionRaw
        } catch {
          # Fallback cho trường hợp StatusCode là enum/obj khác
          try { $statusFromException = $statusFromExceptionRaw.value__ } catch { }
        }

        if ($null -ne $statusFromException) {
          if ( ($statusFromException -ge 200 -and $statusFromException -lt 400) -or $statusFromException -eq 401 -or $statusFromException -eq 403 ) {
            return $true
          }
        }
      } catch {
        # Keep waiting until timeout.
      }
    }
    Start-Sleep -Seconds 2
  }
  return $false
}

function Get-HostCpuPercent {
  try {
    $counter = Get-Counter '\Processor(_Total)\% Processor Time' -ErrorAction Stop
    return [Math]::Round([double]$counter.CounterSamples[0].CookedValue, 3)
  } catch {
    return 0.0
  }
}

function Convert-CpuPercentString {
  param([string]$CpuPerc)

  if ([string]::IsNullOrWhiteSpace($CpuPerc)) { return $null }
  $clean = $CpuPerc.Trim().Replace('%', '').Replace(',', '.')
  try {
    return [Math]::Round([double]$clean, 3)
  } catch {
    return $null
  }
}

function Get-DockerCpuSamples {
  param([string]$Architecture)

  if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    return @()
  }

  $arch = $Architecture.ToLowerInvariant()
  $namePatterns = if ($arch -eq "microservices") {
    @(
      'account_service', 'course_service', 'academic_service',
      'api_gateway', 'rabbitmq', 'account_db', 'course_db', 'academic_db',
      'lms_frontend', 'frontend-gateway'
    )
  } else {
    @('lms_backend', 'monolithic', 'postgres', 'lms-monolithic')
  }

  try {
    $lines = & docker stats --no-stream --format "{{.Name}},{{.CPUPerc}}" 2>$null
    if ($LASTEXITCODE -ne 0 -or $null -eq $lines) { return @() }

    $samples = @()
    foreach ($line in $lines) {
      if ([string]::IsNullOrWhiteSpace($line)) { continue }
      $parts = $line.Split(',', 2)
      if ($parts.Count -lt 2) { continue }
      $name = $parts[0].Trim()
      $cpu = Convert-CpuPercentString -CpuPerc $parts[1]
      if ($null -eq $cpu) { continue }

      $lname = $name.ToLowerInvariant()
      $matched = $false
      foreach ($pattern in $namePatterns) {
        if ($lname -like "*$pattern*") {
          $matched = $true
          break
        }
      }
      if (-not $matched) { continue }

      $samples += [pscustomobject]@{
        name = $name
        cpu  = $cpu
      }
    }

    return $samples
  } catch {
    return @()
  }
}

function Get-FailedRequestRate {
  param(
    [object]$Summary
  )
  if ($null -eq $Summary -or $null -eq $Summary.metrics) { return 1.0 }

  $failedNode = $Summary.metrics.http_req_failed
  $reqNode = $Summary.metrics.http_reqs
  $fails = 0.0
  $total = 0.0

  # k6 summary-export can expose authoritative failed ratio as `value` (0..1),
  # while `fails/passes` fields are inconsistent across versions/formats.
  if ($null -ne $failedNode) {
    $ratioFromValue = Get-MetricValue -MetricNode $failedNode -PrimaryKey "value"
    if ($ratioFromValue -ge 0 -and $ratioFromValue -le 1) {
      return [double]$ratioFromValue
    }
  }

  if ($null -ne $reqNode) {
    $total = Get-MetricValue -MetricNode $reqNode -PrimaryKey "count"
  }
  if ($null -ne $failedNode) {
    $fails = Get-MetricValue -MetricNode $failedNode -PrimaryKey "fails"
  }

  if ($total -le 0) { return 1.0 }
  return [double]($fails / $total)
}

function New-RetryCsvWriter {
  param(
    [string]$Path,
    [int]$MaxRetries = 20,
    [int]$RetryDelayMs = 200
  )

  for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
    try {
      $dir = Split-Path -Parent $Path
      if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
      }

      $fs = [System.IO.File]::Open(
        $Path,
        [System.IO.FileMode]::Create,
        [System.IO.FileAccess]::Write,
        [System.IO.FileShare]::ReadWrite
      )
      $writer = New-Object System.IO.StreamWriter($fs, [System.Text.UTF8Encoding]::new($false))
      $writer.AutoFlush = $true
      return $writer
    } catch [System.IO.IOException] {
      if ($attempt -ge $MaxRetries) {
        throw "Khong mo duoc file $Path sau $MaxRetries lan thu. Co the file dang bi lock boi tien trinh khac."
      }
      Start-Sleep -Milliseconds $RetryDelayMs
    }
  }
}

function Run-OneCase {
  param(
    [string]$Architecture,
    [string]$UseMonolithValue,
    [string]$OutputDir,
    [int]$Users,
    [int]$RunIndex,
    [int]$SampleIntervalSec,
    [string]$ScenarioType,
    [string]$WorkloadType,
    [int]$StageStepVus,
    [string]$StageDuration,
    [string]$ConcurrentDuration,
    [string]$BaseUrl,
    [bool]$SkipHealthCheck = $false
  )

  $slug = $Architecture.ToLowerInvariant()
  $safeScenario = $ScenarioType.ToLowerInvariant()
  $safeWorkload = $WorkloadType.ToLowerInvariant()
  $casePrefix = "$slug-u$Users-$safeScenario-$safeWorkload-run$RunIndex"
  $jsonPath = Join-Path $OutputDir "$casePrefix-summary.json"
  $cpuSamplesPath = Join-Path $OutputDir "$casePrefix-cpu-samples.csv"
  $benchmarkTarget = if ($Architecture -eq "Monolith") { "monolith" } else { "microservices" }

  $cpuWriter = $null

  if (-not $SkipHealthCheck) {
    $healthUrl = "$($BaseUrl.TrimEnd('/'))/api/v1/courses"
    $isEndpointReady = Wait-Endpoint -Url $healthUrl -Headers @{ "X-Benchmark-Target" = $benchmarkTarget } -TimeoutSec 60
    if (-not $isEndpointReady) {
      throw "Endpoint $BaseUrl chua san sang cho target '$benchmarkTarget'. Stop de tranh tao dataset sai ($casePrefix)."
    }
  }

  $k6ScriptPath = (Resolve-Path -Path "./k6/test.js").Path
  $k6BaseUrl = $BaseUrl.TrimEnd("/")
  $k6Exe = (Get-Command "k6" -ErrorAction Stop).Source

  $cpuTotals = New-Object 'System.Collections.Generic.List[double]'
  $maxAttempts = [Math]::Max(1, $CaseRetryCount + 1)
  $k6ExitCode = 1

  for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    if (Test-Path $jsonPath) { Remove-Item -Path $jsonPath -Force }
    if ($null -ne $cpuWriter) {
      $cpuWriter.Dispose()
      $cpuWriter = $null
    }
    $cpuWriter = New-RetryCsvWriter -Path $cpuSamplesPath
    $cpuWriter.WriteLine("timestamp,architecture,run,users,scenario,workload,source,cpu_percent")

    # Run k6 via background PowerShell job for CPU sampling, while k6 runs synchronously
    # This avoids ALL cmd.exe/ProcessStartInfo quoting issues with spaces in paths
    $cpuJobScript = {
      param($cpuSamplesPath, $Architecture, $RunIndex, $Users, $ScenarioType, $WorkloadType, $SampleIntervalSec)
      # Signal file: stop when this file is created
      $stopFile = "$cpuSamplesPath.stop"
      while (-not (Test-Path $stopFile)) {
        try {
          $now = (Get-Date).ToString("o")
          # Host CPU
          $counter = Get-Counter '\Processor(_Total)\% Processor Time' -ErrorAction Stop
          $cpu = [Math]::Round([double]$counter.CounterSamples[0].CookedValue, 3)
          Add-Content -Path $cpuSamplesPath -Value "$now,$Architecture,$RunIndex,$Users,$ScenarioType,$WorkloadType,host_total,$cpu"
          # Docker containers
          if (Get-Command "docker" -ErrorAction SilentlyContinue) {
            $arch = $Architecture.ToLowerInvariant()
            $patterns = if ($arch -eq "microservices") { @('account_service','course_service','academic_service','api_gateway','rabbitmq','account_db','course_db','academic_db','lms_frontend','frontend-gateway') } else { @('lms_backend','monolithic','postgres','lms-monolithic') }
            $lines = & docker stats --no-stream --format "{{.Name}},{{.CPUPerc}}" 2>$null
            foreach ($line in $lines) {
              if ([string]::IsNullOrWhiteSpace($line)) { continue }
              $parts = $line.Split(',', 2)
              if ($parts.Count -lt 2) { continue }
              $name = $parts[0].Trim()
              $lname = $name.ToLowerInvariant()
              $matched = $false
              foreach ($p in $patterns) { if ($lname -like "*$p*") { $matched = $true; break } }
              if (-not $matched) { continue }
              $cpuStr = $parts[1].Trim().Replace('%','').Replace(',','.')
              try { $cpuVal = [Math]::Round([double]$cpuStr, 3) } catch { continue }
              $esc = $name.Replace(',','_')
              Add-Content -Path $cpuSamplesPath -Value "$now,$Architecture,$RunIndex,$Users,$ScenarioType,$WorkloadType,container:$esc,$cpuVal"
            }
          }
        } catch { }
        Start-Sleep -Seconds $SampleIntervalSec
      }
    }

    # Start CPU sampling job
    $cpuJob = Start-Job -ScriptBlock $cpuJobScript -ArgumentList $cpuSamplesPath, $Architecture, $RunIndex, $Users, $ScenarioType, $WorkloadType, $SampleIntervalSec
    $stopFile = "$cpuSamplesPath.stop"
    Remove-Item -Path $stopFile -Force -ErrorAction SilentlyContinue

    try {
      # Run k6 synchronously - PowerShell & operator handles spaces in paths correctly
      $env:USE_MONOLITH        = $UseMonolithValue
      $env:TARGET_ARCH         = $benchmarkTarget
      $env:SCENARIO_TYPE       = $ScenarioType
      $env:WORKLOAD_TYPE       = $WorkloadType
      $env:TARGET_VUS          = "$Users"
      $env:RAMP_MAX_VUS        = "$Users"
      $env:STAGE_STEP_VUS      = "$StageStepVus"
      $env:STAGE_DURATION      = $StageDuration
      $env:CONCURRENT_DURATION = $ConcurrentDuration
      $env:BENCHMARK_BASE_URL  = $k6BaseUrl
      $env:REQUEST_TIMEOUT     = "30s"

      # Temporarily allow stderr from k6 (warnings like gracefulRampDown) without throwing
      $prevEAP = $ErrorActionPreference
      $ErrorActionPreference = "Continue"
      $k6Out = & $k6Exe run --quiet --summary-export $jsonPath $k6ScriptPath 2>$null
      $k6ExitCode = $LASTEXITCODE
      $ErrorActionPreference = $prevEAP
    } finally {
      # Signal CPU job to stop
      New-Item -Path $stopFile -ItemType File -Force | Out-Null
      $null = Wait-Job $cpuJob -Timeout 10
      Remove-Job $cpuJob -Force -ErrorAction SilentlyContinue
      Remove-Item -Path $stopFile -Force -ErrorAction SilentlyContinue
      if ($null -ne $cpuWriter) { $cpuWriter.Dispose(); $cpuWriter = $null }
    }


    if ($k6ExitCode -eq 0 -and (Test-Path $jsonPath)) { break }
    if ($attempt -lt $maxAttempts) {
      Write-Warning "Retrying $Architecture run $RunIndex users $Users (attempt $($attempt + 1)/$maxAttempts) after ${RetryDelaySec}s..."
      Start-Sleep -Seconds $RetryDelaySec
    }
  }

  if ($k6ExitCode -ne 0 -and -not (Test-Path $jsonPath)) {
    throw "k6 failed for $Architecture run $RunIndex (users $Users). Exit code: $k6ExitCode"
  }

  $summary = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json
  $failedRequestRate = [Math]::Round((Get-FailedRequestRate -Summary $summary), 6)
  if ($failedRequestRate -gt $MaxFailedRequestRate) {
    Write-Warning (
      "Canh bao: http_req_failed rate qua cao cho ${casePrefix}: " +
      "$([Math]::Round($failedRequestRate * 100, 3))% > $([Math]::Round($MaxFailedRequestRate * 100, 3))%. " +
      "Tuy nhien kich ban van se tiep tuc theo yeu cau."
    )
  }

  if (Test-Path $jsonPath) { Remove-Item -Path $jsonPath -Force }

  # Read avg CPU from the CSV written by background job (host_total lines only)
  $avgCpu = 0.0
  $cpuSampleCount = 0
  if (Test-Path $cpuSamplesPath) {
    $cpuLines = Get-Content $cpuSamplesPath | Select-Object -Skip 1  # skip header
    $hostCpuVals = foreach ($line in $cpuLines) {
      $cols = $line.Split(',')
      if ($cols.Count -ge 8 -and $cols[6] -eq 'host_total') {
        try { [double]$cols[7] } catch { }
      }
    }
    $hostCpuArr = @($hostCpuVals)
    $cpuSampleCount = $hostCpuArr.Count
    if ($cpuSampleCount -gt 0) {
      $avgCpu = [Math]::Round((($hostCpuArr | Measure-Object -Average).Average), 3)
    }
  }

  [pscustomobject]@{
    timestamp       = (Get-Date).ToString("o")
    architecture    = $Architecture
    run             = $RunIndex
    users           = $Users
    scenario        = $ScenarioType
    workload        = $WorkloadType
    rps             = [Math]::Round((Get-MetricValue -MetricNode $summary.metrics.http_reqs -PrimaryKey "rate"), 3)
    http_reqs_count = [int64](Get-MetricValue -MetricNode $summary.metrics.http_reqs -PrimaryKey "count")
    avg_ms          = [Math]::Round((Get-MetricValue -MetricNode $summary.metrics.http_req_duration -PrimaryKey "avg"), 3)
    p95_ms          = [Math]::Round((Get-MetricValue -MetricNode $summary.metrics.http_req_duration -PrimaryKey "p(95)"), 3)
    p99_ms          = [Math]::Round((Get-MetricValue -MetricNode $summary.metrics.http_req_duration -PrimaryKey "p(99)"), 3)
    http_req_failed_rate = $failedRequestRate
    avg_cpu_percent = $avgCpu
    cpu_samples     = $cpuSampleCount
    cpu_samples_csv = [IO.Path]::GetFileName($cpuSamplesPath)
  }
}

if (-not (Get-Command "k6" -ErrorAction SilentlyContinue)) {
  throw "Khong tim thay lenh 'k6'. Cai k6 truoc khi benchmark native: https://k6.io/docs/get-started/installation/"
}

Write-Host "Preparing native benchmark..."
Write-Host "Benchmark base URL: $BaseUrl"
if (-not $SkipHealthCheck) {
  if (-not (Wait-Endpoint -Url "$($BaseUrl.TrimEnd('/'))/api/v1/courses" -Headers @{ "X-Benchmark-Target" = "monolith" } -TimeoutSec 20)) {
    throw "Monolith endpoint chua san sang tren $BaseUrl (header monolith). Neu chay native, hay start router bang .\start-native-router.ps1."
  }
  if (-not (Wait-Endpoint -Url "$($BaseUrl.TrimEnd('/'))/api/v1/courses" -Headers @{ "X-Benchmark-Target" = "microservices" } -TimeoutSec 20)) {
    throw "Microservices endpoint chua san sang tren $BaseUrl (header microservices). Neu chay native, hay start router bang .\start-native-router.ps1."
  }
} else {
  Write-Host "SkipHealthCheck enabled: bo qua endpoint readiness check."
}

$resultsDir = Join-Path $PWD "results"
if (-not (Test-Path $resultsDir)) { New-Item -ItemType Directory -Path $resultsDir | Out-Null }
$runDir = Join-Path $resultsDir ("run-" + (Get-Date -Format "yyyyMMdd-HHmmss") + "-$WorkloadType")
New-Item -ItemType Directory -Path $runDir -Force | Out-Null

$allRows = [System.Collections.ArrayList]@()

for ($i = 1; $i -le $Runs; $i++) {
  foreach ($users in $parsedUserLevels) {
    Write-Host "Run $i/$Runs - Users $users - Monolith"
    $null = $allRows.Add((Run-OneCase -Architecture "Monolith" -UseMonolithValue "true" -OutputDir $runDir -Users $users -RunIndex $i -SampleIntervalSec $SampleIntervalSec -ScenarioType $ScenarioType -WorkloadType $WorkloadType -StageStepVus $StageStepVus -StageDuration $StageDuration -ConcurrentDuration $ConcurrentDuration -BaseUrl $BaseUrl -SkipHealthCheck:$SkipHealthCheck))

    Write-Host "Run $i/$Runs - Users $users - Microservices"
    $null = $allRows.Add((Run-OneCase -Architecture "Microservices" -UseMonolithValue "false" -OutputDir $runDir -Users $users -RunIndex $i -SampleIntervalSec $SampleIntervalSec -ScenarioType $ScenarioType -WorkloadType $WorkloadType -StageStepVus $StageStepVus -StageDuration $StageDuration -ConcurrentDuration $ConcurrentDuration -BaseUrl $BaseUrl -SkipHealthCheck:$SkipHealthCheck))

    if ($CaseCooldownSec -gt 0) {
      Start-Sleep -Seconds $CaseCooldownSec
    }

    # Progressive Export & Plot
    $allRunsCsv = Join-Path $runDir "benchmark-all-runs.csv"
    $allRows.GetEnumerator() | Export-Csv -Path $allRunsCsv -NoTypeInformation -Encoding utf8

    $summaryRowsTmp = $allRows.GetEnumerator() |
      Group-Object architecture, users, scenario, workload |
      ForEach-Object {
        $items = $_.Group
        [pscustomobject]@{
          architecture    = $items[0].architecture
          users           = $items[0].users
          scenario        = $items[0].scenario
          workload        = $items[0].workload
          runs            = $items.Count
          rps_avg         = [Math]::Round((($items.rps | Measure-Object -Average).Average), 3)
          avg_ms_avg      = [Math]::Round((($items.avg_ms | Measure-Object -Average).Average), 3)
          p95_ms_avg      = [Math]::Round((($items.p95_ms | Measure-Object -Average).Average), 3)
          p99_ms_avg      = [Math]::Round((($items.p99_ms | Measure-Object -Average).Average), 3)
          cpu_percent_avg = [Math]::Round((($items.avg_cpu_percent | Measure-Object -Average).Average), 3)
        }
      }
    $summaryCsv = Join-Path $runDir "benchmark-summary.csv"
    $summaryRowsTmp | Export-Csv -Path $summaryCsv -NoTypeInformation -Encoding utf8

    Write-Host "Updating progressive charts for Users=$users..." -ForegroundColor Cyan
    & python ".\plot_results.py" --run-dir $runDir | Out-Null
    Write-Host "Charts updated. Kiem tra thu muc 'charts' trong folder ket qua hien tai." -ForegroundColor Yellow
  }
}

$summaryRows = $allRows.GetEnumerator() |
  Group-Object architecture, users, scenario, workload |
  ForEach-Object {
    $items = $_.Group
    [pscustomobject]@{
      architecture    = $items[0].architecture
      users           = $items[0].users
      scenario        = $items[0].scenario
      workload        = $items[0].workload
      runs            = $items.Count
      rps_avg         = [Math]::Round((($items.rps | Measure-Object -Average).Average), 3)
      avg_ms_avg      = [Math]::Round((($items.avg_ms | Measure-Object -Average).Average), 3)
      p95_ms_avg      = [Math]::Round((($items.p95_ms | Measure-Object -Average).Average), 3)
      p99_ms_avg      = [Math]::Round((($items.p99_ms | Measure-Object -Average).Average), 3)
      cpu_percent_avg = [Math]::Round((($items.avg_cpu_percent | Measure-Object -Average).Average), 3)
    }
  }

$summaryCsv = Join-Path $runDir "benchmark-summary.csv"
@($summaryRows) | Export-Csv -Path $summaryCsv -NoTypeInformation -Encoding utf8

$summaryJson = Join-Path $runDir "benchmark-summary.json"
$summaryRows | ConvertTo-Json -Depth 6 | Set-Content -Path $summaryJson -Encoding UTF8

$overallRows = $allRows.GetEnumerator() |
  Group-Object architecture, scenario, workload |
  ForEach-Object {
    $items = $_.Group
    [pscustomobject]@{
      architecture    = $items[0].architecture
      scenario        = $items[0].scenario
      workload        = $items[0].workload
      runs            = $items.Count
      users_tested    = @($items.users | Sort-Object -Unique)
      rps_avg         = [Math]::Round((($items.rps | Measure-Object -Average).Average), 3)
      avg_ms_avg      = [Math]::Round((($items.avg_ms | Measure-Object -Average).Average), 3)
      p95_ms_avg      = [Math]::Round((($items.p95_ms | Measure-Object -Average).Average), 3)
      p99_ms_avg      = [Math]::Round((($items.p99_ms | Measure-Object -Average).Average), 3)
      cpu_percent_avg = [Math]::Round((($items.avg_cpu_percent | Measure-Object -Average).Average), 3)
    }
  }

$overallJson = Join-Path $runDir "benchmark-overall.json"
$overallRows | ConvertTo-Json -Depth 6 | Set-Content -Path $overallJson -Encoding UTF8

Write-Host ""
Write-Host "Done."
Write-Host "Detailed CSV: $allRunsCsv"
Write-Host "Summary CSV : $summaryCsv"
Write-Host "Summary JSON: $summaryJson"
Write-Host "Overall JSON: $overallJson"
Write-Host "Run folder   : $runDir"
