# Android Build Configuration

## Overview
This document describes the Android build configuration for the F1 Racers Mobile application.

## Build Settings

### SDK Versions
- **minSdkVersion**: 23 (Android 6.0 Marshmallow)
- **targetSdkVersion**: 33 (Android 13)
- **compileSdkVersion**: 34 (Android 14)

### Application Configuration
- **Application ID**: com.f1racers.mobile
- **Version Code**: 1
- **Version Name**: 1.0.0
- **Namespace**: com.f1racers.mobile

### Hermes Engine
Hermes JavaScript engine is **ENABLED** for improved performance:
- Faster app startup
- Reduced memory usage
- Smaller app size

Configuration in `gradle.properties`:
```properties
hermesEnabled=true
```

### ProGuard Configuration
ProGuard is **ENABLED** for release builds to:
- Minify code and reduce APK size
- Obfuscate code for security
- Remove unused code

ProGuard rules are defined in `app/proguard-rules.pro` and include:
- React Native core rules
- Hermes engine rules
- Third-party library rules (AsyncStorage, React Native Paper, Fast Image)
- OkHttp and networking rules

### Build Types

#### Debug Build
- Signing: Debug keystore (auto-generated)
- Minification: Disabled
- Debugging: Enabled
- ProGuard: Disabled

#### Release Build
- Signing: Release keystore (configure separately)
- Minification: Enabled
- Debugging: Disabled
- ProGuard: Enabled

## AndroidManifest.xml Configuration

### Permissions
- `INTERNET`: Required for network requests
- `ACCESS_NETWORK_STATE`: Required for connectivity detection

### Application Settings
- **allowBackup**: false (for security)
- **usesCleartextTraffic**: true (for development, disable in production)
- **theme**: AppTheme (Material Design based)

### Activity Configuration
- **configChanges**: Handles orientation and screen size changes
- **launchMode**: singleTask (prevents multiple instances)
- **windowSoftInputMode**: adjustResize (keyboard handling)

## Setup Instructions

### 1. Install Dependencies
```bash
cd android
./gradlew clean
```

### 2. Generate Debug Keystore (if needed)
```bash
cd app
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Build the App

#### Debug Build
```bash
# From mobile directory
npx react-native run-android

# Or using Gradle directly
cd android
./gradlew assembleDebug
```

#### Release Build
```bash
# From mobile directory
npx react-native run-android --variant=release

# Or using Gradle directly
cd android
./gradlew assembleRelease
```

### 4. Generate Signed APK for Production

1. Create a release keystore:
```bash
keytool -genkey -v -keystore release.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `android/app/build.gradle` with release signing config:
```groovy
signingConfigs {
    release {
        storeFile file('release.keystore')
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias 'release-key'
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

3. Build signed APK:
```bash
cd android
./gradlew assembleRelease
```

## Architecture Support
The app supports the following CPU architectures:
- armeabi-v7a (32-bit ARM)
- arm64-v8a (64-bit ARM)
- x86 (32-bit Intel)
- x86_64 (64-bit Intel)

## Gradle Configuration

### Build Tools Version
- **buildToolsVersion**: 34.0.0

### NDK Version
- **ndkVersion**: 25.1.8937393

### Kotlin Version
- **kotlinVersion**: 1.9.0

## Material Design Theme
The app uses Material Design 3 (Material You) components through React Native Paper:
- Dynamic color support
- Elevation and shadows
- Ripple effects
- Material Design typography

Theme configuration in `res/values/styles.xml`:
```xml
<style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
    <!-- Material Design 3 theme -->
</style>
```

## Performance Optimizations

### Hermes Engine
- Bytecode compilation for faster startup
- Improved garbage collection
- Reduced memory footprint

### ProGuard
- Code shrinking reduces APK size by ~30%
- Obfuscation improves security
- Optimization improves runtime performance

### Native Modules
- React Native Paper for Material Design components
- Fast Image for optimized image loading and caching
- AsyncStorage for efficient local storage

## Testing

### Run Tests
```bash
cd android
./gradlew test
```

### Run Instrumented Tests
```bash
cd android
./gradlew connectedAndroidTest
```

## Troubleshooting

### Clean Build
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Clear Cache
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
npx react-native run-android
```

## Requirements Validation
This configuration satisfies **Requirement 6.1**: Android Material Design components and design patterns with:
- minSdkVersion 23 (Android 6.0+)
- targetSdkVersion 33 (Android 13)
- Hermes engine enabled
- ProGuard rules configured
- AndroidManifest.xml properly configured
