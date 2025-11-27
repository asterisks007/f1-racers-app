# F1 Racers App - Design Document

## Overview

The F1 Racers App is a single-page application that displays information about Formula 1 drivers, including current and historical racers, their championship standings, and world championship titles. The application will be built using modern web technologies with a focus on simplicity and user experience.

## Architecture

### Technology Stack
- **Frontend Framework**: React (for component-based UI and SPA functionality)
- **State Management**: React hooks (useState, useEffect)
- **Styling**: CSS modules or Tailwind CSS for responsive design
- **Data Source**: Static JSON data file or public F1 API (e.g., Ergast F1 API)
- **Build Tool**: Vite or Create React App
- **Mobile Platform**: React Native or Progressive Web App (PWA) for iOS and Android support
- **UI Framework**: Material Design components (Material-UI or React Native Paper) for mobile interfaces
- **Image Processing**: Canvas API or sharp library for image optimization
- **Image Source**: Wikimedia Commons API for fetching driver images
- **Caching**: Browser Cache API or IndexedDB for storing optimized images

### Application Structure
```
src/
├── components/
│   ├── SearchBox.jsx
│   ├── DriverList.jsx
│   ├── DriverCard.jsx
│   ├── ChampionBadge.jsx
│   └── StandingsDisplay.jsx
├── services/
│   ├── driverService.js
│   ├── imageService.js
│   └── wikimediaService.js
├── data/
│   └── drivers.json (if using static data)
├── App.jsx
└── index.jsx
```

## Components and Interfaces

### SearchBox Component
**Purpose**: Provide search functionality to filter drivers

**Props**:
- `onSearchChange`: Function callback to handle search input changes

**State**: None (controlled component)

**Responsibilities**:
- Display search input field in top right corner
- Emit search text changes to parent component
- Provide clear/reset functionality

### DriverList Component
**Purpose**: Main container component that fetches and displays the list of drivers in a responsive grid

**Props**: 
- `searchQuery`: String for filtering drivers (optional)

**State**:
- `drivers`: Array of driver objects
- `loading`: Boolean for loading state
- `error`: String for error messages

**Grid Layout**:
- Uses CSS Grid with responsive columns
- Desktop (>1400px): 4 columns (`repeat(4, 1fr)`)
- Medium (1025-1400px): 3 columns (`repeat(3, 1fr)`)
- Tablet (769-1024px): 2 columns (`repeat(2, 1fr)`)
- Mobile (≤768px): 1 column (`1fr`)
- Gap: 1.5rem between cards (1rem on mobile)

**Responsibilities**:
- Fetch driver data on component mount
- Filter drivers based on search query
- Render DriverCard components for each driver in grid layout
- Handle loading and error states
- Maintain responsive grid structure across breakpoints

### DriverCard Component
**Purpose**: Display individual driver information with compact/expanded hover interaction

**Props**:
- `driver`: Object containing driver details
  - `id`: Unique identifier
  - `name`: Driver's full name
  - `isWorldChampion`: Boolean
  - `championshipYears`: Array of years (if champion)
  - `currentStanding`: Number (current or last known position)
  - `nationality`: String
  - `team`: String (current or last team)
  - `imageUrl`: String (URL to driver picture)
  - `teamCarImageUrl`: String (URL to racing team car picture, optional)

**State**:
- `imageError`: Boolean to track image loading failures
- `optimizedImageUrl`: String to store the optimized/cached image URL
- `imageLoading`: Boolean to track image optimization progress
- `carImageError`: Boolean to track car image loading failures
- `optimizedCarImageUrl`: String to store the optimized/cached car image URL
- `carImageLoading`: Boolean to track car image optimization progress

**Layout Structure**:
- **Compact View** (Always Visible):
  - Driver image (110x110px, centered)
  - Driver name (centered, 1.1rem font size)
  - Standings badge (centered below name)
  - Card height: 260px minimum
  - Compact padding: 1rem
  - Reduced spacing for efficient layout

