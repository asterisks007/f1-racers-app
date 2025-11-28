# Assets Directory

This directory contains all visual assets for the F1 Racers mobile app.

## Contents

### Driver Placeholder Images

Placeholder images displayed when driver photos fail to load or are loading:

- `driver-placeholder.svg` - Vector source file for the placeholder
- `driver-placeholder@1x.png` - 200x200px (base resolution)
- `driver-placeholder@2x.png` - 400x400px (2x resolution for Retina displays)
- `driver-placeholder@3x.png` - 600x600px (3x resolution for high-DPI displays)

### App Icon and Splash Screen

Source files for app branding:

- `app-icon.svg` - Vector source for app icon (1024x1024)
- `splash-screen.svg` - Vector source for splash screen

**For complete setup instructions**, see `../APP_ASSETS_GUIDE.md`

### Data Files

- `drivers.json` - F1 driver data

### Generating PNG Files from SVG

To generate the PNG files from the SVG source, you can use one of these methods:

#### Method 1: Using ImageMagick
```bash
# Install ImageMagick if not already installed
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate 1x (200x200)
convert -background none -resize 200x200 driver-placeholder.svg driver-placeholder@1x.png

# Generate 2x (400x400)
convert -background none -resize 400x400 driver-placeholder.svg driver-placeholder@2x.png

# Generate 3x (600x600)
convert -background none -resize 600x600 driver-placeholder.svg driver-placeholder@3x.png
```

#### Method 2: Using Inkscape
```bash
# Install Inkscape if not already installed
# macOS: brew install inkscape
# Ubuntu: sudo apt-get install inkscape

# Generate 1x (200x200)
inkscape driver-placeholder.svg --export-type=png --export-filename=driver-placeholder@1x.png -w 200 -h 200

# Generate 2x (400x400)
inkscape driver-placeholder.svg --export-type=png --export-filename=driver-placeholder@2x.png -w 400 -h 400

# Generate 3x (600x600)
inkscape driver-placeholder.svg --export-type=png --export-filename=driver-placeholder@3x.png -w 600 -h 600
```

#### Method 3: Using Online Tools
You can also use online SVG to PNG converters like:
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com/

### Usage in Code

```typescript
import { Image } from 'react-native';

// React Native automatically selects the correct resolution
const placeholderImage = require('./assets/driver-placeholder.png');

<Image source={placeholderImage} style={{ width: 200, height: 200 }} />
```

### Design Notes

The placeholder features:
- A stylized racing helmet representing an F1 driver
- Neutral gray color scheme that works in both light and dark modes
- A question mark symbol indicating missing/unknown driver
- Simple, recognizable design that loads quickly
