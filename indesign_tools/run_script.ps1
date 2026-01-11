# InDesign Script Runner for Windows
# This script executes ExtendScript (.jsx) files in Adobe InDesign via COM automation

param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptPath,
    
    [Parameter(Mandatory=$false)]
    [string]$DocumentPath = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$WaitForCompletion = $true
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

try {
    # Validate script path
    if (-not (Test-Path $ScriptPath)) {
        throw "Script file not found: $ScriptPath"
    }
    
    Write-Log "Starting InDesign COM automation..."
    
    # Create InDesign COM object
    $indesign = $null
    try {
        $indesign = [System.Runtime.InteropServices.Marshal]::GetActiveObject("InDesign.Application")
        Write-Log "Connected to existing InDesign instance"
    }
    catch {
        Write-Log "No running InDesign instance found. Attempting to start new instance..."
        $indesign = New-Object -ComObject InDesign.Application
        Write-Log "Started new InDesign instance"
    }
    
    # Open document if specified
    if ($DocumentPath -ne "" -and (Test-Path $DocumentPath)) {
        Write-Log "Opening document: $DocumentPath"
        $doc = $indesign.Open($DocumentPath)
        Write-Log "Document opened successfully"
    }
    
    # Read and execute the script
    Write-Log "Executing script: $ScriptPath"
    $scriptContent = Get-Content -Path $ScriptPath -Raw
    
    # Execute via DoScript method
    $result = $indesign.DoScript($scriptContent, 1246973031) # 1246973031 = idJavaScript
    
    Write-Log "Script executed successfully"
    
    if ($result) {
        Write-Log "Script result: $result"
    }
    
    exit 0
}
catch {
    Write-Log "ERROR: $($_.Exception.Message)" "ERROR"
    Write-Log "Stack Trace: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}
