# DevTalk - Discussion Platform

A full-stack discussion platform built with React, Node.js, and MySQL.

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed on your system

### Running the Application

1. Clone the repository
2. From the project root directory, run:
   ```
   # For the first time
   docker compose up --build

   # After building the first time 
   docker compose up
   
   ```
3. Wait for all services to start up. The first time this may take a few minutes as Docker needs to build the images.

Once all services are running, you can access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PHPMyAdmin: http://localhost:3307

### Admin Access
The system creates a default admin account with the following credentials:
- Username: Admin
- Password: pass

## Project Structure

- `frontend/` - React application built with Vite
- `backend/` - Node.js Express API
- `docker-compose.yml` - Docker configuration for all services

## Development

To access the container shells for development:
- Frontend: `docker compose exec frontend sh`
- Backend: `docker compose exec backend sh` 

## Demo Video
https://www.youtube.com/watch?v=_ONlaDmpD_Q&ab_channel=Akib
