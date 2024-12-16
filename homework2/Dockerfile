FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 6767

CMD ["node", "app.js"]