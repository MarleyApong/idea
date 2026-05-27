#!/bin/sh
set -e

echo "DATABASE_URL=${DATABASE_URL}"
echo "AUTH_SECRET=${AUTH_SECRET:+SET}"
echo "AUTH_URL=${AUTH_URL}"
echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:+SET}"
echo "GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID:+SET}"
echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting Next.js..."
exec node server.js
