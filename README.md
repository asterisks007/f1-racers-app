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
   - Verify cluster is running: `kubectl cluster-info`

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

4. **Verify deployment**
   ```bash
   # Check if pods are running
   kubectl get pods -l app.kubernetes.io/name=f1-racers-app
   
   # Check service status
   kubectl get service f1-racers-f1-racers-app
   ```

5. **Access the application**
   
   The application can be accessed using one of the following methods:
   
   **Method 1: Port Forwarding (Recommended for local development)**
   ```bash
   kubectl port-forward service/f1-racers-f1-racers-app 8080:80
   ```
   Open your browser to `http://localhost:8080`
   
   **Method 2: NodePort (Alternative for local access)**
   ```bash
   # Update service to NodePort
   helm upgrade f1-racers ./helm-chart \
     --set image.tag=latest \
     --set image.pullPolicy=IfNotPresent \
     --set service.type=NodePort
   
   # Get the NodePort
   kubectl get service f1-racers-f1-racers-app
   ```
   Access via `http://localhost:<NODE_PORT>`

#### Deployment Options & Exposure Methods

The application can be exposed for consumption using different service types depending on your environment:

**1. ClusterIP (Default - Internal Access Only)**
```bash
helm install f1-racers ./helm-chart --set image.tag=latest
```
Access via port-forwarding: `kubectl port-forward service/f1-racers-f1-racers-app 8080:80`

**2. NodePort (Local Kubernetes Access)**
```bash
helm install f1-racers ./helm-chart \
  --set image.tag=latest \
  --set service.type=NodePort
```
Access via `http://localhost:<NODE_PORT>` (get port with `kubectl get svc`)

**3. LoadBalancer (Cloud Environments - External Access)**
```bash
helm install f1-racers ./helm-chart \
  --set image.tag=latest \
  --set service.type=LoadBalancer
```
Get external IP: `kubectl get service f1-racers-f1-racers-app`
Access via `http://<EXTERNAL-IP>:80`

**4. Ingress (Domain-Based Access with SSL)**
```bash
# Ensure ingress controller is installed (e.g., nginx-ingress)
helm install f1-racers ./helm-chart \
  --set image.tag=latest \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=f1-racers.example.com \
  --set ingress.className=nginx
```
Access via `http://f1-racers.example.com` (configure DNS to point to ingress controller)

**5. High Availability Deployment**
```bash
helm install f1-racers ./helm-chart \
  --set image.tag=latest \
  --set replicaCount=3 \
  --set service.type=LoadBalancer \
  --set resources.requests.cpu=100m \
  --set resources.requests.memory=128Mi \
  --set resources.limits.cpu=200m \
  --set resources.limits.memory=256Mi
```

#### Managing the Deployment

**Check deployment status:**
```bash
# View all resources
kubectl get all

# Check pod status
kubectl get pods -l app.kubernetes.io/name=f1-racers-app

# Check service and external access
kubectl get service f1-racers-f1-racers-app

# Check ingress (if enabled)
kubectl get ingress
```

**View application logs:**
```bash
# View logs from all pods
kubectl logs -l app.kubernetes.io/name=f1-racers-app

# Follow logs in real-time
kubectl logs -f -l app.kubernetes.io/name=f1-racers-app

# View logs from specific pod
kubectl logs <pod-name>
```

**Test application accessibility:**
```bash
# Test from within cluster
kubectl run test-pod --image=busybox --rm -it -- wget -O- http://f1-racers-f1-racers-app:80

# Test external access (LoadBalancer)
curl http://<EXTERNAL-IP>:80

# Test ingress
curl http://f1-racers.example.com
```

**Upgrade the deployment:**
```bash
# Upgrade to new version
helm upgrade f1-racers ./helm-chart --set image.tag=v2.0.0

# Upgrade with new values file
helm upgrade f1-racers ./helm-chart -f my-values.yaml

# View upgrade history
helm history f1-racers

# Rollback to previous version
helm rollback f1-racers
```

**Scale the deployment:**
```bash
# Scale to 3 replicas
kubectl scale deployment f1-racers-f1-racers-app --replicas=3

# Or via Helm upgrade
helm upgrade f1-racers ./helm-chart --set replicaCount=3
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

#### Quick Reference: Exposing Your Application

| Environment | Service Type | Access Method | Command |
|-------------|--------------|---------------|---------|
| Local Dev (Docker Desktop) | ClusterIP | Port Forward | `kubectl port-forward service/f1-racers-f1-racers-app 8080:80` |
| Local Dev (Minikube) | NodePort | Minikube Service | `minikube service f1-racers-f1-racers-app --url` |
| Cloud (AWS/Azure/GCP) | LoadBalancer | External IP | `kubectl get svc` → Access via EXTERNAL-IP |
| Production | Ingress | Domain Name | Configure DNS → Access via domain |

**Troubleshooting Access Issues:**

```bash
# Check if pods are running
kubectl get pods

# Check service endpoints
kubectl get endpoints f1-racers-f1-racers-app

# Describe service for details
kubectl describe service f1-racers-f1-racers-app

# Test connectivity from within cluster
kubectl run test --image=busybox --rm -it -- wget -O- http://f1-racers-f1-racers-app:80
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
