# Running FileGator on Minikube

The deployment uses a local image and Kubernetes manifests located in this directory.

## Build and load the image

```
cd filegator
# build the container image
docker build -t filegator-local:latest .
# make the image available inside the cluster
minikube image load filegator-local:latest
```

## Apply the manifests

```
kubectl apply -f filegator-configmap.yaml
kubectl apply -f filegator-pvc.yaml
kubectl apply -f filegator-deployment.yaml
```

The service exposes FileGator on NodePort `30080` (HTTP) and `30081`.
