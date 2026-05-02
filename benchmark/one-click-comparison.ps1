param(
  [ValidateSet("info", "quick", "full", "stress")]
  [string]$Mode = "full",

  [string]$MonolithBaseUrl = "http://127.0.0.1:3001",
  [string]$MicroservicesBaseUrl = "http://127.0.0.1:18080",
  [int]$RouterPort = 5000,
  [switch]$NoStartRouter,
  [switch]$LegacyPrompt
)

$ErrorActionPreference = "Stop"

# Đảm bảo working directory luôn là thư mục chứa script này (benchmark/)
# để các lệnh gọi ".\export-benchmark.ps1", ".\start-native-router.ps1", v.v. hoạt động đúng
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

function Write-Section {
  param([string]$Title)
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor Cyan
  Write-Host $Title -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor Cyan
}

function Show-TechAndFlow {
  Write-Section "1) CONG NGHE DUOC SU DUNG TRONG PHAN SO SANH"
  Write-Host "- PowerShell script: dieu phoi toan bo benchmark flow."
  Write-Host "- k6: tao tai va do metric hieu nang (rps, latency, failed rate)."
  Write-Host "- Node.js native router (benchmark/native-router.js): route theo header X-Benchmark-Target."
  Write-Host "- Docker Compose: chay monolith + microservices + gateway (neu ban chay qua Docker)."
  Write-Host "- CSV output: benchmark-all-runs.csv, benchmark-summary.csv, *-cpu-samples.csv"
  Write-Host "- Windows Performance Counter: lay mau CPU host trong luc chay case."

  Write-Section "2) CACH HOAT DONG"
  Write-Host "1. Tat ca request benchmark di qua cung 1 cong logic: http://localhost:$RouterPort"
  Write-Host "2. Header X-Benchmark-Target quyet dinh dich den:"
  Write-Host "   - monolith     -> $MonolithBaseUrl"
  Write-Host "   - microservices -> $MicroservicesBaseUrl"
  Write-Host "3. k6 script benchmark/k6/test.js chay workload read/write/mixed."
  Write-Host "4. export-benchmark.ps1 chay tung case, gom metric, ghi CSV."
}

function Test-OneEndpoint {
  param(
    [string]$Url,
    [hashtable]$Headers = @{}
  )

  try {
    if ($LegacyPrompt) {
      # Legacy mode: keep PowerShell Yes/No prompt behavior.
      $resp = Invoke-WebRequest -Uri $Url -Method GET -Headers $Headers -TimeoutSec 8 -MaximumRedirection 0 -ErrorAction Stop
      $status = [int]$resp.StatusCode
    } else {
      # Stable/non-interactive mode.
      $curlArgs = @("-s", "-o", "NUL", "-w", "%{http_code}", "--max-time", "8")
      foreach ($key in $Headers.Keys) {
        $curlArgs += @("-H", ("{0}: {1}" -f $key, $Headers[$key]))
      }
      $curlArgs += $Url
      $rawCode = (& curl.exe @curlArgs).Trim()
      if ($LASTEXITCODE -ne 0) {
        return [pscustomobject]@{ url = $Url; status = -1; ok = $false; detail = ("CURL_EXIT_" + $LASTEXITCODE) }
      }
      $status = [int]$rawCode
    }

    if (($status -ge 200 -and $status -lt 400)) {
      return [pscustomobject]@{ url = $Url; status = $status; ok = $true; detail = "OK" }
    }
    if ($status -eq 401 -or $status -eq 403) {
      return [pscustomobject]@{ url = $Url; status = $status; ok = $true; detail = "AUTH_REQUIRED_OR_FORBIDDEN" }
    }
    return [pscustomobject]@{ url = $Url; status = $status; ok = $false; detail = "HTTP_ERROR" }
  } catch {
    $status = $null
    try {
      $raw = $_.Exception.Response.StatusCode
      if ($null -ne $raw) { $status = [int]$raw }
    } catch {}

    if ($null -ne $status) {
      if (($status -ge 200 -and $status -lt 400)) {
        return [pscustomobject]@{ url = $Url; status = $status; ok = $true; detail = "OK" }
      }
      if ($status -eq 401 -or $status -eq 403) {
        return [pscustomobject]@{ url = $Url; status = $status; ok = $true; detail = "AUTH_REQUIRED_OR_FORBIDDEN" }
      }
      return [pscustomobject]@{ url = $Url; status = $status; ok = $false; detail = "HTTP_ERROR" }
    }
    return [pscustomobject]@{ url = $Url; status = -1; ok = $false; detail = ("REQUEST_ERROR: " + $_.Exception.Message) }
  }
}

function Verify-PortsAndRoutes {
  Write-Section "3) VERIFY 3001 / 18080 / 5000 + 2 NHANH HEADER"
  $routerBase = "http://127.0.0.1:$RouterPort"

  $checks = @(
    (Test-OneEndpoint -Url "$MonolithBaseUrl/api/v1/courses"),
    (Test-OneEndpoint -Url "$MicroservicesBaseUrl/api/v1/courses"),
    (Test-OneEndpoint -Url "$routerBase/api/v1/courses" -Headers @{ "X-Benchmark-Target" = "monolith" }),
    (Test-OneEndpoint -Url "$routerBase/api/v1/courses" -Headers @{ "X-Benchmark-Target" = "microservices" })
  )

  $allOk = $true
  foreach ($c in $checks) {
    if ($c.ok) {
      Write-Host ("[PASS] {0} -> status={1} ({2})" -f $c.url, $c.status, $c.detail) -ForegroundColor Green
    } else {
      Write-Host ("[FAIL] {0} -> {1}" -f $c.url, $c.detail) -ForegroundColor Red
      $allOk = $false
    }
  }

  if (-not $allOk) {
    throw "Verify that bai. Hay dam bao service/router dang chay dung cong."
  }
}

