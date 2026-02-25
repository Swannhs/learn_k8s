# Kubernetes Learning Guide (three-tier-notes)

This guide uses your existing app to learn core Kubernetes concepts.

## What you will learn
- Namespace isolation
- Deployments and Services
- ConfigMap and Secret usage
- Ingress path routing (`/` -> frontend, `/api` -> backend)
- Basic health probes and debugging with `kubectl`

## Prerequisites
- Docker
- `kubectl`
- `minikube`

## 1) Start local cluster
```bash
minikube start
minikube addons enable ingress
```

## 2) Build images for Minikube runtime
From project root (`three-tier-notes/`):

```bash
eval $(minikube docker-env)
docker build -t three-tier-notes-backend:latest ./backend
docker build --build-arg VITE_API_BASE=/api -t three-tier-notes-frontend:k8s ./frontend
```

Why `/api`? The frontend calls `/api/*` and Ingress rewrites that to backend `/` routes.

## 3) Deploy to Kubernetes
```bash
kubectl apply -k k8s
```

Check status:
```bash
kubectl get all -n three-tier-notes
kubectl get ingress -n three-tier-notes
```

## 4) Access app in browser
Get minikube IP:
```bash
minikube ip
```

Add host entry (replace `<MINIKUBE_IP>`):
```bash
echo "<MINIKUBE_IP> notes.local" | sudo tee -a /etc/hosts
```

Open:
- http://notes.local

## 5) Verify API quickly
```bash
curl -H "Host: notes.local" http://$(minikube ip)/api/health
curl -H "Host: notes.local" http://$(minikube ip)/api/notes
```

## 6) Practice core kubectl commands
```bash
kubectl get pods -n three-tier-notes
kubectl describe pod -n three-tier-notes <POD_NAME>
kubectl logs -n three-tier-notes deploy/backend
kubectl logs -n three-tier-notes deploy/frontend
kubectl exec -it -n three-tier-notes deploy/backend -- sh
```

## 7) Update app (rollout practice)
After code changes:
```bash
eval $(minikube docker-env)
docker build -t three-tier-notes-backend:latest ./backend
kubectl rollout restart deploy/backend -n three-tier-notes
kubectl rollout status deploy/backend -n three-tier-notes
```

## 8) Cleanup
```bash
kubectl delete -k k8s
```

## Current architecture notes
- MongoDB currently uses `emptyDir` in `k8s/mongo.yaml` for learning simplicity.
- Data is not persistent across pod recreation.
- In the next step, we can switch MongoDB to persistent storage (`PVC`).
