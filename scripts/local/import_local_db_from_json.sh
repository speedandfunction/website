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
  
  # First check if file is empty or doesn't exist in container
  if docker exec "$CONTAINER" test ! -s "$IMPORT_FILE"; then
    echo "⏭️  Skipping $collection - empty file"
    docker exec "$CONTAINER" mongosh --quiet --eval "db.getSiblingDB('$DB').${collection}.drop()"
    continue
  fi
  
  # Then check if file only contains empty JSON array
  # Using grep instead of loading whole file into memory
  if docker exec "$CONTAINER" grep -q "^\[\]$" "$IMPORT_FILE"; then
    echo "⏭️  Skipping $collection - empty array"
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
