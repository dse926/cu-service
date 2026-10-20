FROM node:20-bookworm-slim AS ui
WORKDIR /ui
COPY package.json package-lock.json ./
COPY src ./src
COPY public ./public
COPY next.config.ts tsconfig.json components.json ./
COPY AGENTS.md* ./
RUN npm ci && NEXT_PUBLIC_BASE_PATH= npm run build

FROM node:20-bookworm-slim AS api
WORKDIR /api
COPY server/package.json server/package-lock.json ./
COPY server/src ./src
COPY server/config ./config
COPY server/tsconfig.json ./
RUN npm ci && npm run build && npm prune --omit=dev

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV MOCK_INTEGRATIONS=true
ENV STATIC_ROOT=/app/out
ENV TEAMS_CONFIG_PATH=/app/data/teams.json
COPY --from=api /api/package.json /api/package-lock.json ./
COPY --from=api /api/node_modules ./node_modules
COPY --from=api /api/dist ./dist
COPY --from=api /api/config ./config
COPY --from=ui /ui/out ./out
RUN mkdir -p /app/data && cp /app/config/teams.json /app/data/teams.json
EXPOSE 8080
CMD ["node", "dist/index.js"]
