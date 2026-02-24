# ConsiliumAI Launcher
# Starts the backend and frontend silently, then opens the browser.
# Double-click the desktop shortcut to run this.

Add-Type -AssemblyName System.Windows.Forms

$projectDir  = Split-Path -Parent -Path $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $projectDir "frontend"

# Locate uv (try PATH first, then the default install location)
$uvExe   = "uv"
$uvLocal = Join-Path $env:USERPROFILE ".local\bin\uv.exe"
if (Test-Path $uvLocal) { $uvExe = $uvLocal }

# ── Already running? Just open the browser. ─────────────────────────────────
$backendUp  = $null -ne (Get-NetTCPConnection -LocalPort 8001 -State Listen -ErrorAction SilentlyContinue)
$frontendUp = $null -ne (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)

if ($backendUp -and $frontendUp) {
    Start-Process "http://localhost:5173"
    exit 0
}

# ── Start backend ────────────────────────────────────────────────────────────
if (-not $backendUp) {
    Start-Process -FilePath $uvExe `
        -ArgumentList "run", "python", "-m", "backend.main" `
        -WorkingDirectory $projectDir `
        -WindowStyle Hidden

    # Poll until the backend responds (up to 30 seconds)
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try {
            Invoke-RestMethod -Uri "http://localhost:8001" -TimeoutSec 1 -ErrorAction Stop | Out-Null
            $ready = $true
            break
        } catch { }
    }

    if (-not $ready) {
        [System.Windows.Forms.MessageBox]::Show(
            "ConsiliumAI could not start.`nPlease contact Warren.",
            "ConsiliumAI",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        ) | Out-Null
        exit 1
    }
}

# ── Start frontend ───────────────────────────────────────────────────────────
if (-not $frontendUp) {
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "npm run dev" `
        -WorkingDirectory $frontendDir `
        -WindowStyle Hidden

    # Vite is usually ready in 2-4 seconds
    Start-Sleep -Seconds 5
}

# ── Open browser ─────────────────────────────────────────────────────────────
Start-Process "http://localhost:5173"
