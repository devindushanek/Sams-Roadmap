$logFile = "c:\Users\devin\Documents\Professional\DevLabs\AI Agent Workspace\indesign_diag.log"
"Starting diagnosis..." | Out-File $logFile

try {
    $procs = Get-Process | Where-Object { $_.ProcessName -like "*InDesign*" }
    if ($procs) {
        "Found InDesign processes:" | Out-File $logFile -Append
        $procs | Format-Table | Out-String | Out-File $logFile -Append
    }
    else {
        "No InDesign processes found via Get-Process" | Out-File $logFile -Append
    }
}
catch {
    "Error listing processes: $($_.Exception.Message)" | Out-File $logFile -Append
}

try {
    "Attempting GetActiveObject..." | Out-File $logFile -Append
    $app = [System.Runtime.InteropServices.Marshal]::GetActiveObject("InDesign.Application")
    "Success: Connected to running instance." | Out-File $logFile -Append
    "Document Count: $($app.Documents.Count)" | Out-File $logFile -Append
}
catch {
    "GetActiveObject failed: $($_.Exception.Message)" | Out-File $logFile -Append
    
    try {
        "Attempting New-Object -ComObject..." | Out-File $logFile -Append
        $app = New-Object -ComObject InDesign.Application
        "Success: Created new instance." | Out-File $logFile -Append
    }
    catch {
        "New-Object failed: $($_.Exception.Message)" | Out-File $logFile -Append
    }
}
