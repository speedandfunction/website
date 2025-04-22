#!/bin/bash

CONTAINER="apostrophe-mongodb"
DB="apostrophe"

echo "⚠️  Dropping MongoDB database '$DB' in container '$CONTAINER'..."

docker exec "$CONTAINER" mongosh "mongodb://localhost:27017/$DB" --eval "db.dropDatabase()"

echo "✅ Database '$DB' has been dropped."
