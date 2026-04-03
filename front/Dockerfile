# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Build args — Vite inlines these at build time
ARG VITE_API_URL
ARG VITE_SENTRY_DSN
ARG VITE_PRELAUNCH_ENABLED
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_PRELAUNCH_ENABLED=$VITE_PRELAUNCH_ENABLED
ENV VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=$VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
ENV VITE_PUBLIC_POSTHOG_HOST=$VITE_PUBLIC_POSTHOG_HOST

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production image
FROM nginx:1.25-alpine AS production

RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Use non-root user for security
RUN chown -R nginx:nginx /usr/share/nginx/html \
  && chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -sf http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]