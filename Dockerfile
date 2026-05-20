FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first to optimize caching
COPY package*.json ./

RUN npm install

# Copy the rest of your application code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]