- **Expanded View** (Visible on Hover):
  - All compact view elements remain visible
  - Additional details fade in with opacity transition
  - Nationality and team information
  - Champion badge (if applicable)
  - Racing team car image (if available)
  - Card expands to 400px minimum height
  - Name grows to 1.25rem and changes to red color
  - Automatic row scrolling to ensure full visibility

**Responsibilities**:
- Display driver information in compact format by default
- Expand to show full details on hover with smooth transitions
- Fetch and display optimized driver images from cache or Wikimedia
- Fetch and display optimized racing team car images from cache or Wikimedia
- Render driver picture with fallback to placeholder SVG
- Render racing team car image with graceful handling of missing images
- Show championship badge only in expanded state
- Display standings information in compact state
- Handle image loading errors gracefully for both driver and car images
- Trigger image optimization and caching on mount for both image types
- Display loading state while images are being fetched/optimized
- Animate transitions using cubic-bezier(0.4, 0, 0.2, 1) timing
- Apply glow effects and scale transformations on hover
- Detect row position and trigger automatic scrolling when needed
- Calculate optimal scroll position accounting for header and viewport
- Ensure entire row is visible when any card in the row is hovered

### ChampionBadge Component
**Purpose**: Visual indicator for world champions

**Props**:
- `championshipYears`: Array of years

**Responsibilities**:
- Display champion icon/badge
- Show championship years in a formatted way
- Provide visual distinction for champions

### StandingsDisplay Component
**Purpose**: Show driver's championship standing

**Props**:
- `position`: Number representing standing position
- `isCurrentSeason`: Boolean

**Responsibilities**:
- Display standing position
- Format position display (e.g., "1st", "2nd", "3rd")

## Image Management Services

### WikimediaService
**Purpose**: Fetch driver and racing team car images from Wikimedia Commons

**Functions**:
```javascript
export const fetchDriverImage = async (driverName) => {
  // Returns Promise<string> (image URL)
  // Searches Wikimedia Commons for driver image
  // Uses Wikimedia API to find best quality image
}

export const fetchTeamCarImage = async (teamName, year) => {
  // Returns Promise<string | null> (image URL or null)
  // Searches Wikimedia Commons for racing team car image
  // Uses team name and year to find relevant car image
  // Returns null if no suitable image found
}

export const getImageUrl = (filename) => {
  // Returns string (direct image URL)
  // Constructs direct URL to Wikimedia image file
}
```

**Responsibilities**:
- Query Wikimedia Commons API for driver images
- Query Wikimedia Commons API for racing team car images
- Handle API authentication and rate limiting
- Parse API responses to extract image URLs
- Handle cases where no image is found

### ImageService
**Purpose**: Optimize and cache driver images

**Functions**:
```javascript
export const optimizeImage = async (imageUrl, targetWidth = 440) => {
  // Returns Promise<Blob>
  // Fetches image from URL
  // Resizes to target width maintaining aspect ratio
  // Compresses for optimal file size
}

export const cacheImage = async (driverId, imageBlob) => {
  // Returns Promise<void>
  // Stores optimized image in browser cache
  // Uses Cache API or IndexedDB
}

export const getCachedImage = async (driverId) => {
  // Returns Promise<string | null>
  // Retrieves cached image as data URL
  // Returns null if not cached
}

export const getDriverImage = async (driverId, driverName) => {
  // Returns Promise<string>
  // Main function that orchestrates the flow:
  // 1. Check cache first
  // 2. If not cached, fetch from Wikimedia
  // 3. Optimize the image
  // 4. Cache the optimized image
  // 5. Return data URL for display
}

export const getTeamCarImage = async (teamId, teamName, year) => {
  // Returns Promise<string | null>
  // Main function that orchestrates the flow for car images:
  // 1. Check cache first
  // 2. If not cached, fetch from Wikimedia
  // 3. Optimize the image
  // 4. Cache the optimized image
  // 5. Return data URL for display or null if unavailable
}
```

