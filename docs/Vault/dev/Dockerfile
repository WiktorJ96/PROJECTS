
FROM node:18

WORKDIR /

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]







# FROM node:20-alpine AS deps
# WORKDIR /app
# ENV NODE_ENV=production \
#     npm_config_python=/usr/bin/python3


# RUN apk add --no-cache \
#     python3 make g++ pkgconfig \
#     cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev


# COPY package*.json ./


# RUN --mount=type=cache,target=/root/.npm \
#     npm ci --omit=dev


# FROM node:20-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production


# RUN apk add --no-cache \
#     cairo pango jpeg giflib librsvg


# COPY --from=deps --chown=node:node /app/node_modules ./node_modules
# COPY --chown=node:node . .

# EXPOSE 3000


# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#   CMD wget -q --spider http://localhost:3000/health || exit 1


# USER node

# ENTRYPOINT ["node"]
# CMD ["server.js"]


