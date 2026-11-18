ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_USER_SERVICE=http://localhost:5000
ARG NEXT_PUBLIC_CHAT_SERVICE=http://localhost:5002
ENV NEXT_PUBLIC_USER_SERVICE=${NEXT_PUBLIC_USER_SERVICE} \
    NEXT_PUBLIC_CHAT_SERVICE=${NEXT_PUBLIC_CHAT_SERVICE}
RUN npm run build && npm prune --omit=dev

FROM ${NODE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
