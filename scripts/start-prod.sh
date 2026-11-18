#!/usr/bin/env bash
# Build and start all services on one host without Docker.
# Requires MongoDB, Redis and RabbitMQ reachable as configured in backend/*/.env.
# Frontend API URLs come from NEXT_PUBLIC_USER_SERVICE / NEXT_PUBLIC_CHAT_SERVICE (env or frontend/.env.local).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p logs

for svc in backend/user backend/chat backend/mail frontend; do
  echo "==> Building $svc"
  (cd "$svc" && npm ci --no-audit --no-fund && npm run build)
done

for svc in backend/user backend/chat backend/mail; do
  name=$(basename "$svc")
  echo "==> Starting $name (logs/$name.log)"
  (cd "$svc" && nohup npm start > "../../logs/$name.log" 2>&1 &)
done

echo "==> Starting frontend on port ${FRONTEND_PORT:-3000} (logs/frontend.log)"
(cd frontend && nohup npm start -- -p "${FRONTEND_PORT:-3000}" > ../logs/frontend.log 2>&1 &)
