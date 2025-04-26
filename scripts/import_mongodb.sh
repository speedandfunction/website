#!/bin/bash

# MongoDB import script
# Usage: ./import_mongodb.sh <json_directory> [--no-drop]

set -e

# Default options - drop collections by default
DROP_OPTION="--drop"

# Parse optional arguments
if [ "$2" == "--no-drop" ]; then
    DROP_OPTION=""
    echo "Using --no-drop option: Collections will not be dropped before import"
fi

# Check if directory is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <json_directory> [--no-drop]"
    echo "Please provide the directory containing JSON files to import"
    echo "Collections are dropped before import by default (use --no-drop to prevent this)"
    exit 1
fi

JSON_DIR=$(realpath "$1")

# Check if the directory exists
if [ ! -d "$JSON_DIR" ]; then
    echo "Error: Directory '$JSON_DIR' not found"
    exit 1
fi

# Test connection first
echo "Testing MongoDB connection..."
if ! docker run --rm mongo:latest mongosh "$MONGO_URI" --eval "db.serverStatus()" > /dev/null 2>&1; then
    echo "Error: Failed to connect to MongoDB. Please check your connection string and credentials."
    echo "Connection string: $MONGO_URI"
    exit 1
fi

echo "Connection successful!"
echo "Importing MongoDB data from $JSON_DIR to $MONGO_URI (database: $DB_NAME)"

# Function to import a JSON file
import_file() {
    local FILE=$1
    local FILENAME=$(basename "$FILE")
    local COLLECTION_NAME="${FILENAME%.*}"
    
    # Skip empty files
    if [ ! -s "$FILE" ]; then
        echo "Skipping empty file: $FILENAME"
        # Use true command instead of return 0
        true
    else
        echo "Importing $FILENAME to collection $COLLECTION_NAME..."
        
        # Check if the file starts with [ which indicates a JSON array
        local TYPE_OPTS=""
        if grep -q "^\[" "$FILE"; then
            TYPE_OPTS="--jsonArray"
        fi
        
        # Use mongoimport to import the file
        docker run --rm -v "$JSON_DIR:/data" mongo:latest \
            mongoimport --uri="$MONGO_URI" \
            --db="$DB_NAME" \
            --collection="$COLLECTION_NAME" \
            --file="/data/$(basename "$FILE")" \
            $DROP_OPTION \
            $TYPE_OPTS
        
        # Capture exit status directly without return
        # This will propagate to the if statement that calls the function
    fi
}

# Counter for successful imports
SUCCESSFUL_IMPORTS=0

# Import JSON files
for JSON_FILE in "$JSON_DIR"/*.json; do
    if [ -f "$JSON_FILE" ]; then
        if import_file "$JSON_FILE"; then
            ((SUCCESSFUL_IMPORTS++))
        else
            echo "Warning: Failed to import $(basename "$JSON_FILE")"
        fi
    fi
done

if [ $SUCCESSFUL_IMPORTS -gt 0 ]; then
    echo "Import completed successfully: $SUCCESSFUL_IMPORTS JSON files imported"
else
    echo "No JSON files were successfully imported"
    exit 1
fi 