# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Initialize React project with Vite
  - Install necessary dependencies (React, CSS framework if needed)
  - Create directory structure for components, services, and data
  - _Requirements: 4.1, 4.2_

- [x] 2. Create data service and sample data
  - [x] 2.1 Create driver data model and sample JSON file
    - Define driver data structure with all required fields (id, name, nationality, team, isWorldChampion, championshipYears, currentStanding, careerPoints, raceWins)
    - Create drivers.json in src/data/ with sample F1 driver data including current and historical drivers
    - Include championship information and standings data
    - _Requirements: 1.1, 1.3, 2.1, 3.1, 3.2_
  
  - [x] 2.2 Implement driverService.js
    - Create driverService.js in src/services/
    - Write getDrivers function to fetch driver data from drivers.json
    - Implement sortDriversByStanding utility function
    - Implement filterChampions utility function
    - Implement searchDrivers utility function for filtering by name
    - _Requirements: 1.2, 2.1, 5.2, 5.3_

- [x] 3. Build core UI components
  - [x] 3.1 Create StandingsDisplay component
    - Create StandingsDisplay.jsx in src/components/
    - Implement component to display driver standing position
    - Add position formatting logic (1st, 2nd, 3rd, etc.)
    - Style the standings display with inline or component-level CSS
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 3.2 Create ChampionBadge component
    - Create ChampionBadge.jsx in src/components/
    - Implement component to display champion indicator
    - Add championship years display
    - Style badge to visually distinguish champions with inline or component-level CSS
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 3.3 Create DriverCard component
    - Create DriverCard.jsx in src/components/
    - Implement component to display individual driver information
    - Integrate StandingsDisplay component
    - Integrate ChampionBadge component for world champions
    - Display driver name, nationality, and team
    - Add component-level styling with proper spacing and visual hierarchy
    - _Requirements: 1.3, 2.3, 3.1, 3.2, 3.3, 3.4_

- [x] 4. Implement main application container
  - [x] 4.1 Create DriverList component
    - Create DriverList.jsx in src/components/
    - Implement data fetching using driverService with useEffect hook
    - Add loading state management with loading message display
    - Add error state handling with error message display
    - Render DriverCard components for each driver in the list
    - Handle missing or incomplete driver data gracefully
    - Accept searchQuery prop and filter drivers accordingly
    - _Requirements: 1.1, 1.2, 2.1, 5.2, 5.4_
  
  - [x] 4.2 Update App.jsx as main entry point
    - Replace default Vite template content with F1 Racers App content
    - Integrate DriverList component into App.jsx
    - Add application title "F1 Racers" and header section
    - Remove default Vite logos and counter functionality
    - Ensure single-page application behavior
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Add styling and responsive design
  - [x] 5.1 Add component-specific styles
    - Add styles for DriverCard component (card layout, spacing, borders)
    - Add styles for ChampionBadge component (badge styling, icon, years display)
    - Add styles for StandingsDisplay component (position formatting)
    - Add styles for DriverList component (grid/list layout)
    - _Requirements: 2.3, 3.3_
  
  - [x] 5.2 Update App.css for application layout
    - Replace default Vite styles with F1 Racers App layout styles
    - Implement responsive grid or list layout for driver cards
    - Ensure mobile-friendly design with appropriate breakpoints
    - Add hover effects and transitions for driver cards
    - _Requirements: 2.3, 3.3_
  
  - [x] 5.3 Update index.css for global theme
    - Add F1-themed global styles and color scheme (red, black, white)
    - Update typography for better readability
    - Ensure consistent spacing throughout the app
    - _Requirements: 2.3, 3.3_

