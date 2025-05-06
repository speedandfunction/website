#!/bin/bash

: "${MONGO_URI:?Environment variable MONGO_URI must be set}"
: "${DB_NAME:?Environment variable DB_NAME must be set}"

EXPORT_DIR="./export"
mkdir -p "$EXPORT_DIR"

COLLECTIONS=$(mongosh "$MONGO_URI" --quiet --eval "db.getSiblingDB('$DB_NAME').getCollectionNames().join('\n')")

for COLLECTION in $COLLECTIONS; do
  echo "Exporting collection: $COLLECTION"
  mongoexport \
    --uri="$MONGO_URI" \
    --db="$DB_NAME" \
    --collection="$COLLECTION" \
    --out="$EXPORT_DIR/$COLLECTION.json"
done

echo "✅ Export completed to $EXPORT_DIR"

