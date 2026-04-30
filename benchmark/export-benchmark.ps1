param(
  [int]$Runs = 3,
  [int]$SampleIntervalSec = 2,
  [ValidateSet("ramp", "concurrent")]
  [string]$ScenarioType = "ramp",
  [ValidateSet("mixed", "read", "write")]
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
  $logPath = Join-Path $OutputDir "$casePrefix-k6.log"
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

  $cpuTotals = New-Object 'System.Collections.Generic.List[double]'
  $maxAttempts = [Math]::Max(1, $CaseRetryCount + 1)
  $k6ExitCode = 1

  for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    if (Test-Path $jsonPath) { Remove-Item -Path $jsonPath -Force }
    if (Test-Path $logPath) { Remove-Item -Path $logPath -Force }
    $errPath = Join-Path $OutputDir "$casePrefix-stderr.log"
    if (Test-Path $errPath) { Remove-Item -Path $errPath -Force }
    if ($null -ne $cpuWriter) {
      $cpuWriter.Dispose()
      $cpuWriter = $null
    }
    $cpuWriter = New-RetryCsvWriter -Path $cpuSamplesPath
    $cpuWriter.WriteLine("timestamp,architecture,run,users,scenario,workload,source,cpu_percent")

    # Use ProcessStartInfo for compatibility with both Windows PowerShell 5.1 and PowerShell 7+.
    $k6Env = @{
      USE_MONOLITH        = $UseMonolithValue
      TARGET_ARCH         = $benchmarkTarget
      SCENARIO_TYPE       = $ScenarioType
      WORKLOAD_TYPE       = $WorkloadType
      TARGET_VUS          = "$Users"
      RAMP_MAX_VUS        = "$Users"
      STAGE_STEP_VUS      = "$StageStepVus"
      STAGE_DURATION      = $StageDuration
      CONCURRENT_DURATION = $ConcurrentDuration
      BENCHMARK_BASE_URL  = $k6BaseUrl
      REQUEST_TIMEOUT     = "30s"
    }

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.WorkingDirectory = $PWD.Path
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $false
    $psi.RedirectStandardError = $false
    $psi.Arguments = "/d /c k6 run --summary-export `"$jsonPath`" `"$k6ScriptPath`" 1>`"$logPath`" 2>`"$errPath`""
    foreach ($kv in $k6Env.GetEnumerator()) {
      $psi.Environment[$kv.Key] = [string]$kv.Value
    }

    $k6 = New-Object System.Diagnostics.Process
    $k6.StartInfo = $psi
    [void]$k6.Start()

    try {
      while (-not $k6.HasExited) {
        $now = (Get-Date).ToString("o")
        $cpu = Get-HostCpuPercent
        $cpuWriter.WriteLine("$now,$Architecture,$RunIndex,$Users,$ScenarioType,$WorkloadType,host_total,$cpu")
        $cpuTotals.Add($cpu)
        Start-Sleep -Seconds $SampleIntervalSec
        $k6.Refresh()
      }
    } finally {
      if ($null -ne $cpuWriter) {
        $cpuWriter.Dispose()
        $cpuWriter = $null
      }
    }

    $k6ExitCode = $k6.ExitCode
    $k6.Dispose()

    if (Test-Path $errPath) {
      Get-Content -Path $errPath | Out-File -FilePath $logPath -Append -Encoding utf8
      Remove-Item -Path $errPath -Force
    }

    if (Test-Path $logPath) {
      $logText = Get-Content -Raw -Path $logPath
      if ($logText -match "cannot allocate memory") {
        throw "May khong du RAM de chay k6 (`"$casePrefix`"). Hay giam VU hoac dong bot ung dung nen, sau do chay lai."
      }
    }

    if ($k6ExitCode -eq 0 -and (Test-Path $jsonPath)) { break }
    if ($attempt -lt $maxAttempts) {
      Write-Warning "Retrying $Architecture run $RunIndex users $Users (attempt $($attempt + 1)/$maxAttempts) after ${RetryDelaySec}s..."
      Start-Sleep -Seconds $RetryDelaySec
    }
  }

  if ($k6ExitCode -ne 0 -and -not (Test-Path $jsonPath)) {
    throw "k6 failed for $Architecture run $RunIndex (users $Users). Check $logPath"
  }

  $summary = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json
  $failedRequestRate = [Math]::Round((Get-FailedRequestRate -Summary $summary), 6)
  if ($failedRequestRate -gt $MaxFailedRequestRate) {
    throw (
      "Fail-fast: http_req_failed rate qua cao cho ${casePrefix}: " +
      "$([Math]::Round($failedRequestRate * 100, 3))% > $([Math]::Round($MaxFailedRequestRate * 100, 3))%. " +
      "Kiem tra service/ingress tren $BaseUrl (port 5000)."
    )
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
    avg_cpu_percent = Get-AvgCpuFromSamples $cpuTotals
    cpu_samples     = $cpuTotals.Count
    summary_json    = [IO.Path]::GetFileName($jsonPath)
    k6_log          = [IO.Path]::GetFileName($logPath)
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
$runDir = Join-Path $resultsDir ("run-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $runDir | Out-Null

$allRows = @()

for ($i = 1; $i -le $Runs; $i++) {
  foreach ($users in $parsedUserLevels) {
    Write-Host "Run $i/$Runs - Users $users - Monolith"
    $allRows += Run-OneCase -Architecture "Monolith" -UseMonolithValue "true" -OutputDir $runDir -Users $users -RunIndex $i -SampleIntervalSec $SampleIntervalSec -ScenarioType $ScenarioType -WorkloadType $WorkloadType -StageStepVus $StageStepVus -StageDuration $StageDuration -ConcurrentDuration $ConcurrentDuration -BaseUrl $BaseUrl -SkipHealthCheck:$SkipHealthCheck

    Write-Host "Run $i/$Runs - Users $users - Microservices"
    $allRows += Run-OneCase -Architecture "Microservices" -UseMonolithValue "false" -OutputDir $runDir -Users $users -RunIndex $i -SampleIntervalSec $SampleIntervalSec -ScenarioType $ScenarioType -WorkloadType $WorkloadType -StageStepVus $StageStepVus -StageDuration $StageDuration -ConcurrentDuration $ConcurrentDuration -BaseUrl $BaseUrl -SkipHealthCheck:$SkipHealthCheck

    if ($CaseCooldownSec -gt 0) {
      Start-Sleep -Seconds $CaseCooldownSec
    }
  }
}

$allRunsCsv = Join-Path $runDir "benchmark-all-runs.csv"
$allRows | Export-Csv -Path $allRunsCsv -NoTypeInformation -Encoding utf8

$summaryRows = $allRows |
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
$summaryRows | Export-Csv -Path $summaryCsv -NoTypeInformation -Encoding utf8

Write-Host ""
Write-Host "Done."
Write-Host "Detailed CSV: $allRunsCsv"
Write-Host "Summary CSV : $summaryCsv"
Write-Host "Run folder   : $runDir"
