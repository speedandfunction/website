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

## Get Started

Follow these steps to get the project up and running using Docker Compose:

### Prerequisites

Before you begin, ensure you have met the following requirements:

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/).
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed on your local machine.
- [Node.js](https://nodejs.org/) installed on your local machine.
- [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) installed on your local machine.
- [GitLab CLI](https://docs.gitlab.com/ee/editor_extensions/gitlab_cli/) installed on your local machine. This is required for creating and updating pull requests using Cursor AI.

### Steps

### 1. Clone this repository

```bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
```

### 2. Install dependencies

Navigate to the app directory with `cd website/`, then run:

```bash
npm ci
```

### 3. Start all services with Docker Compose

Return to the repo root with `cd ..`, then run:

```bash
docker compose up -d
```

### 4. Database Management

#### 4.1 Create Admin User

```bash
docker exec -it apostrophe-cms node app @apostrophecms/user:add admin admin
```

#### 4.2 Move your backup file to the project

```bash
mv 'your link to backup file' dump.archive
```

> ⚠️ Don't forget to add `dump.archive` to your `.gitignore`.

#### 4.3 Copy the dump archive to the MongoDB container

```bash
docker cp dump.archive apostrophe-mongodb:/tmp/dump.archive
```

#### 4.4 Drop the existing database

```bash
docker exec -it apostrophe-mongodb mongosh --eval "db.getSiblingDB('apostrophe').dropDatabase()"
```

#### 4.5 Restore the database from the dump

##### For macOS/Linux:

```bash
docker exec -it apostrophe-mongodb mongorestore --archive=/tmp/dump.archive --drop --nsFrom="a3-snf.*" --nsTo="apostrophe.*"
```

##### For Windows:

```bash
docker exec -it apostrophe-mongodb bash
ls -lh /tmp/dump.archive
exit
```

Then run:

```bash
docker exec -it apostrophe-mongodb bash -c "mongorestore --archive=/tmp/dump.archive --drop --nsFrom='a3-snf.*' --nsTo='apostrophe.*'"
```

#### 4.6 Restart Docker Compose

```bash
docker-compose down
docker-compose up -d
```

### 5. Access the Apostrophe CMS

http://localhost:3000/login

### 6. Access Mongo Express

http://localhost:8081

## Development

For development with hot reloading, use:

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

## End-to-End Testing with Playwright

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

### Running Tests Locally

Before testing, **make sure the app is running at** [http://localhost:3000](http://localhost:3000).

To run the end-to-end tests, use the following command:

```bash
npm run test:e2e
```

- On the first run, this generates the initial snapshots in the `website/e2e` folder.

- On subsequent runs, it compares the current UI state with the stored snapshots.

- If you've made intentional UI changes, delete the existing snapshots in `website/e2e` and rerun the `npm run test:e2e` command to update them.

## Environment Variables

Environment variables are stored in the `.env` file. For production, you should change:

- `SESSION_SECRET`: Set to a secure random string
- `NODE_ENV`: Change to `production`

## Container Management

- **Start containers**: `docker-compose up -d`
- **Stop containers**: `docker-compose down`
- **View logs**: `docker-compose logs -f`
- **Rebuild containers**: `docker-compose up -d --build`

## DataBase Management

- **Inport database**: `scripts/import_db_from_json.sh`
- **Export database**: `scripts/export_db_to_json.sh`

For doing these script executable, run

```bash
  chmod +x scripts/setup.sh
  setup.sh
```

## Data Persistence

MongoDB and Redis data are stored in Docker volumes for persistence between restarts:

- `mongodb_data`
- `redis_data`

To remove all data and start fresh:

```bash
docker-compose down -v
```

## Using Cursor AI for Git Operations

### Committing Changes

You can easily commit your changes using Cursor AI by following these steps:

1. Make your changes to the codebase
2. Type "commit changes" in the AI chat
3. Cursor AI will help you create a commit message following our standardized format:
   - A descriptive title (max 120 characters)
   - An empty line
   - A bullet list of specific changes

Example chat message:
```text
commit changes
```

This will trigger Cursor AI to analyze your changes and help you create a properly formatted commit following the rules in `.cursor/rules/commit-changes-rules.mdc`.

### Creating or Updating Pull Requests

To create or update a pull request using Cursor AI:

1. Make sure your changes are committed
2. Type "create pull request" or "update pull request" in the AI chat
3. Cursor AI will help you format a proper PR following our standardized format:
   - A descriptive title (max 120 characters)
   - A bullet list of changes without repeating the title
4. GitLab CLI will be used in the background to create or update the pull request

Example chat message:
```text
create pull request
```

This will trigger Cursor AI to help you create a properly formatted PR, following the rules in `.cursor/rules/pull-request-rules.mdc`.
