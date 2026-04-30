param(
  [string]$MonolithBaseUrl = "http://127.0.0.1:3001",
  [string]$MicroservicesBaseUrl = "http://127.0.0.1:8080",
  [int]$Port = 5000
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$routerScript = Join-Path $scriptDir "native-router.js"
$stateDir = Join-Path $scriptDir ".router-state"
$pidFile = Join-Path $stateDir "native-router.pid"
$outLog = Join-Path $stateDir "native-router.out.log"
$errLog = Join-Path $stateDir "native-router.err.log"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Khong tim thay lenh 'node'. Cai Node.js de chay native router."
}
if (-not (Test-Path $routerScript)) {
  throw "Khong tim thay file router: $routerScript"
}
if (-not (Test-Path $stateDir)) {
  New-Item -ItemType Directory -Path $stateDir | Out-Null
}

if (Test-Path $pidFile) {
  $existingPid = [int](Get-Content -Path $pidFile -Raw)
  $existingProc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
  if ($null -ne $existingProc) {
    Write-Host "Native router da dang chay (PID: $existingPid)."
    exit 0
  } else {
    Remove-Item -Path $pidFile -Force
  }
}

$env:MONOLITH_BASE_URL = $MonolithBaseUrl
$env:MICROSERVICES_BASE_URL = $MicroservicesBaseUrl
$env:BENCHMARK_ROUTER_PORT = "$Port"

$proc = Start-Process -FilePath "node" `
  -ArgumentList "`"$routerScript`"" `
  -WorkingDirectory $scriptDir `
  -RedirectStandardOutput $outLog `
  -RedirectStandardError $errLog `
  -PassThru

$proc.Id | Out-File -FilePath $pidFile -Encoding ascii -NoNewline
Start-Sleep -Seconds 1

$listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($null -eq $listening) {
  Write-Warning "Router co the chua listen tren port $Port. Xem log: $outLog, $errLog"
} else {
  Write-Host "Native router dang chay tai http://127.0.0.1:$Port (PID: $($proc.Id))"
}