function Run-Benchmark {
  param(
    [string]$SelectedMode
  )

  $baseUrl = "http://localhost:$RouterPort"
  Write-Section ("4) RUN BENCHMARK MODE = " + $SelectedMode.ToUpperInvariant())

  if ($SelectedMode -eq "quick") {
    # Có thể tăng UserLevels lên 2000 để kiểm tra throughput/response time cực đại (nếu máy đủ mạnh)
    # -------------------------------------------------------
    # Kịch bản Concurrent Read (giữ cố định số VU)
    # Tất cả user gửi request đồng thời trong suốt thời gian test.
    # -------------------------------------------------------
    & powershell -NoProfile -ExecutionPolicy Bypass -File ".\export-benchmark.ps1" `
      -Runs 1 `
      -ScenarioType ramp `
      -WorkloadType read `
      -UserLevels "1,5,10,15,20,50,100,200,500,1000,1500,2000" `
      -StageDuration "20s" `
      -SampleIntervalSec 2 `
      -CaseCooldownSec 1 `
      -BaseUrl $baseUrl `
      -SkipHealthCheck
  } elseif ($SelectedMode -eq "full") {
    # Có thể tăng UserLevels lên 2000 để kiểm tra throughput/response time cực đại (nếu máy đủ mạnh)
    # -------------------------------------------------------
    # Kịch bản Concurrent Read (giữ cố định số VU)
    # Tất cả user gửi request đồng thời trong suốt thời gian test.
    # -------------------------------------------------------
    & powershell -NoProfile -ExecutionPolicy Bypass -File ".\export-benchmark.ps1" `
      -Runs 3 `
      -ScenarioType ramp `
      -WorkloadType read `
      -UserLevels "1,5,10,15,20,50,100,200,500,1000,1500,2000" `
      -StageDuration "2m" `
      -SampleIntervalSec 2 `
      -CaseCooldownSec 2 `
      -BaseUrl $baseUrl `
      -SkipHealthCheck

    # -------------------------------------------------------
    # TC2: Write-Intensive Access (Concurrent)
    # -------------------------------------------------------
    & powershell -NoProfile -ExecutionPolicy Bypass -File ".\export-benchmark.ps1" `
      -Runs 3 `
      -ScenarioType ramp `
      -WorkloadType write `
      -UserLevels "1,5,10,15,20,50,100,200,500,1000,1500,2000" `
      -StageDuration "2m" `
      -SampleIntervalSec 2 `
      -CaseCooldownSec 2 `
      -BaseUrl $baseUrl `
      -SkipHealthCheck

    # -------------------------------------------------------
    # TC3: Mixed Access (Concurrent)
    # -------------------------------------------------------
    & powershell -NoProfile -ExecutionPolicy Bypass -File ".\export-benchmark.ps1" `
      -Runs 3 `
      -ScenarioType ramp `
      -WorkloadType mixed `
      -UserLevels "1,5,10,15,20,50,100,200,500,1000,1500,2000" `
      -StageDuration "2m" `
      -SampleIntervalSec 2 `
      -CaseCooldownSec 2 `
      -BaseUrl $baseUrl `
      -SkipHealthCheck 

    # -------------------------------------------------------
    # TC Concurrent tam thoi TAM DUNG theo yeu cau hien tai.
    # Neu can bat lai, su dung:
    #   -ScenarioType concurrent -ConcurrentDuration 2m
    # TC Stress cung TAM DUNG trong mode full.
    # -------------------------------------------------------

  } elseif ($SelectedMode -eq "stress") {
    # Mode stress mặc định đã dùng 2000 user để kiểm tra tải cực lớn
    Write-Section "RUNNING STRESS TEST ONLY"
    & powershell -NoProfile -ExecutionPolicy Bypass -File ".\export-benchmark.ps1" `
      -Runs 1 `
      -ScenarioType concurrent `
      -WorkloadType stress `
      -UserLevels "2000" `
      -ConcurrentDuration "3m" `
      -SampleIntervalSec 2 `
      -CaseCooldownSec 5 `
      -BaseUrl $baseUrl `
      -SkipHealthCheck

  } else {
    Write-Host "Mode info: bo qua benchmark run."
    return
  }

  if ($LASTEXITCODE -ne 0) {
    throw "export-benchmark.ps1 tra ve loi."
  }

  $latestRun = Get-ChildItem -Path ".\results" -Directory -Filter "run-*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($null -ne $latestRun) {
    Write-Host ""
    Write-Host ("Run folder moi nhat: " + $latestRun.FullName) -ForegroundColor Yellow
    $summary = Join-Path $latestRun.FullName "benchmark-summary.csv"
    if (Test-Path $summary) {
      Write-Host ("Summary CSV: " + $summary) -ForegroundColor Yellow
    }
  }
}

try {
  Show-TechAndFlow

  if (-not $NoStartRouter) {
    Write-Section "START NATIVE ROUTER"
    & powershell -NoProfile -ExecutionPolicy Bypass -File ".\start-native-router.ps1" `
      -MonolithBaseUrl $MonolithBaseUrl `
      -MicroservicesBaseUrl $MicroservicesBaseUrl `
      -Port $RouterPort
  }

  Verify-PortsAndRoutes
  Run-Benchmark -SelectedMode $Mode

  Write-Section "DONE"
  Write-Host "Hoan tat flow benchmark."
  Write-Host "Mac dinh script chay mode full va tu start router."
  Write-Host "Neu muon khong dong vao router hien tai, them -NoStartRouter."
}
catch {
  Write-Host ""
  Write-Host ("[ERROR] " + $_.Exception.Message) -ForegroundColor Red
  exit 1
}

