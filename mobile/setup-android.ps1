# Android Setup Helper Script for F1 Racers Mobile App
# Run this script AFTER installing Android Studio

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "F1 Racers Mobile - Android Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script should be run as Administrator to set environment variables" -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Check Java
Write-Host "Step 1: Checking Java..." -ForegroundColor Green
try {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✅ Java is installed: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install JDK 11 or later" -ForegroundColor Red
    Write-Host "   Download from: https://adoptium.net/" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 2: Find Android SDK
Write-Host "Step 2: Looking for Android SDK..." -ForegroundColor Green
$possiblePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk"
)

$androidSdkPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $androidSdkPath = $path
        break
    }
}

if ($androidSdkPath) {
    Write-Host "✅ Android SDK found at: $androidSdkPath" -ForegroundColor Green
} else {
    Write-Host "❌ Android SDK not found" -ForegroundColor Red
    Write-Host "   Please install Android Studio first:" -ForegroundColor Yellow
    Write-Host "   https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   After installation, run this script again." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 3: Set Environment Variables
Write-Host "Step 3: Setting environment variables..." -ForegroundColor Green

$currentAndroidHome = [System.Environment]::GetEnvironmentVariable('ANDROID_HOME', 'User')
if ($currentAndroidHome -ne $androidSdkPath) {
    if ($isAdmin) {
        [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $androidSdkPath, 'User')
        Write-Host "✅ ANDROID_HOME set to: $androidSdkPath" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Cannot set ANDROID_HOME (not running as Administrator)" -ForegroundColor Yellow
        Write-Host "   Please run as Administrator or set manually:" -ForegroundColor Yellow
        Write-Host "   ANDROID_HOME=$androidSdkPath" -ForegroundColor Cyan
    }
} else {
    Write-Host "✅ ANDROID_HOME already set correctly" -ForegroundColor Green
}

# Add to PATH
$pathsToAdd = @(
    "$androidSdkPath\platform-tools",
    "$androidSdkPath\emulator",
    "$androidSdkPath\tools",
    "$androidSdkPath\tools\bin"
)

$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$pathUpdated = $false

foreach ($pathToAdd in $pathsToAdd) {
    if ($currentPath -notlike "*$pathToAdd*") {
        if ($isAdmin) {
            $currentPath += ";$pathToAdd"
            $pathUpdated = $true
        } else {
            Write-Host "⚠️  Need to add to PATH: $pathToAdd" -ForegroundColor Yellow
        }
    }
}

if ($pathUpdated -and $isAdmin) {
    [System.Environment]::SetEnvironmentVariable('Path', $currentPath, 'User')
    Write-Host "✅ PATH updated with Android SDK tools" -ForegroundColor Green
}
Write-Host ""

# Step 4: Check ADB
Write-Host "Step 4: Checking ADB..." -ForegroundColor Green
$adbPath = "$androidSdkPath\platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "✅ ADB found at: $adbPath" -ForegroundColor Green
    
    # Test ADB
    try {
        & $adbPath version | Out-Null
        Write-Host "✅ ADB is working" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  ADB found but not working properly" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ ADB not found. Install Android SDK Platform-Tools in Android Studio" -ForegroundColor Red
}
Write-Host ""

# Step 5: Check for emulators
Write-Host "Step 5: Checking for Android emulators..." -ForegroundColor Green
$emulatorPath = "$androidSdkPath\emulator\emulator.exe"
if (Test-Path $emulatorPath) {
    try {
        $avds = & $emulatorPath -list-avds 2>&1
        if ($avds) {
            Write-Host "✅ Found emulators:" -ForegroundColor Green
            $avds | ForEach-Object { Write-Host "   - $_" -ForegroundColor Cyan }
        } else {
            Write-Host "⚠️  No emulators found. Create one in Android Studio:" -ForegroundColor Yellow
            Write-Host "   Tools → Device Manager → Create Device" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not list emulators" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Emulator not found" -ForegroundColor Red
}
Write-Host ""

# Step 6: Check Node modules
Write-Host "Step 6: Checking Node modules..." -ForegroundColor Green
if (Test-Path "node_modules") {
    Write-Host "✅ Node modules installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Node modules not installed. Running npm install..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Node modules installed" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if ($androidSdkPath -and (Test-Path $adbPath)) {
    Write-Host "✅ Android development environment is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your terminal to load new environment variables" -ForegroundColor White
    Write-Host "2. Start an emulator or connect a device" -ForegroundColor White
    Write-Host "3. Run: npm run android" -ForegroundColor White
    Write-Host ""
    Write-Host "Quick commands:" -ForegroundColor Cyan
    Write-Host "  Start emulator: emulator -avd YOUR_AVD_NAME" -ForegroundColor Yellow
    Write-Host "  Run app:        npm run android" -ForegroundColor Yellow
    Write-Host "  Check devices:  adb devices" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Setup incomplete. Please:" -ForegroundColor Yellow
    Write-Host "1. Install Android Studio" -ForegroundColor White
    Write-Host "2. Install Android SDK components" -ForegroundColor White
    Write-Host "3. Create an Android Virtual Device (AVD)" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
}

Write-Host ""
Write-Host "For detailed instructions, see: SETUP_STATUS.md" -ForegroundColor Cyan
Write-Host ""
