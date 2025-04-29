#!/bin/bash
set -euo pipefail

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
  IMPORT_FILE="/import/${collection}.json"
  
  # Check if the file contains only an empty array
  CONTENT=$(docker exec "$CONTAINER" cat "$IMPORT_FILE")
  if [ "$CONTENT" == "[]" -o "$CONTENT" == "" ]; then
    echo "⏭️  Skipping $collection - empty array"
    
    # Drop the collection if it exists
    docker exec "$CONTAINER" mongosh --quiet --eval "db.getSiblingDB('$DB').${collection}.drop()"
    continue
  fi
  
  echo "🔄 Importing $collection..."

  docker exec "$CONTAINER" mongoimport \
    --uri="mongodb://mongodb:27017/$DB" \
    --collection "$collection" \
    --drop \
    --file "$IMPORT_FILE" \
    --jsonArray
done

echo "✅ JSON import complete."
