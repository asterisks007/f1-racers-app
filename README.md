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