- [x] 6. Implement search functionality
  - [x] 6.1 Add searchDrivers function to driverService
    - Implement searchDrivers function in src/services/driverService.js
    - Function should accept drivers array and searchQuery string
    - Perform case-insensitive partial matching against driver names
    - Return filtered array of drivers matching the search query
    - _Requirements: 5.2, 5.3_
  
  - [x] 6.2 Create SearchBox component
    - Create SearchBox.jsx in src/components/
    - Implement controlled input component with onChange handler
    - Add placeholder text "Search drivers..." for user guidance
    - Style search box to match F1 theme with component CSS file
    - _Requirements: 5.1, 5.2_
  
  - [x] 6.3 Update DriverList to accept searchQuery prop
    - Modify DriverList component to accept searchQuery prop
    - Import and use searchDrivers function from driverService
    - Filter drivers based on searchQuery before rendering
    - Ensure all drivers display when searchQuery is empty
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [x] 6.4 Integrate search into App.jsx
    - Add search state management in App.jsx using useState
    - Import and integrate SearchBox component in header section
    - Position SearchBox in top right corner of header using CSS
    - Pass search query state to DriverList component
    - Ensure search updates filter drivers in real-time
    - _Requirements: 5.1, 5.2, 5.4_

- [x] 7. Write component tests
  - Write tests for searchDrivers function in driverService
  - Write tests for SearchBox component interactions
  - Write tests for DriverList filtering with search query
  - _Requirements: 5.2_

- [x] 8. Create Docker configuration
  - [x] 8.1 Create Dockerfile with multi-stage build
    - Create Dockerfile in project root
    - Implement build stage using node:18-alpine base image
    - Copy package files and run npm ci for dependency installation
    - Copy source files and run npm run build
    - Implement production stage using nginx:alpine base image
    - Copy built assets from build stage to nginx html directory
    - Expose port 80 as default
    - Configure nginx to serve the single-page application correctly
    - _Requirements: 7.1_
  
  - [x] 8.2 Create .dockerignore file
    - Create .dockerignore in project root
    - Add node_modules, dist, .git, and other unnecessary files to exclude from Docker context
    - Optimize Docker build performance by reducing context size
    - _Requirements: 7.1_
  
  - [x] 8.3 Test Docker image locally
    - Build Docker image using docker build command
    - Run container locally and verify application serves correctly
    - Test port mapping and accessibility
    - _Requirements: 7.1, 7.4_

- [x] 9. Create Helm Chart for Kubernetes deployment
  - [x] 9.1 Initialize Helm chart structure
    - Create helm-chart directory in project root
    - Create Chart.yaml with chart metadata (name, version, description)
    - Create values.yaml with default configuration values
    - Create templates directory for Kubernetes manifests
    - _Requirements: 7.2_
  
  - [x] 9.2 Create Kubernetes deployment template
    - Create templates/deployment.yaml
    - Define Deployment resource with configurable replicas
    - Configure container spec with image from values
    - Add configurable port from values.yaml
    - Implement liveness and readiness probes for health checks
    - Set resource limits and requests from values
    - _Requirements: 7.2, 7.3_
  
  - [x] 9.3 Create Kubernetes service template
    - Create templates/service.yaml
    - Define Service resource to expose the application
    - Configure service type (ClusterIP, NodePort, LoadBalancer) from values
    - Map service port to container port with configurability
    - Add selectors to match deployment pods
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [x] 9.4 Create optional ingress template
    - Create templates/ingress.yaml
    - Add conditional rendering based on ingress.enabled value
    - Configure ingress rules for hostname-based routing
    - Add annotations for ingress controller configuration
    - Support TLS configuration if needed
    - _Requirements: 7.4_
  
  - [x] 9.5 Configure values.yaml with all parameters
    - Define image repository and tag parameters
    - Set default service port to 80 with easy modification capability
    - Configure service type with default ClusterIP
    - Set default replica count
    - Define resource limits and requests
    - Add ingress configuration options (enabled: false by default)
    - Document all configurable values with comments
    - _Requirements: 7.2, 7.3_

