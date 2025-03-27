FROM node:22.14.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Run Vite with host flag for external access
CMD ["npm", "run", "dev", "--", "--host"]