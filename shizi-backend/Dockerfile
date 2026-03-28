# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app/shizi-backend

COPY shizi-backend/package.json shizi-backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY shizi-backend/nest-cli.json shizi-backend/tsconfig.json shizi-backend/tsconfig.build.json ./
COPY shizi-backend/src ./src
COPY shizi-backend/scripts ./scripts
COPY resources/data /app/resources/data
RUN pnpm build

# Production stage
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app/shizi-backend

COPY shizi-backend/package.json shizi-backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/shizi-backend/dist ./dist
COPY --from=builder /app/shizi-backend/scripts ./scripts
COPY --from=builder /app/resources/data /app/resources/data

EXPOSE 8000

CMD ["node", "dist/src/main.js"]
