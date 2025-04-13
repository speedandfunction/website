# Apostrophe CMS Docker Compose Setup

This repository contains a complete Docker Compose setup for Apostrophe CMS with all required services.

## Services

- **Apostrophe CMS**: The main web application
- **MongoDB**: Database for Apostrophe
- **Redis**: Optional caching server for better performance
- **Mongo Express**: Web-based MongoDB admin interface

## Quick Start

1. Clone this repository
2. Start all services with Docker Compose:

```bash
docker-compose up -d
```

3. Access the Apostrophe CMS: http://localhost:3000
4. Access Mongo Express: http://localhost:8081

## Development

For development with hot reloading, use:

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

## Environment Variables

Environment variables are stored in the `.env` file. For production, you should change:

- `SESSION_SECRET`: Set to a secure random string
- `NODE_ENV`: Change to `production`

## Container Management

- **Start containers**: `docker-compose up -d`
- **Stop containers**: `docker-compose down`
- **View logs**: `docker-compose logs -f`
- **Rebuild containers**: `docker-compose up -d --build`

## Data Persistence

MongoDB and Redis data are stored in Docker volumes for persistence between restarts:

- `mongodb_data`
- `redis_data`

To remove all data and start fresh:

```bash
docker-compose down -v
``` 