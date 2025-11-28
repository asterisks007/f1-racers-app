# Running F1 Racers Apps - Complete Guide

## 🌐 Web App (Currently Running!)

### ✅ Status: RUNNING
- **URL**: http://localhost:5174/
- **Access**: Open Chrome and navigate to the URL above
- **Features**: Full F1 driver list, search, champion badges, detail views

### Commands:
```bash
# Already running, but if you need to restart:
cd temp-f1-repo
npm run dev
```

---

## 📱 Mobile App - Your Options

### Option 1: Android Simulator (Recommended for Windows)

**Current Status**: ❌ Not Set Up Yet

**What You Need**:
1. Android Studio (free download)
2. Android SDK
3. Android Virtual Device (emulator)

**Setup Time**: ~1 hour (first time only)

**Step-by-Step Guide**:

#### 1. Install Android Studio
- Download: https://developer.android.com/studio
- Install with default settings
- Make sure to install:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device

#### 2. Run Setup Script
After Android Studio is installed, run:
```powershell
cd temp-f1-repo/mobile
powershell -ExecutionPolicy Bypass -File setup-android.ps1
```

This script will:
- ✅ Check your Java installation
- ✅ Find your Android SDK
- ✅ Set environment variables
- ✅ Verify ADB is working
- ✅ List available emulators

#### 3. Create an Emulator
1. Open Android Studio
2. Click **More Actions** → **Virtual Device Manager**
3. Click **Create Device**
4. Select **Pixel 5** → **Next**
5. Download **Tiramisu (API 33)** → **Next**
6. Click **Finish**

#### 4. Run the App
```bash
cd temp-f1-repo/mobile
npm run android
```

The app will:
- Start the emulator automatically
- Build the app
- Install it on the emulator
- Launch the F1 Racers app

**Detailed Guide**: See `mobile/SIMULATOR_SETUP_GUIDE.md`

---

### Option 2: iOS Simulator (Mac Only)

**Current Status**: ❌ Not Available (Windows OS)

**Requirements**:
- macOS operating system
- Xcode (Mac App Store)
- Mac hardware

**If you have a Mac**:
1. Install Xcode from App Store
2. Install CocoaPods: `sudo gem install cocoapods`
3. Install dependencies:
   ```bash
   cd temp-f1-repo/mobile/ios
   pod install
   cd ..
   ```
4. Run the app:
   ```bash
   npm run ios
   ```

**Detailed Guide**: See `mobile/SIMULATOR_SETUP_GUIDE.md`

---

### Option 3: React Native Web (Quick Preview in Browser)

**Current Status**: ❌ Not Set Up Yet

**What You Get**:
- Mobile app running in Chrome
- Quick preview without emulator setup
- Missing some native features

**Setup Time**: ~10 minutes

**Steps**:
1. Install dependencies:
   ```bash
   cd temp-f1-repo/mobile
   npm install react-native-web react-dom
   npm install --save-dev vite @vitejs/plugin-react
   ```

2. Follow setup in: `MOBILE_BROWSER_SETUP.md`

3. Run:
   ```bash
   npm run web
   ```

---

## 🎯 Recommended Path

### For Windows Users:
1. ✅ **Start with Web App** (already running at http://localhost:5174/)
2. 🔧 **Set up Android** (follow Option 1 above)
3. ⏭️ **Skip iOS** (requires Mac)

### For Mac Users:
1. ✅ **Start with Web App**
2. 🔧 **Set up iOS** (follow Option 2 above)
3. 🔧 **Set up Android** (optional, follow Option 1)

---

## 📊 Feature Comparison

| Feature | Web App | Android | iOS | RN Web |
|---------|---------|---------|-----|--------|
| Driver List | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ |
| Champion Badges | ✅ | ✅ | ✅ | ✅ |
| Detail Views | ✅ | ✅ | ✅ | ✅ |
| Native UI | ❌ | ✅ | ✅ | ❌ |
| Touch Gestures | ❌ | ✅ | ✅ | ⚠️ |
| Offline Mode | ❌ | ✅ | ✅ | ⚠️ |
| Image Caching | ❌ | ✅ | ✅ | ⚠️ |
| Platform Themes | ❌ | ✅ | ✅ | ❌ |

---

## 🆘 Troubleshooting

### Web App Issues:

**Port already in use**:
```bash
# Kill process on port 5174
netstat -ano | findstr :5174
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3000
```

### Android Issues:

**"SDK not found"**:
- Run the setup script: `setup-android.ps1`
- Manually set ANDROID_HOME environment variable

**"Emulator not starting"**:
- Enable virtualization in BIOS
- Check if Hyper-V is disabled (conflicts with Android emulator)

**"Build failed"**:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### General Issues:

**"Module not found"**:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

**"Metro bundler not starting"**:
```bash
npm start -- --reset-cache
```

---

## 📚 Additional Resources

- **Setup Status**: `mobile/SETUP_STATUS.md` - Current environment status
- **Simulator Guide**: `mobile/SIMULATOR_SETUP_GUIDE.md` - Detailed setup instructions
- **Browser Setup**: `MOBILE_BROWSER_SETUP.md` - React Native Web configuration
- **Setup Script**: `mobile/setup-android.ps1` - Automated Android setup

---

## ✅ Quick Verification

### Check if everything is working:

```bash
# Web App
curl http://localhost:5174

# Android (after setup)
adb devices
emulator -list-avds

# iOS (Mac only, after setup)
xcrun simctl list devices
```

---

## 🎉 What's Next?

Once you have the simulators running, you can:
- 🔄 Make code changes and see them instantly (hot reload)
- 🐛 Debug with Chrome DevTools
- 📱 Test on different device sizes
- 🎨 Compare iOS vs Android UI differences
- ⚡ Test offline functionality
- 🖼️ Verify image caching

---

## 💡 Pro Tips

1. **Keep Metro bundler running** in one terminal while developing
2. **Use React DevTools** for debugging
3. **Enable Fast Refresh** for instant updates
4. **Test on multiple device sizes** using different emulators
5. **Check both portrait and landscape** orientations

