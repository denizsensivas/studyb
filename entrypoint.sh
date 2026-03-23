#!/bin/sh

# Push schema to DB (Production simplified)
# Railway DB will be ready before this runs
cd server
npx prisma db push --accept-data-loss

# Start app
node dist/index.js
