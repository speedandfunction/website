FROM node:23-bullseye

# Create app directory and set permissions
WORKDIR /app

# Create a non-root user and group
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy package files for efficient caching
COPY website/ ./

# Set build arguments with defaults
ARG NODE_ENV=production
ARG NPM_INSTALL_FLAGS=

# Install dependencies based on environment and flags
RUN npm ci $NPM_INSTALL_FLAGS && \
# Clean npm cache to reduce image size
npm cache clean --force


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