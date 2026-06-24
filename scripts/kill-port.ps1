param([int]$Port = 3000)

$conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $pid = $conn.OwningProcess | Select-Object -First 1
    Write-Host "Killing process $pid on port $Port..."
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "Port $Port is now free."
} else {
    Write-Host "Port $Port is already free."
}
