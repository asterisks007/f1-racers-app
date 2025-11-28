# App Assets Configuration Guide

This guide explains how to generate and configure app icons and splash screens for the F1 Racers mobile app.

## Overview

The app requires:
- **App Icon**: Displayed on the home screen and app switcher
- **Splash Screen**: Shown while the app is launching

Source files are located in `src/assets/`:
- `app-icon.svg` - Vector source for app icon
- `splash-screen.svg` - Vector source for splash screen

## Quick Setup (Recommended)

### Using React Native Asset Tools

The easiest way to generate all required assets is using automated tools:

#### Option 1: react-native-make (Recommended)

```bash
# Install the tool
npm install -g react-native-make

# Generate app icons from SVG
# First, convert SVG to PNG (1024x1024 for iOS, 512x512 for Android)
# Then run:
react-native set-icon --path ./icon.png

# Generate splash screens
react-native set-splash --path ./splash.png --resize contain --background "#E10600"
```

#### Option 2: App Icon Generator Online Tools

Use online tools to generate all required sizes:
- https://appicon.co/
- https://www.appicon.build/
- https://makeappicon.com/

Upload the `app-icon.svg` (converted to 1024x1024 PNG) and download the generated asset catalogs.

## Manual Setup

If you prefer manual control, follow these platform-specific instructions:

---

## iOS Configuration

### App Icon Sizes Required

iOS requires multiple icon sizes for different devices and contexts:

| Size (px) | Usage | Filename |
|-----------|-------|----------|
| 1024x1024 | App Store | AppIcon-1024.png |
| 180x180 | iPhone @3x | AppIcon-60@3x.png |
| 120x120 | iPhone @2x | AppIcon-60@2x.png |
| 167x167 | iPad Pro @2x | AppIcon-83.5@2x.png |
| 152x152 | iPad @2x | AppIcon-76@2x.png |
| 76x76 | iPad | AppIcon-76.png |
| 40x40 | Spotlight | AppIcon-40.png |
| 80x80 | Spotlight @2x | AppIcon-40@2x.png |
| 120x120 | Spotlight @3x | AppIcon-40@3x.png |
| 29x29 | Settings | AppIcon-29.png |
| 58x58 | Settings @2x | AppIcon-29@2x.png |
| 87x87 | Settings @3x | AppIcon-29@3x.png |

### Generate iOS Icons

```bash
# Using ImageMagick
for size in 1024 180 120 167 152 76 40 80 120 29 58 87; do
  convert -background none -resize ${size}x${size} src/assets/app-icon.svg ios/F1Racers/Images.xcassets/AppIcon.appiconset/AppIcon-${size}.png
done
```

### iOS Splash Screen (Launch Screen)

iOS uses a storyboard for launch screens. Create `ios/F1Racers/LaunchScreen.storyboard`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="21701" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM">
    <device id="retina6_12" orientation="portrait" appearance="light"/>
    <dependencies>
        <deployment identifier="iOS"/>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="21678"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <imageView clipsSubviews="YES" userInteractionEnabled="NO" contentMode="scaleAspectFit" horizontalHuggingPriority="251" verticalHuggingPriority="251" image="SplashIcon" translatesAutoresizingMaskIntoConstraints="NO" id="tWc-Dq-wcI">
                                <rect key="frame" x="96.666666666666686" y="326" width="200" height="200"/>
                                <constraints>
                                    <constraint firstAttribute="width" constant="200" id="sOf-wF-4OW"/>
                                    <constraint firstAttribute="height" constant="200" id="zqN-IH-107"/>
                                </constraints>
                            </imageView>
                            <label opaque="NO" userInteractionEnabled="NO" contentMode="left" horizontalHuggingPriority="251" verticalHuggingPriority="251" text="F1 RACERS" textAlignment="center" lineBreakMode="tailTruncation" baselineAdjustment="alignBaselines" adjustsFontSizeToFit="NO" translatesAutoresizingMaskIntoConstraints="NO" id="GJd-Yh-RWb">
                                <rect key="frame" x="20" y="546" width="353" height="41"/>
                                <fontDescription key="fontDescription" type="boldSystem" pointSize="34"/>
                                <color key="textColor" white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
                                <nil key="highlightedColor"/>
                            </label>
                        </subviews>
                        <viewLayoutGuide key="safeArea" id="Bcu-3y-fUS"/>
                        <color key="backgroundColor" red="0.88235294117647056" green="0.023529411764705882" blue="0" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
                        <constraints>
                            <constraint firstItem="tWc-Dq-wcI" firstAttribute="centerX" secondItem="Ze5-6b-2t3" secondAttribute="centerX" id="5cz-MP-9tL"/>
                            <constraint firstItem="GJd-Yh-RWb" firstAttribute="top" secondItem="tWc-Dq-wcI" secondAttribute="bottom" constant="20" id="Fgm-CP-h1e"/>
                            <constraint firstItem="tWc-Dq-RWb" firstAttribute="centerY" secondItem="Ze5-6b-2t3" secondAttribute="centerY" id="OLb-ux-CHf"/>
                            <constraint firstItem="GJd-Yh-RWb" firstAttribute="leading" secondItem="Bcu-3y-fUS" secondAttribute="leading" constant="20" id="fD7-Vt-htt"/>
                            <constraint firstItem="Bcu-3y-fUS" firstAttribute="trailing" secondItem="GJd-Yh-RWb" secondAttribute="trailing" constant="20" id="oBe-4J-vwl"/>
                        </constraints>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="52.671755725190835" y="374.64788732394368"/>
        </scene>
    </scenes>
    <resources>
        <image name="SplashIcon" width="200" height="200"/>
    </resources>
