# Apostrophe CMS Docker Compose Setup

This repository contains a complete Docker Compose setup for Apostrophe CMS with all required services.

## Status

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=speedandfunction_website&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=speedandfunction_website)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=speedandfunction_website&metric=bugs)](https://sonarcloud.io/summary/new_code?id=speedandfunction_website)

[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=speedandfunction_website&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=speedandfunction_website)

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=speedandfunction_website&metric=coverage)](https://sonarcloud.io/summary/new_code?id=speedandfunction_website)

[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=speedandfunction_website&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=speedandfunction_website)

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

## End-to-End Testing with Playwright

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

### Running Tests Locally

Before testing, **make sure the app is running at** [http://localhost:3000](http://localhost:3000).

To run the tests for the first time and generate the initial snapshots in the `website/e2e` folder, use:

```bash
npm run test:e2e
```

For future test sessions, this same command will compare the current UI state with the stored snapshots:

```bash
npm run test:e2e
```

If you’ve made intentional UI changes and need to update the snapshots, delete the existing ones in the `website/e2e` folder and rerun the tests:

```bash
npm run test:e2e
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
