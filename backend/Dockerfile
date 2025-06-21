# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY docker-entrypoint.sh ./docker-entrypoint.sh

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install system dependencies  
RUN apk add --no-cache dumb-init openssl openssl-dev

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nodejs:nodejs prisma/ ./prisma/
COPY --from=builder --chown=nodejs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh

# Make entrypoint script executable and fix permissions
USER root
RUN chmod +x ./docker-entrypoint.sh && \
    mkdir -p logs uploads && \
    chown -R nodejs:nodejs logs uploads ./docker-entrypoint.sh node_modules && \
    chmod -R 755 node_modules
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 8000, path: '/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Start application
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["dumb-init", "node", "dist/server.js"]