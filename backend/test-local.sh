#!/bin/bash

# Test backend locally with production environment variables

export DATABASE_URL="postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres"
export JWT_SECRET="globalvoice-jwt-secret-xdun1698-production-key"
export ENCRYPTION_KEY="globalvoice-encryption-xdun1698-prod-key"
export NODE_ENV="production"
export PORT="8080"
export FRONTEND_URL="https://globalvoice-nexus.netlify.app"

echo "Starting backend with production config..."
node src/index.js
