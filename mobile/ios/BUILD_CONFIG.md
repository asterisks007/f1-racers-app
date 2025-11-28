# iOS Build Configuration

## Overview
This document describes the iOS build configuration for the F1 Racers Mobile application.

## Build Settings

### Minimum iOS Version
- **IPHONEOS_DEPLOYMENT_TARGET**: 13.0
- Supports iPhone and iPad (TARGETED_DEVICE_FAMILY: "1,2")

### Code Signing
- **Debug**: Automatic code signing with "iPhone Developer" identity
- **Release**: Automatic code signing with "iPhone Distribution" identity
- **Development Team**: Configure in Xcode or set DEVELOPMENT_TEAM environment variable

### Build Schemes
- **Debug**: Development build with debugging enabled
- **Release**: Production build with optimizations enabled

### Info.plist Configuration
The Info.plist includes:
- App display name: "F1 Racers"
- Bundle identifier: com.f1racers.mobile
- Version: 1.0.0 (Build 1)
- Supported orientations: Portrait, Landscape Left, Landscape Right
- App Transport Security: Allows localhost for development
- Custom fonts support for Ionicons

## Setup Instructions

### 1. Install Dependencies
```bash
cd ios
pod install
```

### 2. Configure Code Signing
Open the project in Xcode and configure your development team:
```bash
open F1RacersMobile.xcworkspace
```

In Xcode:
1. Select the F1RacersMobile project
2. Select the F1RacersMobile target
3. Go to "Signing & Capabilities"
4. Select your development team
5. Xcode will automatically manage provisioning profiles

### 3. Build the App
```bash
# Debug build
npx react-native run-ios

# Release build
npx react-native run-ios --configuration Release
```

## Build Schemes

### Debug Scheme
- Optimizations: Disabled
- Debugging: Enabled
- Bitcode: Disabled (required for React Native)
- Code signing: Development

### Release Scheme
- Optimizations: Enabled
- Debugging: Disabled
- Bitcode: Disabled (required for React Native)
- Code signing: Distribution

## Requirements Validation
This configuration satisfies **Requirement 5.1**: iOS native UI components and design patterns with minimum iOS 13.0 support.
