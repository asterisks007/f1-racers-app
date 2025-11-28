# Running React Native Mobile App in Browser

## Option 1: Use React Native Web (Recommended for Browser Testing)

To run the mobile app in a browser, you need to add React Native Web support:

### Steps:

1. **Install React Native Web dependencies:**
```bash
cd mobile
npm install react-native-web react-dom
npm install --save-dev @vitejs/plugin-react vite
```

2. **Create a web entry point** (`mobile/index.web.js`):
```javascript
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
```

3. **Create Vite config** (`mobile/vite.config.js`):
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.js', '.js', '.web.jsx', '.jsx', '.json'],
  },
  server: {
    port: 3001,
  },
});
```

4. **Create HTML file** (`mobile/index.html`):
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>F1 Racers Mobile</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.web.js"></script>
  </body>
</html>
```

5. **Add script to package.json:**
```json
"scripts": {
  "web": "vite",
  ...
}
```

6. **Run:**
```bash
npm run web
```

---

## Option 2: Use Android/iOS Emulator (Full Native Experience)

### Android Emulator:
1. Install Android Studio
2. Set up Android SDK and emulator
3. Run: `npm run android`

### iOS Simulator (Mac only):
1. Install Xcode
2. Run: `npm run ios`

---

## Option 3: Use Physical Device

### Android:
1. Enable Developer Mode on your Android device
2. Enable USB Debugging
3. Connect via USB
4. Run: `npm run android`

### iOS (Mac only):
1. Connect iPhone via USB
2. Trust the computer
3. Run: `npm run ios --device`

---

## Current Status:

- ✅ **Web App**: Running at http://localhost:5174/
- ⚠️ **Mobile App**: Requires emulator or React Native Web setup

The mobile app is a true native application with platform-specific features (iOS/Android UI, gestures, etc.) that work best on actual devices or emulators.
