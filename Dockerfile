# Multi-stage Docker build for PodcastPro
FROM node:20-alpine AS base

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --frozen-lockfile --omit=dev

# Build the application
FROM base AS builder
WORKDIR /app

# Copy package files and install ALL dependencies (including dev deps for build)
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Set build-time environment variables for frontend
ARG VITE_DEFAULT_USER_ID=single-user
ARG VITE_STORAGE_TYPE=azure
ENV VITE_DEFAULT_USER_ID=$VITE_DEFAULT_USER_ID
ENV VITE_STORAGE_TYPE=$VITE_STORAGE_TYPE

# Build frontend and backend
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install tsx for TypeScript execution
RUN npm install -g tsx

# Create app user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared

# Create audio directory and set permissions
RUN mkdir -p /app/public/audio
RUN chown -R nextjs:nodejs /app/public

USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for production
ENV PORT=3000

# Start the application
CMD ["tsx", "server/index.ts"]
