FROM node:22.14.0-alpine

WORKDIR /app

COPY package*.json .

# Development: Install dependencies and nodemon for live reload
# RUN npm install && npm install -g nodemon
# Production: Install only production dependencies
RUN npm ci --omit=dev

COPY ./src ./src

EXPOSE 3000

# Development: Start app with live reload
# CMD ["npm", "run", "dev"]
# Production: Start the application normally
CMD ["npm", "start"]