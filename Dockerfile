# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS frontend
WORKDIR /app/local-store-frontend
COPY local-store-frontend/package*.json ./
RUN npm ci --no-audit
COPY local-store-frontend/ ./
RUN npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=5000
WORKDIR /app/LocalStore-backend
COPY LocalStore-backend/package*.json ./
RUN npm ci --omit=dev --no-audit
COPY --chown=node:node LocalStore-backend/ ./
COPY --from=frontend --chown=node:node /app/local-store-frontend/build /app/local-store-frontend/build
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "index.js"]
