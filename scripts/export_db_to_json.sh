#!/bin/bash
set -euo pipefail

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

  # Export formatted JSON by default (using --pretty flag internally)
  docker exec "$CONTAINER" mongoexport \
    --uri="mongodb://mongodb:27017/$DB" \
    --collection "$collection" \
    --out "/dump/${collection}.json" \
    --jsonArray \
    --pretty \
    --sort '{"_id": 1}'
  docker cp "$CONTAINER:/dump/${collection}.json" "$EXPORT_DIR/${collection}.json"
done

echo "✅ Export completed successfully! Prettified JSON files are in the $EXPORT_DIR directory."
