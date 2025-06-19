# Ticketing System

This repository contains a simple ticketing system consisting of:

- **Backend API** – Spring Boot application located in `api`
- **Frontend UI** – React application located in `ui`
- **Typesense** – search engine container in `Typesense API`
- **FileGator** – file manager container (`docker-compose.yml`)
- **Database dump** – MySQL dump in `db/ticketing_system_dump.sql`

The following instructions show how to run all components on a Windows machine using WSL (Windows Subsystem for Linux) without Docker Desktop.

## Prerequisites

1. **WSL2** installed and a Linux distribution (Ubuntu is recommended).
2. **Docker Engine** installed inside WSL.
   - Install with `sudo apt update && sudo apt install docker.io docker-compose -y`.
   - Start Docker with `sudo service docker start` and optionally add your user to the `docker` group (`sudo usermod -aG docker $USER`).
3. **Java 17** for the backend (`sudo apt install openjdk-17-jdk`).
4. **Node.js 18** or newer for the frontend (`sudo apt install nodejs npm`).
5. **MySQL** server running on `localhost:3306`.

## Database Setup

1. Create a database named `ticketing_system` in MySQL.
2. Import the SQL dump:
   ```bash
   mysql -u root -p ticketing_system < db/ticketing_system_dump.sql
   ```

## Starting Services

### 1. Typesense

Typesense is configured with the API key `xyz123` and listens on port `8108`.

```bash
cd "Typesense API"
docker-compose up -d
```

### 2. FileGator

FileGator runs on port `8080`. Create the `files` directory for storage and start the container from the repository root:

```bash
mkdir -p files
# from the repository root
docker-compose up -d
```

Access FileGator at [http://localhost:8080](http://localhost:8080).

### 3. Backend API

The Spring Boot application listens on port `8081` and expects MySQL and Typesense to be running.

```bash
cd api
./gradlew bootRun
```

### 4. Frontend UI

The React app runs on port `3000` and communicates with the backend on `http://localhost:8081`.

```bash
cd ui
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Summary

1. Import the MySQL dump.
2. Run Typesense and FileGator using Docker (from WSL).
3. Start the Spring Boot backend.
4. Start the React frontend.

With these components running, you can access the UI at `http://localhost:3000`, the backend at `http://localhost:8081`, FileGator at `http://localhost:8080`, and Typesense at `http://localhost:8108`.

