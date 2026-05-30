FROM node:18

WORKDIR /

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "/public/server.js"]
