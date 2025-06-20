#!/bin/bash
set -e

# Read secrets from files if they exist
if [ -f /run/secrets/db_password ]; then
    export DB_PASSWORD=$(cat /run/secrets/db_password)
fi

if [ -f /run/secrets/redis_password ]; then
    export REDIS_PASSWORD=$(cat /run/secrets/redis_password)
fi

if [ -f /run/secrets/jwt_secret ]; then
    export JWT_SECRET=$(cat /run/secrets/jwt_secret)
fi

if [ -f /run/secrets/stripe_secret_key ]; then
    export STRIPE_SECRET_KEY=$(cat /run/secrets/stripe_secret_key)
fi

# Update DATABASE_URL with actual password
if [ -n "$DB_PASSWORD" ]; then
    export DATABASE_URL="postgresql://ballarat_user:${DB_PASSWORD}@db:5432/ballarat_tools?schema=public"
fi

# Update REDIS_URL with actual password
if [ -n "$REDIS_PASSWORD" ]; then
    export REDIS_URL="redis://:${REDIS_PASSWORD}@redis:6379"
fi

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed or no migrations to run"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate || echo "Client generation failed"

# Start the application
echo "Starting application..."
if [ "$1" = "node" ] && [ "$2" = "dist/server.js" ]; then
    # If running the main application, ensure it's available
    if [ ! -f "dist/server.js" ]; then
        echo "Error: dist/server.js not found. TypeScript compilation may have failed."
        exit 1
    fi
fi
exec "$@"