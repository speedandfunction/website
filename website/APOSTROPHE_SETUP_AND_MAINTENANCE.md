# Apostrophe CMS Website Setup and Maintenance Guide

## 1. Initial Setup

### Start the Docker containers

```bash
docker compose up -d
```

## 2. Database Management

### Create Admin User

```bash
docker exec -it apostrophe-cms node app @apostrophecms/user:add admin admin
```

### Restore Database from Dump

1. Copy the dump archive to the container:

```bash
docker cp /path/to/dump.archive apostrophe-mongodb:/tmp/dump.archive
```

2. Drop existing database (if needed):

```bash
docker exec -it apostrophe-mongodb mongosh --eval "db.getSiblingDB('apostrophe').dropDatabase()"
```

3. Restore the database with proper namespace mapping:

```bash
docker exec -it apostrophe-mongodb mongorestore --archive=/tmp/dump.archive --drop --nsFrom="a3-snf.*" --nsTo="apostrophe.*" --nsFrom="a3-boilerplate.*" --nsTo="apostrophe.*"
```

## 3. Common Issues and Fixes

### Fixing Form Widget Issues

If you encounter a 500 error with the form widget, check and fix these files:

1. Ensure the form module has the `intro` field in its schema (`website/modules/@apostrophecms/form/index.js`):

```javascript
const headingToolbar = require('../../../lib/headingToolbar');

module.exports = {
  options: {
    fields: {
      add: {
        intro: {
          label: 'Intro',
          type: 'area',
          options: {
            max: 1,
            widgets: {
              '@apostrophecms/rich-text': {
                ...headingToolbar
              }
            }
          }
        }
        // ... other fields
      }
    }
  }
};
```

2. Verify the form widget template (`website/modules/@apostrophecms/form-widget/views/widget.html`) correctly accesses the intro field:

```html
{% if not apos.area.isEmpty(form, 'intro') %} {% area form, 'intro' %} {% endif
%}
```

### Restarting Services

After making changes, restart the Apostrophe container:

```bash
docker compose restart apostrophe
```

## 4. Monitoring and Debugging

### Check Container Logs

```bash
docker logs apostrophe-cms
```

### Check MongoDB Status

```bash
docker exec -it apostrophe-mongodb mongosh --eval "db.runCommand('ping').ok"
```

## 5. Important Notes

1. Always backup your database before making significant changes
2. The form widget requires proper configuration of both the form module and widget template
3. Namespace mapping is crucial when restoring from a dump - ensure the source and target namespaces are correctly specified
4. The admin user creation command should be run only once during initial setup

## 6. Troubleshooting

If you encounter issues:

1. Check the container logs for error messages
2. Verify database connectivity
3. Ensure all required fields are properly configured in the schema
4. Check that the template files are correctly accessing the data

This guide covers the essential steps for setting up and maintaining an Apostrophe CMS website. The commands and configurations have been tested and verified in our setup.
