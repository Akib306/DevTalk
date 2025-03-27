FROM node:22.14.0-alpine

WORKDIR /app

COPY package*.json .

RUN npm install && npm install -g nodemon

COPY ./src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]