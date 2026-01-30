FROM node:24-alpine AS build
# Set build arguments with defaults
ARG NODE_ENV=production
ARG NPM_INSTALL_FLAGS=

# Set working directory
WORKDIR /app

# Copy package files
COPY website/package*.json ./

# Install dependencies based on environment and flags
RUN npm ci $NPM_INSTALL_FLAGS

# Copy website files
COPY website/ ./

FROM node:24-alpine

# Set working directory
WORKDIR /app

# Create a non-root user and group 
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install dependencies needed for health checks
RUN apk add --no-cache wget=1.25.0-r2

# Copy layer wfrom build image
COPY --chown=appuser:appgroup --from=build /app /app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 3000

# # Command to run the application
CMD ["npm", "start"]