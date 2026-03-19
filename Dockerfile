<<<<<<< HEAD
FROM node:24-alpine as build
=======
FROM node:24-slim as build
>>>>>>> 4389063392e10317ff55fb313a214346a4c9b131
# Set build arguments with defaults
ARG NODE_ENV=production
ARG NPM_INSTALL_FLAGS=

# Set working directory
WORKDIR /app

# Copy package files
COPY website/package*.json ./

# Install dependencies based on environment and flags
RUN npm install $NPM_INSTALL_FLAGS

# Copy website files
COPY website/ ./

<<<<<<< HEAD
FROM node:24-alpine

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S -G appgroup appuser
=======
FROM node:24-slim

# Create a non-root user and group 
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
>>>>>>> 4389063392e10317ff55fb313a214346a4c9b131

# Copy layer wfrom build image
COPY --chown=appuser:appgroup --from=build /app /app

# Switch to non-root user
USER appuser

# Set working directory
WORKDIR /app

# Expose the port the app runs on
EXPOSE 3000

# # Command to run the application
CMD ["npm", "start"]