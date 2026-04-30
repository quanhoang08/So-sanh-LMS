$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path (Join-Path $scriptDir ".router-state") "native-router.pid"

if (-not (Test-Path $pidFile)) {
  Write-Host "Khong tim thay PID file. Native router co the da dung."
  exit 0
}

$routerPid = [int](Get-Content -Path $pidFile -Raw)
$proc = Get-Process -Id $routerPid -ErrorAction SilentlyContinue
if ($null -eq $proc) {
  Write-Host "Tien trinh router PID $routerPid khong con ton tai."
  Remove-Item -Path $pidFile -Force
  exit 0
}

Stop-Process -Id $routerPid -Force
Remove-Item -Path $pidFile -Force
Write-Host "Da dung native router (PID: $routerPid)."