- [x] 10. Create deployment documentation
  - Create DEPLOYMENT.md file in project root
  - Document Docker build and run commands
  - Document Helm installation and upgrade commands
  - Provide examples for different deployment scenarios (local, cloud)
  - Document how to access the application after deployment
  - Include troubleshooting tips for common deployment issues
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 11. Add driver images feature
  - [x] 11.1 Add imageUrl field to drivers.json
    - Update drivers.json to include imageUrl field for each driver
    - Use copyright-free image URLs from sources like Wikimedia Commons with creative commons licenses
    - Ensure URLs point to valid driver photos
    - Add placeholder URL value for drivers without available images
    - _Requirements: 6.1, 6.2_
  
  - [x] 11.2 Update DriverCard component to display images
    - Modify DriverCard.jsx to accept and display imageUrl from driver prop
    - Add img element to render driver picture
    - Implement error handling for failed image loads using onError event
    - Display placeholder image when imageUrl is missing or fails to load
    - Optimize image layout to avoid cluttering the interface
    - _Requirements: 6.1, 6.3, 6.4_
  
  - [x] 11.3 Add image styling to DriverCard.css
    - Add CSS styles for driver image display (sizing, positioning, border-radius)
    - Style placeholder image appropriately
    - Ensure responsive image sizing for different screen sizes
    - Add proper spacing between image and other card content
    - _Requirements: 6.3_

- [x] 12. Replace placeholder images with actual copyright-free driver photos
  - [x] 12.1 Research and collect copyright-free driver images
    - Find copyright-free images for each driver from Wikimedia Commons or similar sources
    - Verify images have appropriate Creative Commons licenses (CC0, CC-BY, CC-BY-SA)
    - Document image sources and license information
    - Prioritize current drivers, then historical champions
    - _Requirements: 6.2_
  
  - [x] 12.2 Update drivers.json with actual image URLs
    - Replace placeholder URLs with actual copyright-free image URLs
    - Ensure all URLs are publicly accessible and stable
    - Test each URL to verify images load correctly
    - Keep placeholder URL for any drivers where suitable images cannot be found
    - _Requirements: 6.1, 6.2, 6.4_

- [x] 13. Enhance UI with modern styling and animations
  - [x] 13.1 Create detailed placeholder SVG image
    - Design SVG illustration of F1 driver with racing cap
    - Add red racing cap with gradient and details
    - Include racing suit with team colors and details
    - Add realistic facial features and proportions
    - Apply dark gradient background
    - _Requirements: 6.4, 9.5_
  
  - [x] 13.2 Enhance DriverCard styling with gradients and effects
    - Apply gradient backgrounds to driver cards
    - Add multiple shadow layers for depth
    - Implement glow effects on hover with red accent
    - Add shine animation sweep across cards
    - Apply smooth cubic-bezier transitions
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [x] 13.3 Enhance ChampionBadge with animations
    - Apply gold gradient background
    - Add animated shine effect across badge
    - Implement pulsing trophy icon animation
    - Add scale transformation on hover
    - Apply multiple shadow layers for 3D effect
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 13.4 Enhance StandingsDisplay with effects
    - Apply red gradient background
    - Add shine animation on hover
    - Implement scale transformation on hover
    - Add text shadows for depth
    - Apply smooth transitions
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [x] 13.5 Enhance SearchBox with integrated icon and effects
    - Add search icon (🔍) inside input field
    - Apply gradient background matching card style
    - Implement focus state with red glow effect
    - Add lift effect on focus
    - Apply smooth border color transitions
    - _Requirements: 9.2, 9.3, 9.5, 9.6_
  
  - [x] 13.6 Enhance App header with animations
    - Apply red gradient background
    - Add animated shine effect across header
    - Implement glowing title animation
    - Add backdrop blur effect
    - Ensure sticky positioning
    - _Requirements: 9.1, 9.3, 9.4, 9.5_
  
  - [x] 13.7 Update global styles with enhanced theme
    - Apply gradient background to body with radial accents
    - Enhance button styles with ripple effect animation
    - Update scrollbar styling with F1 colors
    - Ensure consistent F1 color scheme throughout
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [x] 14. Implement compact/expanded driver card interaction
  - [x] 14.1 Restructure DriverCard component layout
    - Create compact view section with image, name, and standings
    - Create expanded view section with additional details
    - Center align all compact view elements
    - Set compact view to always visible with z-index layering
    - _Requirements: 8.1, 8.4_
  
  - [x] 14.2 Implement hover expansion animation
    - Hide expanded view by default with opacity 0 and max-height 0
    - Reveal expanded view on hover with opacity and height transitions
    - Apply translateY transform for smooth appearance
    - Use 0.5s cubic-bezier timing for all transitions
    - Expand card height from 320px to 480px on hover
    - _Requirements: 8.2, 8.3_
  
  - [x] 14.3 Add hover effects to compact view elements
    - Scale and color change driver name on hover
    - Add glow effect to driver image on hover
    - Maintain standings display visibility
    - Apply smooth transitions to all elements
    - _Requirements: 8.2, 8.3, 9.2_
  
  - [x] 14.4 Move champion badge to expanded view only
    - Remove champion badge from compact view
    - Display champion badge only in expanded hover state
    - Ensure smooth fade-in with expanded content
    - _Requirements: 8.5_
  
  - [x] 14.5 Add responsive sizing for compact/expanded states
    - Adjust image sizes for tablet (120px) and mobile (100px)
    - Set appropriate card heights for different screen sizes
    - Scale font sizes appropriately for smaller screens
    - Maintain smooth transitions across all breakpoints
    - _Requirements: 8.3, 9.7_

