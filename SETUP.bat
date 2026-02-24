@echo off
setlocal enabledelayedexpansion

:: Get the project root from the location of this batch file
set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

color 0A
echo.
echo  ==============================================
echo   ConsiliumAI  -  One-Time Setup
echo  ==============================================
echo.
echo  This will install everything ConsiliumAI needs.
echo  Keep this window open until setup is complete.
echo.
pause


:: ── 1: Python ─────────────────────────────────────────────────────
echo.
echo  [1/5]  Checking for Python...
python --version >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo  Python is not installed.
    echo.
    echo  ACTION REQUIRED:
    echo    1. A download page will open in your browser now.
    echo    2. Click the "Download Python" button.
    echo    3. Run the installer.
    echo    4. IMPORTANT: On the first screen of the installer,
    echo       check the box that says "Add python.exe to PATH"
    echo       before clicking Install Now.
    echo    5. After installation finishes, close this window and
    echo       double-click SETUP.bat again to continue.
    echo.
    start "" "https://www.python.org/downloads/windows/"
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo  Found: %%v


:: ── 2: Node.js ────────────────────────────────────────────────────
echo.
echo  [2/5]  Checking for Node.js...
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo.
    echo  Node.js is not installed.
    echo.
    echo  ACTION REQUIRED:
    echo    1. A download page will open in your browser now.
    echo    2. Click the LTS download button (the one on the left).
    echo    3. Run the installer with all default options.
    echo    4. After installation finishes, close this window and
    echo       double-click SETUP.bat again to continue.
    echo.
    start "" "https://nodejs.org/en/download/"
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo  Found: Node.js %%v


:: ── 3: uv ─────────────────────────────────────────────────────────
echo.
echo  [3/5]  Checking for uv...
set "UV_EXE="
where uv >nul 2>&1
if !errorlevel! equ 0 (
    set "UV_EXE=uv"
) else if exist "%USERPROFILE%\.local\bin\uv.exe" (
    set "UV_EXE=%USERPROFILE%\.local\bin\uv.exe"
) else (
    echo  Not found. Installing uv...
    powershell -ExecutionPolicy Bypass -Command "irm https://astral.sh/uv/install.ps1 | iex" >nul 2>&1
    if exist "%USERPROFILE%\.local\bin\uv.exe" (
        set "UV_EXE=%USERPROFILE%\.local\bin\uv.exe"
        echo  uv installed.
    ) else (
        echo.
        echo  Could not install uv automatically.
        echo  Please contact Warren for help.
        pause
        exit /b 1
    )
)
echo  Found uv.


:: ── 4: Python packages ────────────────────────────────────────────
echo.
echo  [4/5]  Installing Python packages (may take a minute)...
cd /d "%PROJECT_DIR%"
"%UV_EXE%" sync
if !errorlevel! neq 0 (
    echo.
    echo  Python package installation failed. Please contact Warren.
    pause
    exit /b 1
)
echo  Python packages installed.


:: ── 5: Node packages ──────────────────────────────────────────────
echo.
echo  [5/5]  Installing web packages (may take a minute)...
cd /d "%PROJECT_DIR%\frontend"
call npm install
if !errorlevel! neq 0 (
    echo.
    echo  Web package installation failed. Please contact Warren.
    pause
    exit /b 1
)
cd /d "%PROJECT_DIR%"
echo  Web packages installed.


:: ── Create tree icon ──────────────────────────────────────────────
echo.
echo  Creating desktop shortcut...

set "ICO_PATH=%PROJECT_DIR%\consilium.ico"
set "PS1_PATH=%PROJECT_DIR%\start_consilium.ps1"

set "TMPSCRIPT=%TEMP%\consilium_icon.ps1"
(
echo Add-Type -AssemblyName System.Drawing
echo $bmp = New-Object System.Drawing.Bitmap(64, 64, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
echo $g = [System.Drawing.Graphics]::FromImage($bmp)
echo $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
echo $g.Clear([System.Drawing.Color]::Transparent)
echo $trunk = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,101,67,33))
echo $g.FillRectangle($trunk, 27, 44, 10, 18)
echo $green = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255,46,125,50))
echo $p1 = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(32,4),[System.Drawing.PointF]::new(18,28),[System.Drawing.PointF]::new(46,28))
echo $g.FillPolygon($green,$p1)
echo $p2 = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(32,20),[System.Drawing.PointF]::new(14,40),[System.Drawing.PointF]::new(50,40))
echo $g.FillPolygon($green,$p2)
echo $p3 = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(32,34),[System.Drawing.PointF]::new(10,52),[System.Drawing.PointF]::new(54,52))
echo $g.FillPolygon($green,$p3)
echo $g.Dispose()
echo $ms = New-Object System.IO.MemoryStream
echo $bmp.Save($ms,[System.Drawing.Imaging.ImageFormat]::Png)
echo $bmp.Dispose()
echo $png = $ms.ToArray()
echo $ms.Dispose()
echo $ico = New-Object System.Collections.Generic.List[byte]
echo $ico.AddRange([byte[]](0,0,1,0,1,0))
echo $ico.AddRange([byte[]](64,64,0,0,1,0,32,0))
echo $ico.AddRange([System.BitConverter]::GetBytes([uint32]$png.Length))
echo $ico.AddRange([System.BitConverter]::GetBytes([uint32]22))
echo $ico.AddRange($png)
echo [System.IO.File]::WriteAllBytes('%ICO_PATH:\=/%', $ico.ToArray())
) > "%TMPSCRIPT%"
powershell -ExecutionPolicy Bypass -File "%TMPSCRIPT%"
del "%TMPSCRIPT%" >nul 2>&1


:: ── Create desktop shortcut ───────────────────────────────────────
set "TMPSCRIPT=%TEMP%\consilium_shortcut.ps1"
(
echo $ws = New-Object -ComObject WScript.Shell
echo $s = $ws.CreateShortcut("$env:USERPROFILE\Desktop\ConsiliumAI.lnk")
echo $s.TargetPath = "powershell.exe"
echo $s.Arguments = '-ExecutionPolicy Bypass -WindowStyle Hidden -File "%PS1_PATH%"'
echo $s.WorkingDirectory = "%PROJECT_DIR%"
echo $s.IconLocation = "%ICO_PATH%,0"
echo $s.Description = "Start ConsiliumAI"
echo $s.Save()
) > "%TMPSCRIPT%"
powershell -ExecutionPolicy Bypass -File "%TMPSCRIPT%"
del "%TMPSCRIPT%" >nul 2>&1


echo.
echo  ==============================================
echo   Setup Complete!
echo  ==============================================
echo.
echo  A "ConsiliumAI" icon has been added to your desktop.
echo  Double-click it anytime to open the app in your browser.
echo.
echo  First time using it:
echo    1. Double-click ConsiliumAI on your desktop
echo    2. Wait about 10 seconds for the browser to open
echo    3. Click the Settings icon (top right)
echo    4. Go to "LLM API Keys" and enter the key Warren sent you
echo    5. Click Test, then Save Changes
echo.
pause
