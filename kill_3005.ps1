$port = 3005
$tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($tcp) {
    $procId = $tcp.OwningProcess
    Write-Host "Found process $procId on port $port. Killing it..."
    Stop-Process -Id $procId -Force
    Write-Host "Process killed."
} else {
    Write-Host "No process found on port $port."
}
