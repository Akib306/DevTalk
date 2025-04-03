# ------------------------------
# Development Dockerfile (Commented Out)
# ------------------------------
# FROM node:22.14.0-alpine
#
# WORKDIR /app
#
# COPY package*.json ./
#
# RUN npm install
#
# COPY . .
#
# EXPOSE 5173
#
# # Run Vite with host flag for external access
# CMD ["npm", "run", "dev", "--", "--host"]

# ------------------------------
# Production Multi-Stage Build
# ------------------------------

# Stage 1: Build the production assets
FROM node:22.14.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the built assets with NGINX
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
