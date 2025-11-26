# F1 Racers App

A React application displaying Formula 1 driver standings with champion badges and detailed driver information.

## Features

- Display current F1 driver standings
- Show world champion badges with championship years
- Filter drivers by championship status
- Sort drivers by current standing position
- Responsive card-based layout

## Prerequisites

- Node.js 20.19+ or 22.12+ (required for Vite 7.x)
- npm 9.5.0 or higher

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/asterisks007/f1-racers-app.git
cd f1-racers-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### 4. Build for production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### 5. Preview production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest

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
- Docker image built and available locally or in a container registry

#### Quick Start - Local Development (Docker Desktop Kubernetes)

1. **Enable Kubernetes in Docker Desktop**
   - Open Docker Desktop settings
   - Go to Kubernetes tab
   - Check "Enable Kubernetes"
   - Click "Apply & Restart"

2. **Build the Docker image**
   ```bash
   docker build -t f1-racers-app:latest .
   ```

3. **Deploy with Helm (No additional flags needed!)**
   ```bash
   helm install f1-racers ./helm-chart
   ```
   
   The chart is pre-configured with:
   - Image: `f1-racers-app:latest`
   - Pull Policy: `IfNotPresent` (uses local Docker image)
   - Service Type: `ClusterIP`

4. **Access the application**
   ```bash
   # Port forward to access locally
   kubectl port-forward service/f1-racers-f1-racers-app 8080:80
   ```
   
   Open your browser to `http://localhost:8080`

#### Deployment Options

**Basic installation (uses defaults from values.yaml):**
```bash
helm install f1-racers ./helm-chart
```

**With custom replica count:**
```bash
helm install f1-racers ./helm-chart --set replicaCount=3
```

**With NodePort service (access via node IP):**
```bash
helm install f1-racers ./helm-chart --set service.type=NodePort
```

**With LoadBalancer service (cloud environments):**
```bash
helm install f1-racers ./helm-chart --set service.type=LoadBalancer
```

**With Ingress enabled:**
```bash
helm install f1-racers ./helm-chart \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=f1-racers.example.com \
  --set ingress.className=nginx
```

**For remote container registry (e.g., Docker Hub, ACR, ECR):**
```bash
helm install f1-racers ./helm-chart \
  --set image.repository=myregistry.azurecr.io/f1-racers-app \
  --set image.tag=v1.0.0 \
  --set image.pullPolicy=Always
```

#### Managing the Deployment

**Check deployment status:**
```bash
kubectl get all -l app.kubernetes.io/name=f1-racers-app
kubectl get pods -l app.kubernetes.io/name=f1-racers-app
```

**View application logs:**
```bash
kubectl logs -l app.kubernetes.io/name=f1-racers-app -f
```

**Upgrade the deployment:**
```bash
# After making code changes and rebuilding the Docker image
docker build -t f1-racers-app:latest .

# Restart the deployment to use the new image
kubectl rollout restart deployment f1-racers-f1-racers-app

# Or upgrade via Helm
helm upgrade f1-racers ./helm-chart
```

**Uninstall the application:**
```bash
helm uninstall f1-racers
```

**View Helm release information:**
```bash
helm list
helm status f1-racers
helm get values f1-racers
```

#### Customizing the Deployment

The Helm chart comes with sensible defaults in `helm-chart/values.yaml`:

```yaml
replicaCount: 1

image:
  repository: f1-racers-app
  tag: "latest"
  pullPolicy: IfNotPresent  # Uses local Docker image

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false

resources: {}  # No limits by default
```

**Option 1: Override values with --set flags**
```bash
helm install f1-racers ./helm-chart \
  --set replicaCount=3 \
  --set service.type=LoadBalancer
```

**Option 2: Create a custom values file**

Create `my-values.yaml`:
```yaml
replicaCount: 2

image:
  repository: f1-racers-app
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: NodePort
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

#### Image Pull Policy Guide

- **`IfNotPresent`** (Default): Uses local Docker image if available. Best for local development with Docker Desktop.
- **`Always`**: Always pulls from container registry. Use when deploying from Docker Hub, ACR, ECR, etc.
- **`Never`**: Only uses local images, never pulls. Useful for air-gapped environments.

For detailed deployment instructions, troubleshooting, and cloud provider-specific guides, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Project Structure

```
f1-racers-app/
├── src/
│   ├── components/       # React components
│   │   ├── ChampionBadge.jsx
│   │   ├── DriverCard.jsx
│   │   ├── DriverList.jsx
│   │   └── StandingsDisplay.jsx
│   ├── services/         # Business logic
│   │   └── driverService.js
│   ├── data/            # Static data
│   │   └── drivers.json
│   ├── test/            # Test setup
│   │   └── setup.js
│   ├── App.jsx
│   └── main.jsx
├── specs/               # Project documentation
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
└── package.json
```

## Technologies Used

- React 19.2.0
- Vite 7.2.2
- Vitest (testing)
- @testing-library/react (component testing)

## Documentation

See the `specs/` folder for detailed project documentation:
- `requirements.md` - Feature requirements and user stories
- `design.md` - Architecture and design decisions
- `tasks.md` - Implementation task list
