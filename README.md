# F1 Racers App

A multi-platform application displaying Formula 1 driver standings with champion badges and detailed driver information.

## Platforms

- **Web App** - React web application with Vite
- **Mobile App** - React Native mobile application for iOS and Android

## Features

### Web App
- Display current F1 driver standings
- Show world champion badges with championship years
- Filter drivers by championship status
- Sort drivers by current standing position
- Responsive card-based layout

### Mobile App
- Native iOS and Android experience
- Driver list with search functionality
- Champion badges with championship years
- Detailed driver information screens
- Platform-specific UI (iOS/Material Design)
- Offline support with local storage
- Image caching for performance
- Accessibility features (screen readers, dynamic text)
- Dark mode support

## Prerequisites

### Web App
- Node.js 20.19+ or 22.12+ (required for Vite 7.x)
- npm 9.5.0 or higher

### Mobile App
- Node.js 18+ 
- npm 9.5.0 or higher
- **For Android:**
  - Android Studio with Android SDK
  - Android SDK Platform 34
  - Android SDK Build-Tools 34.0.0
  - Android Emulator or physical device
  - Java 17 (automatically downloaded by Gradle on first build)
- **For iOS:**
  - macOS with Xcode 13+
  - CocoaPods
  - iOS Simulator or physical device

## Getting Started

### Web App

#### 1. Clone the repository

```bash
git clone https://github.com/asterisks007/f1-racers-app.git
cd f1-racers-app
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

#### 4. Build for production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

#### 5. Preview production build

```bash
npm run preview
```

### Mobile App

#### 1. Navigate to mobile directory

```bash
cd mobile
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Set up Android environment (Windows)

```powershell
# Set Android SDK path
$env:ANDROID_HOME = 'C:\Users\YourUsername\AppData\Local\Android\Sdk'

# Or use the setup script
.\setup-android.ps1
```

#### 4. Start Metro bundler

```bash
npm start
```

#### 5. Run on Android

In a new terminal:

```powershell
cd mobile
$env:ANDROID_HOME = 'C:\Users\YourUsername\AppData\Local\Android\Sdk'
npm run android
```

**First build takes 5-10 minutes** (downloads Java 17 and compiles Gradle plugin)
**Subsequent builds take 30-60 seconds**

#### 6. Run on iOS (macOS only)

```bash
cd mobile
npm run ios
```

For detailed mobile setup instructions, see:
- [ACCESSING_THE_APP.md](./ACCESSING_THE_APP.md) - How to access the mobile app
- [BUILD_FIX_SUMMARY.md](./BUILD_FIX_SUMMARY.md) - Build troubleshooting guide
- [mobile/SETUP.md](./mobile/SETUP.md) - Complete mobile setup guide

## Available Scripts

### Web App (root directory)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest

### Mobile App (mobile directory)
- `npm start` - Start Metro bundler
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device (macOS only)
- `npm test` - Run tests with Jest

## Deployment

### Docker Deployment

Build and run the application using Docker:

```bash
# Build the Docker image
docker build -t f1-racers-app:latest .

# Run the container
docker run -d -p 8080:80 --name f1-racers f1-racers-app:latest
```

Access the application at `http://localhost:8080`

### Kubernetes Deployment with Helm

Deploy the F1 Racers app to a Kubernetes cluster using the included Helm chart.

#### Prerequisites

- Kubernetes cluster (Docker Desktop, Minikube, or cloud provider)
- kubectl configured to access your cluster
- Helm 3.x installed
- Docker image built and available

#### Quick Start - Docker Desktop Kubernetes

1. **Enable Kubernetes in Docker Desktop**
   - Open Docker Desktop settings
   - Go to Kubernetes tab
   - Check "Enable Kubernetes"
   - Click "Apply & Restart"

2. **Build the Docker image**
   ```bash
   docker build -t f1-racers-app:latest .
   ```

3. **Deploy with Helm**
   ```bash
   helm install f1-racers ./helm-chart \
     --set image.tag=latest \
     --set image.pullPolicy=IfNotPresent
   ```

4. **Access the application**
   ```bash
   # Port forward to access locally
   kubectl port-forward service/f1-racers-f1-racers-app 8080:80
   ```
   
   Open your browser to `http://localhost:8080`

#### Deployment Options

**Basic installation:**
```bash
helm install f1-racers ./helm-chart --set image.tag=latest
```

**With custom replica count:**
```bash
helm install f1-racers ./helm-chart \
  --set image.tag=latest \
  --set replicaCount=3
```

**With LoadBalancer service (cloud environments):**
```bash
helm install f1-racers ./helm-chart \
  --set image.tag=latest \
  --set service.type=LoadBalancer
```

