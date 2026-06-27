FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN chown -R node:node /app
USER node
EXPOSE 5000
CMD ["node", "server.js"]

