FROM node:23-alpine

# Create app directory and set permissions
WORKDIR /app

# Install dependencies needed for health checks
RUN apk add --no-cache wget

# Create a non-root user and group 
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files for efficient caching
COPY website/package.json website/package-lock.json* ./

# Install dependencies with specific flags for production
RUN npm ci && \
    # Clean npm cache to reduce image size
    npm cache clean --force

# Copy the rest of the application
COPY website/ ./

# Set proper ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Define a health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"] 