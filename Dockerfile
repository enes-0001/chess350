# Production image (SDD §5.3): one container serves the built client and the Socket.IO server.
# Build:  docker build -t chess350 .
# Run:    docker run -p 3000:3000 -e ALLOWED_ORIGINS=https://your.domain chess350

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
# Only the server's runtime dependencies; core is bundled into dist/index.js.
RUN npm ci --omit=dev --workspace @chess350/server --include-workspace-root=false \
  && npm cache clean --force
COPY --from=build /app/packages/server/dist packages/server/dist
COPY --from=build /app/packages/client/dist packages/client/dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/healthz || exit 1
CMD ["node", "packages/server/dist/index.js"]
