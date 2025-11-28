# F1 Racers Mobile App

Native iOS and Android mobile applications for browsing F1 driver standings and information.

## Tech Stack

- **React Native 0.73** - Cross-platform mobile framework
- **TypeScript** - Type-safe development with strict mode enabled
- **React Navigation** - Navigation library for iOS and Android
- **React Native Paper** - Material Design and iOS-style components
- **AsyncStorage** - Local data persistence
- **react-native-fast-image** - Optimized image loading and caching
- **Jest + React Native Testing Library** - Testing framework
- **fast-check** - Property-based testing library

## Project Structure

```
mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── services/       # Business logic and data services
│   ├── models/         # TypeScript interfaces and types
│   ├── utils/          # Utility functions
│   ├── assets/         # Images, fonts, and static assets
│   └── test/           # Test setup and utilities
├── android/            # Android native code
├── ios/                # iOS native code
└── App.tsx             # Root component
```

## Setup

### Prerequisites

- Node.js >= 18
- npm or yarn
- For iOS: Xcode 14.0+, CocoaPods
- For Android: Android Studio, JDK 11+

### Installation

```bash
# Install dependencies
npm install

# iOS only: Install CocoaPods dependencies
cd ios && pod install && cd ..
```

## Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Development

The project uses TypeScript with strict mode enabled for type safety. All code should follow the configured ESLint and Prettier rules.

### Key Features

- Offline-first architecture with local data caching
- Platform-specific UI (iOS and Material Design)
- Responsive layouts for phones and tablets
- Image caching for optimal performance
- Accessibility support (screen readers, dynamic text)
- Dark mode support

## Requirements

See `.kiro/specs/f1-racers-mobile-app/requirements.md` for detailed requirements.

## Design

See `.kiro/specs/f1-racers-mobile-app/design.md` for architecture and design decisions.