</document>
```

Place the splash icon image at `ios/F1Racers/Images.xcassets/SplashIcon.imageset/`

---

## Android Configuration

### App Icon Sizes Required

Android requires icons for different screen densities:

| Density | Size (px) | Folder |
|---------|-----------|--------|
| mdpi | 48x48 | mipmap-mdpi |
| hdpi | 72x72 | mipmap-hdpi |
| xhdpi | 96x96 | mipmap-xhdpi |
| xxhdpi | 144x144 | mipmap-xxhdpi |
| xxxhdpi | 192x192 | mipmap-xxxhdpi |

### Generate Android Icons

```bash
# Using ImageMagick
mkdir -p android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}

convert -background none -resize 48x48 src/assets/app-icon.svg android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert -background none -resize 72x72 src/assets/app-icon.svg android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert -background none -resize 96x96 src/assets/app-icon.svg android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert -background none -resize 144x144 src/assets/app-icon.svg android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert -background none -resize 192x192 src/assets/app-icon.svg android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Round icons (Android 8.0+)
convert -background none -resize 48x48 src/assets/app-icon.svg android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
convert -background none -resize 72x72 src/assets/app-icon.svg android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
convert -background none -resize 96x96 src/assets/app-icon.svg android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
convert -background none -resize 144x144 src/assets/app-icon.svg android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
convert -background none -resize 192x192 src/assets/app-icon.svg android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
```

### Android Splash Screen

For Android 12+, use the new Splash Screen API. Create `android/app/src/main/res/values/styles.xml`:

```xml
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="android:windowBackground">@drawable/splash_screen</item>
        <item name="android:statusBarColor">@color/splash_background</item>
    </style>
    
    <!-- Splash Screen Theme (Android 12+) -->
    <style name="Theme.App.SplashScreen" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/splash_background</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>
        <item name="postSplashScreenTheme">@style/AppTheme</item>
    </style>
</resources>
```

Create `android/app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="splash_background">#E10600</color>
</resources>
```

Create splash drawable at `android/app/src/main/res/drawable/splash_screen.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_icon"/>
    </item>
</layer-list>
```

Generate splash icon images for different densities:

```bash
mkdir -p android/app/src/main/res/drawable-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}

convert -background none -resize 200x200 src/assets/app-icon.svg android/app/src/main/res/drawable-mdpi/splash_icon.png
convert -background none -resize 300x300 src/assets/app-icon.svg android/app/src/main/res/drawable-hdpi/splash_icon.png
convert -background none -resize 400x400 src/assets/app-icon.svg android/app/src/main/res/drawable-xhdpi/splash_icon.png
convert -background none -resize 600x600 src/assets/app-icon.svg android/app/src/main/res/drawable-xxhdpi/splash_icon.png
convert -background none -resize 800x800 src/assets/app-icon.svg android/app/src/main/res/drawable-xxxhdpi/splash_icon.png
```

Update `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:theme="@style/Theme.App.SplashScreen">
    <!-- ... -->
</application>
```

---

## Using react-native-splash-screen (Alternative)

For more control over splash screen timing:

```bash
npm install react-native-splash-screen
```

Then follow the library's setup instructions for iOS and Android.

---

## Testing

### iOS
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

Check that:
1. App icon appears correctly on home screen
2. Splash screen displays when launching app
3. Icons look sharp on all device densities
4. Colors match the design (#E10600 red)

---

## Design Notes

### App Icon
- Features a stylized F1 racing helmet
- F1 red background (#E10600) - iconic Formula 1 color
- Black helmet with white visor stripe
- "F1" text at bottom for clarity
- Works well at all sizes from 29x29 to 1024x1024

### Splash Screen
- F1 red gradient background
- Large centered helmet icon
- "F1 RACERS" title text
- "Driver Standings" subtitle
- Checkered flag pattern at bottom (racing theme)
- Optimized for various screen sizes and orientations

---

## Troubleshooting

### Icons not updating
- Clean build folders: `npx react-native clean`
- iOS: Delete app from simulator/device and reinstall
- Android: Clear app data or reinstall

### Wrong colors
- Ensure SVG colors match specifications
- Check that PNG conversion preserved colors
- Verify theme colors in platform config files

### Blurry icons
- Ensure you're generating at correct sizes
- Use vector source (SVG) for best quality
- Don't upscale smaller images

---

## Resources

- [iOS Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android App Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [React Native Asset Management](https://reactnative.dev/docs/images)
- [Android 12 Splash Screen API](https://developer.android.com/guide/topics/ui/splash-screen)
