#!/bin/bash

CONTAINER="apostrophe-mongodb"
IMPORT_DIR="./export"
DB="apostrophe"

collections=(
  "aposDocs"
  "aposFormSubmissions"
  "aposCache"
  "aposAttachments"
)

docker exec "$CONTAINER" mkdir -p /import

for collection in "${collections[@]}"
do
  FILE="${IMPORT_DIR}/${collection}.json"

  if [ -f "$FILE" ]; then
    echo "📥 Copying $collection..."
    docker cp "$FILE" "$CONTAINER:/import/${collection}.json"
  else
    echo "⚠️  File not found: $FILE"
  fi
done

for collection in "${collections[@]}"
do
  echo "🔄 Importing $collection..."

  docker exec "$CONTAINER" mongoimport \
    --uri="mongodb://mongodb:27017/$DB" \
    --collection "$collection" \
    --drop \
    --file "/import/${collection}.json" \
    --jsonArray
done

echo "✅ JSON import complete."
