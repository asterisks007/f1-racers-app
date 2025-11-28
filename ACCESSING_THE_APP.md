# How to Access the F1 Racers Mobile App

## Prerequisites

Before running the mobile app, ensure you have:

1. ✅ **Android Studio** installed with Android SDK
2. ✅ **Android SDK Platform 34** installed
3. ✅ **Android Emulator** running (or physical device connected)
4. ✅ **Node.js 18+** and npm installed
5. ✅ **Dependencies installed** (`npm install` in mobile directory)

## First Time Setup

### 1. Set Android SDK Path

```powershell
# Windows PowerShell
$env:ANDROID_HOME = 'C:\Users\YourUsername\AppData\Local\Android\Sdk'

# Or use the setup script
cd mobile
.\setup-android.ps1
```

### 2. Start Android Emulator

Open Android Studio → Device Manager → Start an emulator

Or from command line:
```powershell
C:\Users\YourUsername\AppData\Local\Android\Sdk\emulator\emulator.exe -avd Your_AVD_Name
```

### 3. Verify Emulator is Running

```powershell
C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

You should see your emulator listed (e.g., `emulator-5554    device`)

## Running the App

### Method 1: Build and Install (Recommended for First Run)

```powershell
cd mobile

# Start Metro bundler in one terminal
npm start

# In another terminal, build and install
$env:ANDROID_HOME = 'C:\Users\YourUsername\AppData\Local\Android\Sdk'
npm run android
```

**Important:** 
- **First build takes 5-10 minutes** (downloads Java 17, compiles Gradle plugin)
- **Subsequent builds take 30-60 seconds** (everything is cached)
- The app will automatically launch on your emulator when build completes

### Method 2: Launch Already Installed App

If the app is already installed, find it in your emulator:

1. **Look at your Android emulator window**
2. **Swipe up from the bottom** to open the app drawer
3. **Find "F1RacersMobile"** app icon
4. **Tap it** to launch

### Method 3: Launch from Command Line

```powershell
# Launch the app if already installed
C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools\adb.exe shell am start -n com.f1racers.mobile/.MainActivity
```

## Build Progress Indicators

When running `npm run android`, you'll see these stages:

1. **"CONFIGURING"** - Setting up build environment (1-2 min first time)
2. **"Downloading toolchain"** - Getting Java 17 (2-3 min first time, only once)
3. **"compileKotlin"** - Compiling Gradle plugin (2-3 min first time, only once)
4. **"BUILD SUCCESSFUL"** - App is compiled! 
5. **"Installing APK"** - Installing on emulator
6. **"Starting: Intent"** - App is launching!

**Total first build time: 5-10 minutes**
**Subsequent builds: 30-60 seconds**

## Troubleshooting

### Build Fails with "Could not find com.facebook.react:react-native-gradle-plugin"

This was a common issue that has been fixed. The required files are:
- ✅ `mobile/android/settings.gradle` - Created with proper configuration
- ✅ `mobile/android/build.gradle` - Updated with correct repositories

If you still see this error:
```powershell
cd mobile
npm install
cd android
.\gradlew.bat clean
cd ..
npm run android
```

### Emulator Not Visible

1. Check your taskbar for the Android Emulator window
2. Verify emulator is running:
   ```powershell
   adb devices
   ```
   Should show: `emulator-5554    device`

3. If no devices listed, start emulator from Android Studio

### Metro Bundler Not Running

The Metro bundler (JavaScript server) runs on port 8081. Check status:
- Visit: http://localhost:8081/status

If not running:
```powershell
cd mobile
npm start
```

### App Crashes on Launch

1. Check Metro bundler logs for JavaScript errors
2. Check Android logs:
   ```powershell
   adb logcat | findstr F1Racers
   ```

3. Rebuild the app:
   ```powershell
   cd mobile\android
   .\gradlew.bat clean
   cd ..
   npm run android
   ```

### Build Takes Too Long

First build is slow (5-10 min) because it:
- Downloads Java 17 toolchain (~100MB)
- Compiles React Native Gradle plugin
- Downloads all Android dependencies

This only happens once. Subsequent builds are fast (30-60 sec).

### "SDK location not found"

Create `mobile/android/local.properties`:
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### Port 8081 Already in Use

Kill the existing Metro bundler:
```powershell
# Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Then restart
npm start
```

## What You Should See

Once the app launches successfully, you'll see:

### Driver List Screen
- **Search Bar** at the top - Search for drivers by name
- **Scrollable list** of F1 drivers
- **Driver Cards** showing:
  - Driver photo (with loading placeholder)
  - Driver name and nationality
  - Team name
  - Current standing position
  - Champion badge (🏆 trophy icon) for world champions with years

### Driver Detail Screen
Tap any driver card to see:
- Large driver photo
- Full name and nationality
- Team information
- Current standing position
- Championship points
- Number of wins
- Championship years (if world champion)

### Platform-Specific Features

**Android (Material Design):**
- Material Design 3 theming
- Ripple effects on touch
- Android-style navigation
- System back button support

**iOS (when available):**
- iOS native styling
- Haptic feedback
- iOS-style navigation
- Swipe-back gestures

## Features to Test

### Core Features
- ✅ **Browse** the driver list
- ✅ **Search** for specific drivers (try "Hamilton", "Verstappen", or "Leclerc")
- ✅ **Tap a driver** to see detailed information
- ✅ **Look for champion badges** (🏆) on world champions
- ✅ **Scroll** through the list smoothly
- ✅ **Navigate back** from detail screen to list

### Advanced Features
- ✅ **Offline mode** - Works without internet after first load
- ✅ **Image caching** - Images load instantly after first view
- ✅ **Search filtering** - Real-time search as you type
- ✅ **Loading states** - Skeleton screens while loading
- ✅ **Error handling** - Graceful error messages with retry
- ✅ **Dark mode** - Follows system dark mode setting
- ✅ **Accessibility** - Screen reader support, dynamic text sizing

### Test Scenarios

1. **Search Functionality**
   - Type "ham" → Should show Hamilton
   - Type "red bull" → Should show Red Bull drivers
   - Clear search → Should show all drivers

2. **Navigation**
   - Tap any driver → Should navigate to detail screen
   - Press back button → Should return to list
   - Search should persist when returning

3. **Performance**
   - Scroll through list → Should be smooth (60fps)
   - Images should load quickly (cached after first view)
   - App should respond instantly to touches

## Technical Information

### Package Details
- **Package Name**: `com.f1racers.mobile`
- **App Name**: F1RacersMobile
- **Bundle ID (iOS)**: `com.f1racers.mobile`

### Ports Used
- **Metro Bundler**: http://localhost:8081
- **Dev Server**: Port 8081

### File Locations
- **APK Location**: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- **Android Logs**: `adb logcat`
- **Metro Logs**: Terminal where `npm start` is running

## Quick Reference Commands

```powershell
# Check emulator status
adb devices

# Launch app
adb shell am start -n com.f1racers.mobile/.MainActivity

# View app logs
adb logcat | findstr F1Racers

# Restart Metro bundler
cd mobile
npm start

# Rebuild and install
npm run android

# Clear app data
adb shell pm clear com.f1racers.mobile

# Uninstall app
adb uninstall com.f1racers.mobile
```

## Additional Resources

- [BUILD_FIX_SUMMARY.md](./BUILD_FIX_SUMMARY.md) - Build troubleshooting guide
- [mobile/SETUP.md](./mobile/SETUP.md) - Complete mobile setup guide
- [README.md](./README.md) - Main project documentation
- [.kiro/specs/f1-racers-mobile-app/](../.kiro/specs/f1-racers-mobile-app/) - Feature specifications