**Responsibilities**:
- Fetch driver and car images from Wikimedia via WikimediaService
- Resize images to 440px width using Canvas API
- Maintain aspect ratio during optimization
- Store optimized images in browser cache
- Retrieve cached images when available
- Update cache when new images are fetched
- Provide fallback to placeholder on errors for driver images
- Return null for unavailable car images (graceful degradation)

**Caching Strategy**:
- Use Cache API for storing optimized images
- Cache key format for drivers: `driver-image-${driverId}`
- Cache key format for cars: `car-image-${teamId}-${year}`
- Cache images as Blob objects
- Implement cache versioning for updates
- Clear old cache entries when new images fetched

**Optimization Algorithm**:
1. Create canvas element with target dimensions
2. Calculate height maintaining aspect ratio
3. Draw image on canvas at new dimensions
4. Convert canvas to Blob with quality setting
5. Return optimized Blob for caching

## Data Models

### Driver Object
```javascript
{
  id: string,
  name: string,
  nationality: string,
  team: string,
  teamId: string, // Unique identifier for the team
  currentYear: number, // Current or most recent season year
  isWorldChampion: boolean,
  championshipYears: number[], // e.g., [2008, 2014, 2015, 2017, 2018, 2019, 2020]
  currentStanding: number,
  careerPoints: number,
  raceWins: number,
  imageUrl: string, // URL to driver picture from copyright-free source
  teamCarImageUrl: string // Optional URL to racing team car picture
}
```