**With Ingress enabled:**
```bash
helm install f1-racers ./helm-chart \
  --set image.tag=latest \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=f1-racers.example.com \
  --set ingress.className=nginx
```

#### Managing the Deployment

**Check deployment status:**
```bash
kubectl get all
kubectl get pods -l app.kubernetes.io/name=f1-racers-app
```

**View application logs:**
```bash
kubectl logs -l app.kubernetes.io/name=f1-racers-app
```

**Upgrade the deployment:**
```bash
helm upgrade f1-racers ./helm-chart --set image.tag=v2.0.0
```

**Uninstall the application:**
```bash
helm uninstall f1-racers
```

#### Customizing the Deployment

Create a custom values file (e.g., `my-values.yaml`):

```yaml
replicaCount: 2

image:
  repository: f1-racers-app
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

Deploy with custom values:
```bash
helm install f1-racers ./helm-chart -f my-values.yaml
```

For detailed deployment instructions, troubleshooting, and cloud provider-specific guides, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Running Both Apps Simultaneously

You can run both the web and mobile apps at the same time:

### Terminal 1: Web App
```bash
npm run dev
```
Access at: http://localhost:5173

### Terminal 2: Mobile Metro Bundler
```bash
cd mobile
npm start
```
Runs on: http://localhost:8081

### Terminal 3: Mobile App
```powershell
cd mobile
$env:ANDROID_HOME = 'C:\Users\YourUsername\AppData\Local\Android\Sdk'
npm run android
```

This allows you to:
- Compare web vs mobile experience
- Test features across platforms
- Develop for both platforms simultaneously

See [RUNNING_THE_APPS.md](./RUNNING_THE_APPS.md) for detailed instructions.

## Project Structure

```
f1-racers-app/
├── src/                      # Web app source
│   ├── components/           # React components
│   ├── services/             # Business logic
│   ├── data/                 # Static data
│   └── test/                 # Test setup
├── mobile/                   # Mobile app
│   ├── src/
│   │   ├── components/       # React Native components
│   │   ├── screens/          # Screen components
│   │   ├── services/         # Business logic & API
│   │   ├── navigation/       # Navigation setup
│   │   ├── theme/            # Platform-specific themes
│   │   └── utils/            # Utility functions
│   ├── android/              # Android native code
│   └── ios/                  # iOS native code
├── specs/                    # Project documentation
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
├── helm-chart/               # Kubernetes deployment
└── Dockerfile                # Docker configuration
```

## Technologies Used

### Web App
- React 19.2.0
- Vite 7.2.2
- Vitest (testing)
- @testing-library/react (component testing)

### Mobile App
- React Native 0.73.2
- React Navigation 6.x (navigation)
- React Native Paper 5.x (Material Design)
- AsyncStorage (local storage)
- Fast Image (image caching)
- Fast-check (property-based testing)
- Jest & React Native Testing Library (testing)

## Troubleshooting

### Mobile App Build Issues

If you encounter build errors with the mobile app:

1. **"Could not find react-native-gradle-plugin"**
   - This has been fixed in the latest version
   - Ensure `mobile/android/settings.gradle` and `mobile/android/build.gradle` exist
   - Run: `cd mobile && npm install`

2. **First build takes too long**
   - First build takes 5-10 minutes (downloads Java 17, compiles Gradle plugin)
   - Subsequent builds take 30-60 seconds
   - This is normal behavior

3. **Metro bundler port conflict**
   - Kill existing process on port 8081
   - Windows: `netstat -ano | findstr :8081` then `taskkill /PID <PID> /F`

For detailed troubleshooting, see:
- [ACCESSING_THE_APP.md](./ACCESSING_THE_APP.md) - Mobile app access guide
- [BUILD_FIX_SUMMARY.md](./BUILD_FIX_SUMMARY.md) - Build fix documentation

### Web App Issues

1. **Port 5173 already in use**
   - Change port: `npm run dev -- --port 3000`

2. **Build fails**
   - Clear cache: `rm -rf node_modules dist && npm install`

## Documentation

### Project Documentation
See the `specs/` folder for detailed project documentation:
- `requirements.md` - Feature requirements and user stories
- `design.md` - Architecture and design decisions
- `tasks.md` - Implementation task list

### Setup Guides
- [ACCESSING_THE_APP.md](./ACCESSING_THE_APP.md) - How to access the mobile app
- [BUILD_FIX_SUMMARY.md](./BUILD_FIX_SUMMARY.md) - Mobile build troubleshooting
- [RUNNING_THE_APPS.md](./RUNNING_THE_APPS.md) - Running web and mobile apps
- [mobile/SETUP.md](./mobile/SETUP.md) - Complete mobile setup guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