- [x] 15. Optimize card layout for 4 cards per row
  - [x] 15.1 Update grid layout to display 4 cards per row
    - Change DriverList grid from auto-fill to fixed 4 columns
    - Update grid-template-columns to `repeat(4, 1fr)`
    - Add responsive breakpoint for 3 columns (1025-1400px)
    - Maintain existing tablet (2 columns) and mobile (1 column) breakpoints
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 15.2 Reduce card sizes for compact layout
    - Reduce driver image from 150px to 110px
    - Reduce card padding from 1.5rem to 1rem
    - Reduce compact card height from 320px to 260px
    - Reduce expanded card height from 480px to 400px
    - Adjust font sizes proportionally (name: 1.1rem, hover: 1.25rem)
    - Reduce spacing and gaps throughout card
    - _Requirements: 10.1, 10.5_
  
  - [x] 15.3 Update responsive breakpoints for smaller cards
    - Adjust tablet sizes (image: 100px, heights: 240px/380px)
    - Adjust mobile sizes (image: 90px, heights: 220px/360px)
    - Scale all font sizes and spacing proportionally
    - Update glow effect sizes to match smaller images
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [x] 16. Implement row-based scroll adjustment on hover
  - [x] 16.1 Add row detection logic
    - Get parent grid container from hovered card
    - Calculate cards per row based on viewport width
    - Determine which row the hovered card belongs to
    - Identify first and last cards in the same row
    - _Requirements: 11.1_
  
  - [x] 16.2 Implement viewport and header calculations
    - Detect sticky header height dynamically
    - Calculate available viewport space excluding header
    - Add 20px padding at top and bottom for visual comfort
    - Determine if expanded row fits in available viewport
    - _Requirements: 11.3, 11.5_
  
  - [x] 16.3 Add intelligent scroll decision logic
    - Check if row top is below header with padding
    - Check if row bottom is within viewport with padding
    - Only trigger scroll if row is not fully visible
    - Calculate optimal scroll position for best visibility
    - _Requirements: 11.2, 11.3_
  
  - [x] 16.4 Implement smooth scrolling behavior
    - Use window.scrollTo with smooth behavior when row fits
    - Use scrollIntoView for rows that don't fit in viewport
    - Apply 100ms delay to allow expansion animation to start
    - Ensure smooth, non-jarring scroll experience
    - _Requirements: 11.2, 11.4, 11.6_
  
  - [x] 16.5 Test row scrolling across responsive breakpoints
    - Verify 4-card row scrolling on desktop (>1400px)
    - Verify 3-card row scrolling on medium screens (1025-1400px)
    - Verify 2-card row scrolling on tablets (769-1024px)
    - Verify single card behavior on mobile (≤768px)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
