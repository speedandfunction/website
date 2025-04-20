#!/bin/bash

CONTAINER="apostrophe-mongodb"
EXPORT_DIR="./export"
DB="apostrophe"

collections=(
  "aposDocs"
  "aposFormSubmissions"
  "aposCache"
  "aposAttachments"
)

mkdir -p "$EXPORT_DIR"
docker exec "$CONTAINER" mkdir -p /dump

for collection in "${collections[@]}"
do
  echo "📦 Exporting $collection..."

  docker exec "$CONTAINER" mongoexport \
    --uri="mongodb://mongodb:27017/$DB" \
    --collection "$collection" \
    --out "/dump/${collection}.json" \
    --jsonArray
  docker cp "$CONTAINER:/dump/${collection}.json" "$EXPORT_DIR/${collection}.json"
done