### Data Service Interface
```javascript
// driverService.js
export const getDrivers = async () => {
  // Returns Promise<Driver[]>
  // Fetches from API or static JSON
}

export const sortDriversByStanding = (drivers) => {
  // Returns Driver[]
  // Sorts drivers by current standing
}

export const filterChampions = (drivers) => {
  // Returns Driver[]
  // Filters only world champions
}

export const searchDrivers = (drivers, searchQuery) => {
  // Returns Driver[]
  // Filters drivers by name matching search query (case-insensitive, partial match)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Driver name display completeness
*For any* driver in the displayed list, the driver's name should be present in the rendered output.
**Validates: Requirements 1.3**

### Property 2: Standings display completeness
*For any* driver with a standing position, that position should be displayed in the UI.
**Validates: Requirements 2.1, 2.2**

### Property 3: Champion indication
*For any* driver, the UI should clearly indicate whether they are a World Champion.
**Validates: Requirements 3.1**

### Property 4: Championship years display
*For any* driver who is a World Champion, all of their championship years should be displayed.
**Validates: Requirements 3.2, 3.4**

### Property 5: Champion visual distinction
*For any* two drivers where one is a champion and one is not, there should be a visual difference in their display.
**Validates: Requirements 3.3**

### Property 6: Search filtering accuracy
*For any* search query text, the displayed driver list should contain only drivers whose names contain that text as a substring.
**Validates: Requirements 5.2**

### Property 7: Substring search matching
*For any* driver name and any substring of that name (beginning, middle, or end), searching for that substring should match the driver.
**Validates: Requirements 5.3**

### Property 8: Driver image display
*For any* driver in the list, an image (either actual photo or placeholder) should be displayed.
**Validates: Requirements 6.1**

### Property 9: Placeholder fallback for unavailable images
*For any* driver without an available picture, the placeholder image should be displayed.
**Validates: Requirements 6.4**

### Property 10: Placeholder fallback for failed images
*For any* driver image that fails to load, the placeholder image should be displayed instead.
**Validates: Requirements 6.5**

### Property 11: Compact view content requirements
*For any* driver card in compact view, it should display the driver image, name, and standings.
**Validates: Requirements 8.1**

### Property 12: Hover expansion behavior
*For any* driver card, hovering over it should expand the card and reveal additional information (nationality, team, championship details).
**Validates: Requirements 8.2**

### Property 13: Animation duration minimum
*For any* transition between compact and expanded views, the animation should last at least 0.5 seconds.
**Validates: Requirements 8.3**

### Property 14: Compact view centering
*For any* driver card in compact view, the content should be centered.
**Validates: Requirements 8.4**

### Property 15: Champion badge visibility restriction
*For any* driver who is a World Champion, the champion badge should only be visible in the expanded hover state, not in compact view.
**Validates: Requirements 8.5**

### Property 16: Interactive element hover effects
*For any* interactive element, hovering should trigger glowing borders and scale transformations.
**Validates: Requirements 9.2**

### Property 17: Animation timing function consistency
*For any* animation or transition in the application, the timing function should use cubic-bezier.
**Validates: Requirements 9.3**

### Property 18: Brand color consistency
*For any* element using the F1 brand accent color, the color value should be #e10600.
**Validates: Requirements 9.5**

### Property 19: Responsive sizing adjustments
*For any* viewport size (desktop, tablet, mobile), appropriate sizing adjustments should be applied to UI elements.
**Validates: Requirements 9.7**

### Property 20: Desktop grid layout (4 columns)
*For any* desktop viewport wider than 1400 pixels, exactly 4 driver cards should be displayed per row.
**Validates: Requirements 10.1**

### Property 21: Medium screen grid layout (3 columns)
*For any* viewport between 1025 and 1400 pixels, exactly 3 driver cards should be displayed per row.
**Validates: Requirements 10.2**

### Property 22: Tablet grid layout (2 columns)
*For any* viewport between 769 and 1024 pixels, exactly 2 driver cards should be displayed per row.
**Validates: Requirements 10.3**

### Property 23: Mobile grid layout (1 column)
*For any* viewport 768 pixels or smaller, exactly 1 driver card should be displayed per row.
**Validates: Requirements 10.4**

### Property 24: Responsive spacing consistency
*For any* responsive breakpoint, consistent spacing values should be applied to maintain visual alignment.
**Validates: Requirements 10.5**

### Property 25: Row detection on hover
*For any* driver card hover event, the system should correctly identify which row the card belongs to.
**Validates: Requirements 11.1**

### Property 26: Automatic scroll for overflow rows
*For any* expanded row that extends beyond the viewport, automatic scrolling should occur to display the entire row.
**Validates: Requirements 11.2**

### Property 27: Scroll position calculation accuracy
*For any* scroll calculation, the sticky header height and viewport padding should be factored into the position.
**Validates: Requirements 11.3**

### Property 28: Smooth scrolling behavior
*For any* viewport position adjustment, smooth scrolling behavior should be used.
**Validates: Requirements 11.4**

### Property 29: Row positioning with padding
*For any* expanded row that fits within the viewport, appropriate padding from the header should be applied.
**Validates: Requirements 11.5**

### Property 30: Scroll delay timing
*For any* scroll trigger from card hover, a 100 millisecond delay should be applied before scrolling begins.
**Validates: Requirements 11.6**

### Property 31: Mobile search functionality
*For any* mobile device accessing the application, the driver search functionality should work correctly.
**Validates: Requirements 12.2**

### Property 32: Wikimedia image source
*For any* driver image request, the image should be fetched from Wikimedia sources.
**Validates: Requirements 13.1**

### Property 33: Image optimization dimensions
*For any* image fetched from Wikimedia, the optimized version should have a width of 440 pixels while maintaining the original aspect ratio.
**Validates: Requirements 13.2**

### Property 34: Cache update on new image
*For any* newly fetched and optimized image, the image cache should be updated immediately.
**Validates: Requirements 13.3**

### Property 35: Cache retrieval for display
*For any* driver image display request, the application should first check and retrieve from the cache.
**Validates: Requirements 13.4**

### Property 36: Cache usage over re-fetching
*For any* driver image that exists in the cache, the cached version should be used without re-fetching from Wikimedia.
**Validates: Requirements 13.5**

### Property 37: Racing team car image display on hover
*For any* driver card with an available team car image, hovering over the card should display the racing team car image in the expanded view.
**Validates: Requirements 14.1**

### Property 38: Team car image Wikimedia source
*For any* racing team car image request, the image should be fetched from Wikimedia sources.
**Validates: Requirements 14.2**

### Property 39: Team car image optimization dimensions
*For any* racing team car image fetched from Wikimedia, the optimized version should have a width of 440 pixels while maintaining the original aspect ratio.
**Validates: Requirements 14.3**

### Property 40: Graceful handling of unavailable car images
*For any* driver without an available racing team car image, the expanded view should either display a placeholder or omit the car image section without breaking the layout.
**Validates: Requirements 14.4**

### Property 41: Graceful handling of failed car images
*For any* racing team car image that fails to load, the system should display a placeholder or gracefully handle the missing image without disrupting the user experience.
**Validates: Requirements 14.5**

## Visual Design and Styling

### Design System

**Color Palette**:
- Primary Red: #e10600 (F1 brand color)
- Dark Red: #a00500 (hover states, gradients)
- Background Black: #0a0a0a to #15151e (gradient)
- Card Background: #1a1a1a to #2d2d2d (gradient)
- Text White: #ffffff
- Text Gray: #999999
- Gold: #ffd700 (champion badges)

**Typography**:
- Font Family: 'Inter', 'Segoe UI', 'Roboto', sans-serif
- Driver Name: 1.3rem (compact), 1.5rem (hover)
- Body Text: 0.95rem
- Labels: 0.85rem uppercase with letter-spacing

**Animation Timing**:
- Primary Transitions: 0.5s cubic-bezier(0.4, 0, 0.2, 1)
- Hover Effects: 0.3s to 0.5s
- Shine Animations: 2s to 3s infinite

### Component Styling

**Driver Cards**:
- Gradient background with multiple layers
- 2px red border with glow effect on hover
- 16px border radius
- Box shadows with multiple layers for depth
- Smooth height transition from 320px to 480px
- Scale transformation (1.02) and lift effect (-8px) on hover
- Shine animation sweep across card on hover

**Champion Badges**:
- Gold gradient background (#ffd700 to #ffed4e)
- Animated shine effect across badge
- Pulsing trophy icon animation
- Multiple shadow layers for 3D effect
- Scale transformation on hover

**Search Box**:
- Integrated search icon (🔍) inside input
- Gradient background matching card style
- Focus state with red glow and lift effect
- 12px border radius
- Smooth border color transitions

**Standings Display**:
- Red gradient background
- Shine animation on hover
- Scale transformation (1.05) on hover
- Text shadows for depth

**Header**:
- Red gradient background with shine animation
- Glowing title with animated text shadow
- Sticky positioning at top
- Backdrop blur effect

### Responsive Design

**Desktop (>1400px)**:
- 4 driver cards per row
- Driver images: 110x110px
- Card heights: 260px (compact), 400px (expanded)
- Full spacing and effects

**Medium Screens (1025px-1400px)**:
- 3 driver cards per row
- Same sizing as desktop
- Adjusted grid gaps

**Tablet (769px-1024px)**:
- 2 driver cards per row
- Driver images: 100x100px
- Card heights: 240px (compact), 380px (expanded)
- Reduced font sizes
- Adjusted spacing

**Mobile (≤768px)**:
- 1 driver card per row
- Driver images: 90x90px
- Card heights: 220px (compact), 360px (expanded)
- Further reduced font sizes
- Compact padding (0.75rem)

### Placeholder Image

**SVG Illustration**:
- Detailed F1 driver with racing cap
- Red racing cap with gradient (#e10600 to #a00500)
- Racing suit with team colors
- Realistic proportions and features
- Dark gradient background
- 440x440px dimensions

## Error Handling

### Data Fetching Errors
- Display user-friendly error message if data fetch fails
- Provide retry mechanism
- Log errors to console for debugging

### Missing Data
- Handle cases where driver information is incomplete
- Display "N/A" or placeholder for missing fields
- Use detailed placeholder SVG image when driver picture is unavailable
- Ensure app doesn't crash with incomplete data

### Network Issues
- Show loading spinner during data fetch
- Display timeout message if request takes too long
- Implement graceful degradation

### Image Loading Errors
- Detect image load failures using onError event handler
- Automatically fallback to placeholder SVG
- Maintain layout consistency when using placeholder

## Row-Based Scroll Adjustment

### Purpose
Ensure that when a user hovers over any driver card, the entire row of cards is visible in the viewport, preventing partial row visibility and improving user experience.

### Implementation

**Row Detection Algorithm**:
1. Get parent grid container from hovered card
2. Find all cards in the grid
3. Calculate cards per row based on viewport width
4. Determine row index using: `Math.floor(cardIndex / cardsPerRow)`
5. Identify first and last cards in the same row

**Viewport Calculation**:
1. Get sticky header height dynamically
2. Calculate available viewport space (viewport height - header height)
3. Add 20px padding at top and bottom for visual comfort
4. Determine if expanded row fits in available space

**Scroll Decision Logic**:
- Check if row top is below header (with padding)
- Check if row bottom is within viewport (with padding)
- Only scroll if either condition fails

**Scroll Behavior**:
- **If row fits**: Calculate precise scroll position to position row below header with padding
- **If row doesn't fit**: Scroll to show top of row using `scrollIntoView`
- Use smooth scrolling (`behavior: 'smooth'`)
- Apply 100ms delay to allow expansion animation to start

**Responsive Behavior**:
- Desktop (>1400px): Handles 4-card rows
- Medium (1025-1400px): Handles 3-card rows
- Tablet (769-1024px): Handles 2-card rows
- Mobile (≤768px): Handles single card (no row scrolling needed)

### Edge Cases
- Handles first row (may not need scrolling)
- Handles last row (may be incomplete)
- Accounts for varying card heights during expansion
- Prevents unnecessary scrolling when row already visible

## Mobile Platform Support

### Mobile Application Strategy

**Approach**: Progressive Web App (PWA) with React
- Leverage existing React web application codebase
- Add PWA capabilities for installable mobile experience
- Ensure responsive design works seamlessly on mobile devices
- Implement Material Design principles for mobile UI consistency

**Alternative Approach**: React Native (if native mobile apps required)
- Share business logic and data services between web and mobile
- Create platform-specific UI components for iOS and Android
- Use React Native Paper for Material Design components
- Maintain consistent user experience across platforms

### Mobile-Specific Features

**Touch Interactions**:
- Tap to expand driver cards (instead of hover)
- Swipe gestures for navigation (if applicable)
- Touch-optimized button and input sizes (minimum 44x44px)
- Haptic feedback for interactions (React Native)

**Mobile UI Adaptations**:
- Bottom navigation or hamburger menu for mobile
- Full-screen search overlay on mobile devices
- Optimized card layouts for portrait and landscape orientations
- Reduced animations for better performance on lower-end devices

**Material Design Implementation**:
- Use Material Design elevation system for depth
- Implement Material ripple effects on interactive elements
- Follow Material Design spacing and typography guidelines
- Use Material Design color system with F1 brand colors
- Implement Material Design motion principles for smooth transitions

**Performance Optimizations**:
- Lazy loading of driver images
- Virtual scrolling for large driver lists
- Optimized bundle size for mobile networks
- Service worker for offline capability (PWA)
- Image optimization and responsive images

**Platform-Specific Considerations**:
- iOS: Safe area insets for notched devices
- Android: Back button handling
- Both: Status bar styling to match app theme
- Both: Splash screen with F1 branding

### Mobile Testing Strategy
- Test on various iOS devices (iPhone SE, iPhone 14, iPad)
- Test on various Android devices (different screen sizes and OS versions)
- Verify touch interactions work smoothly
- Test search functionality on mobile keyboards
- Verify Material Design components render correctly
- Test performance on slower mobile networks

## Containerization and Deployment

### Docker Configuration

**Dockerfile Strategy**:
- Use multi-stage build to optimize image size
- Stage 1: Build stage using Node.js image to compile the application
- Stage 2: Production stage using lightweight nginx image to serve static files
- Copy built assets from build stage to nginx html directory
- Expose port 80 by default (configurable via environment variables)

**Docker Image Structure**:
```
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Kubernetes Deployment

