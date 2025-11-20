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
**Purpose**: Main container component that fetches and displays the list of drivers

**Props**: 
- `searchQuery`: String for filtering drivers (optional)

**State**:
- `drivers`: Array of driver objects
- `loading`: Boolean for loading state
- `error`: String for error messages

**Responsibilities**:
- Fetch driver data on component mount
- Filter drivers based on search query
- Render DriverCard components for each driver
- Handle loading and error states

### DriverCard Component
**Purpose**: Display individual driver information

**Props**:
- `driver`: Object containing driver details
  - `id`: Unique identifier
  - `name`: Driver's full name
  - `isWorldChampion`: Boolean
  - `championshipYears`: Array of years (if champion)
  - `currentStanding`: Number (current or last known position)
  - `nationality`: String
  - `team`: String (current or last team)

**Responsibilities**:
- Display driver name and basic info
- Show championship badge if applicable
- Display standings information
- Render championship years for world champions

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
  raceWins: number
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

## Error Handling

### Data Fetching Errors
- Display user-friendly error message if data fetch fails
- Provide retry mechanism
- Log errors to console for debugging

### Missing Data
- Handle cases where driver information is incomplete
- Display "N/A" or placeholder for missing fields
- Ensure app doesn't crash with incomplete data

### Network Issues
- Show loading spinner during data fetch
- Display timeout message if request takes too long
- Implement graceful degradation

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
