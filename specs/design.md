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
│   └── driverService.js
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

**State**:
- `imageError`: Boolean to track image loading failures

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
  - Card expands to 400px minimum height
  - Name grows to 1.25rem and changes to red color
  - Automatic row scrolling to ensure full visibility

**Responsibilities**:
- Display driver information in compact format by default
- Expand to show full details on hover with smooth transitions
- Render driver picture with fallback to placeholder SVG
- Show championship badge only in expanded state
- Display standings information in compact state
- Handle image loading errors gracefully
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

## Data Models

### Driver Object
```javascript
{
  id: string,
  name: string,
  nationality: string,
  team: string,
  isWorldChampion: boolean,
  championshipYears: number[], // e.g., [2008, 2014, 2015, 2017, 2018, 2019, 2020]
  currentStanding: number,
  careerPoints: number,
  raceWins: number,
  imageUrl: string // URL to driver picture from copyright-free source
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

### Unit Tests
- Test driver service functions (sorting, filtering)
- Test component rendering with mock data
- Test champion badge display logic
- Test standings formatting

### Integration Tests
- Test data flow from service to components
- Test user interactions (if filtering/sorting added)
- Test error handling scenarios

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