**Helm Chart Structure**:
```
helm-chart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml (optional)
```

**Key Configuration Options** (values.yaml):
- `image.repository`: Docker image repository
- `image.tag`: Image version tag
- `service.port`: Configurable application port (default: 80)
- `service.type`: Service type (ClusterIP, NodePort, LoadBalancer)
- `replicaCount`: Number of pod replicas
- `resources`: CPU and memory limits/requests
- `ingress.enabled`: Enable/disable ingress
- `ingress.hosts`: Hostname configuration for external access

**Deployment Considerations**:
- Use ConfigMap for nginx configuration if custom settings needed
- Implement health checks (liveness and readiness probes)
- Set appropriate resource limits to prevent resource exhaustion
- Use rolling update strategy for zero-downtime deployments

**URL Access**:
- ClusterIP: Internal cluster access only
- NodePort: Access via `<NodeIP>:<NodePort>`
- LoadBalancer: Access via external load balancer IP
- Ingress: Access via configured domain name

## Testing Strategy

### Property-Based Testing

**Library**: fast-check (for JavaScript/React)

**Configuration**:
- Minimum 100 iterations per property test
- Each property test must reference its corresponding correctness property using the format: `**Feature: f1-racers-app, Property {number}: {property_text}**`
- Each correctness property should be implemented by a single property-based test

