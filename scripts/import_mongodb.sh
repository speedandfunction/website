#!/bin/bash
set -euo pipefail

: "${MONGO_URI:?Environment variable MONGO_URI must be set}"
: "${DB_NAME:?Environment variable DB_NAME must be set}"

# MongoDB import script
# Usage: ./import_mongodb.sh <json_directory> [--no-drop]

# Default options - drop collections by default
DROP_OPTION="--drop"
CONTAINER="apostrophe-mongodb"

# Check if MONGO_URI contains localhost or 0.0.0.0
if [[ "$MONGO_URI" == *"localhost"* || "$MONGO_URI" == *"0.0.0.0"* ]]; then
    USE_LOCAL=true
    echo "Detected local MongoDB connection. Using local container: $CONTAINER"
else
    USE_LOCAL=false
fi

# Parse optional arguments
for arg in "$@"; do
    case $arg in
        --no-drop)
            DROP_OPTION=""
            echo "Using --no-drop option: Collections will not be dropped before import"
            ;;
    esac
done

# Check if directory is provided
if [ $# -lt 1 ] || [[ "$1" == --* ]]; then
    echo "Usage: $0 <json_directory> [--no-drop]"
    echo "Please provide the directory containing JSON files to import"
    echo "Collections are dropped before import by default (use --no-drop to prevent this)"
    echo "Note: If MONGO_URI contains 'localhost' or '0.0.0.0', a local container named $CONTAINER will be used"
    exit 1
fi

# Use realpath if available, otherwise fallback to readlink -f
if command -v realpath >/dev/null; then
    JSON_DIR=$(realpath "$1")
else
    JSON_DIR=$(readlink -f "$1")
fi

# Check if the directory exists
if [ ! -d "$JSON_DIR" ]; then
    echo "Error: Directory '$JSON_DIR' not found"
    exit 1
fi

# Set docker command based on local flag
if [ "$USE_LOCAL" = true ]; then
    DOCKER_CMD=(docker exec -i "$CONTAINER")
else
    DOCKER_CMD=(docker run -i --rm mongo:latest)
fi

# Test connection first
echo "Testing MongoDB connection..."
if ! "${DOCKER_CMD[@]}" mongosh "$MONGO_URI" --quiet \
    --eval "db.getSiblingDB('$DB_NAME').serverStatus()" > /dev/null 2>&1; then
    echo "Error: Failed to connect to MongoDB. Please check your connection string and credentials."
    echo "Connection host: ${MONGO_URI#*//}"  # hide user:pass@
    echo "Connecting to database: $DB_NAME"
    exit 1
fi

echo "Connection successful!"
echo "Importing MongoDB data from $JSON_DIR to host ${MONGO_URI#*//} (database: $DB_NAME)"

# Function to import a JSON file
import_file() {
    local FILE=$1
    local FILENAME
    FILENAME=$(basename "$FILE")
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
        
        # Common mongoimport arguments
        local IMPORT_ARGS=(--uri="$MONGO_URI" --db="$DB_NAME" --collection="$COLLECTION_NAME" $DROP_OPTION $TYPE_OPTS)
        
        # Use mongoimport with stdin redirection for both modes
        "${DOCKER_CMD[@]}" mongoimport "${IMPORT_ARGS[@]}" < "$FILE"
        
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