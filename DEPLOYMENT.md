# F1 Racers App - Deployment Guide

This guide provides comprehensive instructions for deploying the F1 Racers App using Docker and Kubernetes (via Helm).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
  - [Building the Docker Image](#building-the-docker-image)
  - [Running the Container Locally](#running-the-container-locally)
  - [Pushing to a Container Registry](#pushing-to-a-container-registry)
- [Kubernetes Deployment with Helm](#kubernetes-deployment-with-helm)
  - [Installing the Application](#installing-the-application)
  - [Upgrading the Application](#upgrading-the-application)
  - [Uninstalling the Application](#uninstalling-the-application)
- [Deployment Scenarios](#deployment-scenarios)
  - [Local Development with Docker](#local-development-with-docker)
  - [Local Kubernetes (Minikube/Kind)](#local-kubernetes-minikubekind)
  - [Cloud Deployment (AWS/Azure/GCP)](#cloud-deployment-awsazuregcp)
- [Accessing the Application](#accessing-the-application)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For Docker Deployment
- Docker installed (version 20.10 or higher)
- Docker daemon running

### For Kubernetes Deployment
- Kubernetes cluster (local or cloud)
- kubectl installed and configured
- Helm 3.x installed
- Access to a container registry (Docker Hub, ACR, ECR, GCR, etc.)

---

## Docker Deployment

### Building the Docker Image

Navigate to the project root directory and build the Docker image:

```bash
cd f1-racers-app
docker build -t f1-racers-app:latest .
```

To build with a specific version tag:

```bash
docker build -t f1-racers-app:1.0.0 .
```

### Running the Container Locally

Run the container and map it to port 8080 on your local machine:

```bash
docker run -d -p 8080:80 --name f1-racers f1-racers-app:latest
```

The application will be accessible at `http://localhost:8080`

To run on a different port (e.g., 3000):

```bash
docker run -d -p 3000:80 --name f1-racers f1-racers-app:latest
```

To stop the container:

```bash
docker stop f1-racers
```

To remove the container:

```bash
docker rm f1-racers
```

### Pushing to a Container Registry

#### Docker Hub

```bash
# Tag the image
docker tag f1-racers-app:latest <your-dockerhub-username>/f1-racers-app:latest

# Login to Docker Hub
docker login

# Push the image
docker push <your-dockerhub-username>/f1-racers-app:latest
```

#### Azure Container Registry (ACR)

```bash
# Login to ACR
az acr login --name <your-registry-name>

# Tag the image
docker tag f1-racers-app:latest <your-registry-name>.azurecr.io/f1-racers-app:latest

# Push the image
docker push <your-registry-name>.azurecr.io/f1-racers-app:latest
```

#### AWS Elastic Container Registry (ECR)

```bash
# Login to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Tag the image
docker tag f1-racers-app:latest <account-id>.dkr.ecr.<region>.amazonaws.com/f1-racers-app:latest

# Push the image
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/f1-racers-app:latest
```

---

## Kubernetes Deployment with Helm

### Installing the Application

#### Basic Installation

Install the application with default values:

```bash
cd f1-racers-app
helm install f1-racers ./helm-chart
```

#### Installation with Custom Values

Install with a custom image from your registry:

```bash
helm install f1-racers ./helm-chart \
  --set image.repository=<your-registry>/f1-racers-app \
  --set image.tag=1.0.0
```

Install with custom port and replica count:

```bash
helm install f1-racers ./helm-chart \
  --set service.port=8080 \
  --set replicaCount=3
```

#### Installation with LoadBalancer Service

For cloud deployments with external access:

```bash
helm install f1-racers ./helm-chart \
  --set service.type=LoadBalancer \
  --set image.repository=<your-registry>/f1-racers-app
```

#### Installation with Ingress

Enable ingress for hostname-based routing:

```bash
helm install f1-racers ./helm-chart \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=f1-racers.example.com \
  --set ingress.className=nginx \
  --set image.repository=<your-registry>/f1-racers-app
```

#### Installation with Custom Values File

Create a custom values file (e.g., `production-values.yaml`):

```yaml
replicaCount: 3

image:
  repository: myregistry.azurecr.io/f1-racers-app
  tag: "1.0.0"

service:
  type: LoadBalancer
  port: 80

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: f1-racers.example.com
      paths:
        - path: /
          pathType: Prefix
```

Install using the custom values file:

```bash
helm install f1-racers ./helm-chart -f production-values.yaml
```

### Upgrading the Application

Upgrade to a new image version:

```bash
helm upgrade f1-racers ./helm-chart \
  --set image.tag=1.1.0
```

Upgrade with a new values file:

```bash
helm upgrade f1-racers ./helm-chart -f production-values.yaml
```

Upgrade and force pod recreation:

```bash
helm upgrade f1-racers ./helm-chart --force
```

### Uninstalling the Application

Remove the Helm release:

```bash
helm uninstall f1-racers
```

---

## Deployment Scenarios

### Local Development with Docker

Perfect for quick testing and development:

```bash
# Build the image
docker build -t f1-racers-app:dev .

# Run locally
docker run -d -p 8080:80 --name f1-racers-dev f1-racers-app:dev

# Access at http://localhost:8080
```

### Local Kubernetes (Minikube/Kind)

#### Using Minikube

```bash
# Start Minikube
minikube start

# Build image in Minikube's Docker daemon
eval $(minikube docker-env)
docker build -t f1-racers-app:latest .

# Install with Helm
helm install f1-racers ./helm-chart \
  --set image.pullPolicy=Never

# Access via NodePort
minikube service f1-racers --url
```

#### Using Kind

```bash
# Create a Kind cluster
kind create cluster --name f1-racers

# Build and load image into Kind
docker build -t f1-racers-app:latest .
kind load docker-image f1-racers-app:latest --name f1-racers

# Install with Helm
helm install f1-racers ./helm-chart \
  --set image.pullPolicy=Never

# Port forward to access
kubectl port-forward service/f1-racers 8080:80
```

### Cloud Deployment (AWS/Azure/GCP)

#### Azure Kubernetes Service (AKS)

```bash
# Create resource group
az group create --name f1-racers-rg --location eastus

# Create ACR
az acr create --resource-group f1-racers-rg --name <your-acr-name> --sku Basic

# Build and push image
az acr build --registry <your-acr-name> --image f1-racers-app:1.0.0 .

# Create AKS cluster
az aks create --resource-group f1-racers-rg --name f1-racers-aks --node-count 2 --attach-acr <your-acr-name>

# Get credentials
az aks get-credentials --resource-group f1-racers-rg --name f1-racers-aks

# Deploy with Helm
helm install f1-racers ./helm-chart \
  --set image.repository=<your-acr-name>.azurecr.io/f1-racers-app \
  --set image.tag=1.0.0 \
  --set service.type=LoadBalancer
```

#### Amazon EKS

```bash
# Create EKS cluster (using eksctl)
eksctl create cluster --name f1-racers-cluster --region us-west-2 --nodes 2

# Push image to ECR (see Docker section above)

# Deploy with Helm
helm install f1-racers ./helm-chart \
  --set image.repository=<account-id>.dkr.ecr.us-west-2.amazonaws.com/f1-racers-app \
  --set image.tag=1.0.0 \
  --set service.type=LoadBalancer
```

#### Google Kubernetes Engine (GKE)

```bash
# Create GKE cluster
gcloud container clusters create f1-racers-cluster --num-nodes=2 --zone=us-central1-a

# Get credentials
gcloud container clusters get-credentials f1-racers-cluster --zone=us-central1-a

# Push image to GCR
docker tag f1-racers-app:latest gcr.io/<project-id>/f1-racers-app:1.0.0
docker push gcr.io/<project-id>/f1-racers-app:1.0.0

# Deploy with Helm
helm install f1-racers ./helm-chart \
  --set image.repository=gcr.io/<project-id>/f1-racers-app \
  --set image.tag=1.0.0 \
  --set service.type=LoadBalancer
```

---

## Accessing the Application

### Docker (Local)

After running the container:
```
http://localhost:<port>
```

### Kubernetes - ClusterIP (Default)

Port forward to access locally:
```bash
kubectl port-forward service/f1-racers 8080:80
```
Then access at `http://localhost:8080`

### Kubernetes - NodePort

Get the NodePort:
```bash
kubectl get service f1-racers
```

Access via:
```
http://<node-ip>:<node-port>
```

For Minikube:
```bash
minikube service f1-racers --url
```

### Kubernetes - LoadBalancer

Get the external IP:
```bash
kubectl get service f1-racers
```

Wait for EXTERNAL-IP to be assigned, then access via:
```
http://<external-ip>:80
```

### Kubernetes - Ingress

Access via the configured hostname:
```
http://f1-racers.example.com
```

Make sure your DNS is configured to point to the ingress controller's IP address.

---

## Troubleshooting

### Docker Issues

#### Container won't start

Check container logs:
```bash
docker logs f1-racers
```

Check if port is already in use:
```bash
# Windows
netstat -ano | findstr :<port>

# Linux/Mac
lsof -i :<port>
```

#### Image build fails

Ensure you're in the correct directory:
```bash
cd f1-racers-app
ls Dockerfile  # Should exist
```

Clear Docker cache and rebuild:
```bash
docker build --no-cache -t f1-racers-app:latest .
```

#### Cannot access application

Verify container is running:
```bash
docker ps | findstr f1-racers
```

Test from inside the container:
```bash
docker exec -it f1-racers sh
wget -O- http://localhost:80
```

### Kubernetes/Helm Issues

#### Pods not starting

Check pod status:
```bash
kubectl get pods
kubectl describe pod <pod-name>
```

Check pod logs:
```bash
kubectl logs <pod-name>
```

#### Image pull errors

Verify image exists in registry:
```bash
docker pull <image-repository>:<tag>
```

Check if image pull secret is needed:
```bash
kubectl create secret docker-registry regcred \
  --docker-server=<registry-url> \
  --docker-username=<username> \
  --docker-password=<password>
```

Update values.yaml to use the secret:
```yaml
imagePullSecrets:
  - name: regcred
```

#### Service not accessible

Check service endpoints:
```bash
kubectl get endpoints f1-racers
```

Verify service is correctly configured:
```bash
kubectl describe service f1-racers
```

Test connectivity from within cluster:
```bash
kubectl run test-pod --image=busybox --rm -it -- wget -O- http://f1-racers:80
```

#### LoadBalancer external IP pending

For cloud providers, ensure LoadBalancer service is supported and properly configured.

For local clusters (Minikube/Kind), use NodePort or port-forward instead:
```bash
helm upgrade f1-racers ./helm-chart --set service.type=NodePort
```

#### Ingress not working

Verify ingress controller is installed:
```bash
kubectl get pods -n ingress-nginx
```

Check ingress resource:
```bash
kubectl describe ingress f1-racers
```

Verify DNS resolution:
```bash
nslookup f1-racers.example.com
```

For local testing, add entry to hosts file:
```
<ingress-ip> f1-racers.example.com
```

#### Helm installation fails

Check Helm version:
```bash
helm version
```

Validate chart:
```bash
helm lint ./helm-chart
```

Dry run to see what would be installed:
```bash
helm install f1-racers ./helm-chart --dry-run --debug
```

#### Resource limits causing crashes

Check if pods are being OOMKilled:
```bash
kubectl describe pod <pod-name>
```

Increase resource limits in values.yaml:
```yaml
resources:
  limits:
    memory: 512Mi
  requests:
    memory: 256Mi
```

### General Debugging Commands

```bash
# Check all resources
kubectl get all

# View events
kubectl get events --sort-by='.lastTimestamp'

# Check Helm releases
helm list

# Get Helm release values
helm get values f1-racers

# Check cluster nodes
kubectl get nodes

# View cluster info
kubectl cluster-info
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

---

## Support

For issues specific to the F1 Racers App, please check the main README.md or contact the development team.