**Property Test Coverage**:
- Property 1-5: Driver display and champion indication properties
- Property 6-10: Search and image display properties
- Property 11-15: Card layout and interaction properties
- Property 16-19: Styling and animation properties
- Property 20-24: Responsive grid layout properties
- Property 25-30: Row scrolling behavior properties
- Property 31: Mobile search functionality
- Property 32-36: Image fetching, optimization, and caching properties
- Property 37-41: Racing team car image display and handling properties

**Testing Approach**:
- Generate random driver data with various combinations of properties
- Generate random viewport sizes for responsive testing
- Generate random search queries for filtering tests
- Test image optimization with various image dimensions
- Verify cache behavior with different cache states

### Unit Tests
- Test driver service functions (sorting, filtering, searching)
- Test component rendering with mock data
- Test champion badge display logic
- Test standings formatting
- Test touch interaction handlers for mobile
- Test image service functions (optimization, caching)
- Test Wikimedia service API integration
- Test cache retrieval and storage mechanisms

### Integration Tests
- Test data flow from service to components
- Test user interactions (filtering, sorting, search)
- Test error handling scenarios
- Test PWA installation and offline functionality
- Test Material Design component integration
- Test end-to-end image fetching and caching flow
- Test cache invalidation and updates

### Mobile Testing
- Test responsive layouts on various mobile screen sizes
- Verify touch interactions work correctly (tap, swipe)
- Test search functionality with mobile keyboards
- Verify smooth transitions and animations on mobile devices
- Test on actual iOS and Android devices
- Verify Material Design principles are properly implemented
- Test performance on slower mobile networks
- Verify safe area handling on notched devices

### Container Testing
- Verify Docker image builds successfully
- Test container runs and serves application correctly
- Validate port configuration works as expected
- Test Helm chart installation and upgrades

### Manual Testing
- Verify responsive design on different screen sizes
- Check visual appearance of champion badges
- Validate data accuracy against known F1 records
- Test loading states and error messages
- Verify application accessibility via configured URL after deployment
- Test mobile app installation (PWA) on iOS and Android
- Verify Material Design aesthetics and interactions
- Test image optimization quality and performance
- Verify cache persistence across sessions
