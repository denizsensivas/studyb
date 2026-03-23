# Stage 1: Build Frontend
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npx prisma generate && npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Copy essential files for server
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma/

# Install ONLY production dependencies and generate prisma client
RUN cd server && npm install --omit=dev && npx prisma generate

# Copy built assets from builder stages
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Copy static backend assets
COPY server/sounds ./server/sounds

# Set environment variables
ENV NODE_ENV=production

# Copy and set entrypoint
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
