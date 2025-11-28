# React Native Simulator Setup Guide

## 🤖 Android Simulator Setup (Windows/Mac/Linux)

### Prerequisites Check:
1. **Java Development Kit (JDK)**
2. **Android Studio**
3. **Android SDK**
4. **Environment Variables**

### Step 1: Install Android Studio

1. Download Android Studio from: https://developer.android.com/studio
2. Run the installer
3. During installation, make sure these are checked:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

### Step 2: Install Android SDK

1. Open Android Studio
2. Go to: **Tools → SDK Manager**
3. In **SDK Platforms** tab, install:
   - ✅ Android 13.0 (Tiramisu) - API Level 33
   - ✅ Android 12.0 (S) - API Level 31
   - ✅ Android 11.0 (R) - API Level 30

4. In **SDK Tools** tab, install:
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - ✅ Intel x86 Emulator Accelerator (HAXM installer) - for Intel CPUs
   - ✅ Google Play services

### Step 3: Set Environment Variables (Windows)

1. Open **System Properties** → **Environment Variables**

2. Add **ANDROID_HOME**:
   - Variable: `ANDROID_HOME`
   - Value: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`

3. Add to **Path**:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

4. **Restart your terminal/IDE** after setting variables

### Step 4: Create Android Virtual Device (AVD)

1. Open Android Studio
2. Go to: **Tools → Device Manager** (or AVD Manager)
3. Click **Create Device**
4. Select a device (recommended: **Pixel 5** or **Pixel 6**)
5. Select system image: **Android 13.0 (API 33)** with Google APIs
6. Click **Finish**

### Step 5: Verify Setup

Open terminal and run:
```bash
# Check Java
java -version

# Check Android SDK
adb version

# List available emulators
emulator -list-avds
```

### Step 6: Run the App

```bash
cd mobile

# Start Metro bundler (in one terminal)
npm start

# In another terminal, run Android
npm run android
```

Or run everything at once:
```bash
cd mobile
npm run android
```

---

## 🍎 iOS Simulator Setup (Mac Only)

### ⚠️ Important: iOS development requires macOS and Xcode

### Prerequisites:
- macOS (Monterey 12.0 or later recommended)
- Xcode 14.0 or later
- CocoaPods

### Step 1: Install Xcode

1. Open **App Store**
2. Search for **Xcode**
3. Click **Install** (this takes a while, ~12GB)
4. After installation, open Xcode
5. Accept the license agreement
6. Install additional components when prompted

### Step 2: Install Xcode Command Line Tools

```bash
xcode-select --install
```

### Step 3: Install CocoaPods

```bash
sudo gem install cocoapods
```

### Step 4: Install iOS Dependencies

```bash
cd mobile/ios
pod install
cd ..
```

### Step 5: Verify Setup

```bash
# Check Xcode installation
xcodebuild -version

# List available simulators
xcrun simctl list devices
```

### Step 6: Run the App

```bash
cd mobile

# Start Metro bundler (in one terminal)
npm start

# In another terminal, run iOS
npm run ios
```

Or specify a simulator:
```bash
npm run ios -- --simulator="iPhone 15 Pro"
```

---

## 🔧 Troubleshooting

### Android Issues:

**Problem: "SDK location not found"**
```bash
# Create local.properties file in android folder
echo "sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

**Problem: "Emulator is not running"**
```bash
# Start emulator manually
emulator -avd YOUR_AVD_NAME

# Then run
npm run android
```

**Problem: "Unable to load script"**
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### iOS Issues:

**Problem: "Pod install failed"**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Problem: "Build failed"**
```bash
cd ios
xcodebuild clean
cd ..
npm run ios
```

**Problem: "No devices found"**
```bash
# Open Xcode → Window → Devices and Simulators
# Add a new simulator
```

---

## 🚀 Quick Start Commands

### Android:
```bash
# Terminal 1: Start Metro
cd mobile
npm start

# Terminal 2: Run Android
cd mobile
npm run android
```

### iOS (Mac only):
```bash
# Terminal 1: Start Metro
cd mobile
npm start

# Terminal 2: Run iOS
cd mobile
npm run ios
```

---

## 📱 Recommended Emulator Settings

### Android:
- **Device**: Pixel 5 or Pixel 6
- **API Level**: 33 (Android 13)
- **RAM**: 2048 MB minimum
- **Enable**: Google Play Services

### iOS:
- **Device**: iPhone 15 Pro or iPhone 14
- **iOS Version**: 17.0 or later

---

## ✅ Verification Checklist

Before running the app, verify:

- [ ] Node.js installed (v18+)
- [ ] npm dependencies installed (`npm install`)
- [ ] Android Studio installed (for Android)
- [ ] Xcode installed (for iOS, Mac only)
- [ ] Environment variables set (Android)
- [ ] Emulator/Simulator created
- [ ] Emulator/Simulator running

---

## 🎯 Current Project Status

Your F1 Racers Mobile app is ready to run! It includes:
- ✅ Driver list with search
- ✅ Champion badges
- ✅ Driver detail screens
- ✅ iOS and Android platform-specific UI
- ✅ Offline support
- ✅ Image caching
- ✅ Responsive layouts

