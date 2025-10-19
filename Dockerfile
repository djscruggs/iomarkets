# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=24.7.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="React Router"

# React Router app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules and SQLite
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 sqlite3

# Install node modules
COPY package-lock.json package.json ./
RUN npm ci --include=dev

# Copy application code
COPY . .

# Accept build arguments for environment variables
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

# Install SQLite3 runtime and ca-certificates (needed for GCP API calls)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y sqlite3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy built application from build stage
COPY --from=build /app /app

# Create directory for Google Cloud credentials
RUN mkdir -p /app/credentials

# Copy and set permissions for startup script
COPY scripts/startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "/app/startup.sh" ]
