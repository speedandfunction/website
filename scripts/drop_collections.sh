#!/bin/bash

# MongoDB connection details
MONGO_URI="mongodb://mongo:GkkZwYXEFAuaXvkCypSziFJgGLBoAJdg@switchyard.proxy.rlwy.net:13276/?authSource=admin"
DB_NAME="test"

echo "Dropping all collections in database: $DB_NAME"

# Create a temporary JavaScript file to execute in the mongo shell
cat > /tmp/drop_collections.js << EOF
db = db.getSiblingDB("$DB_NAME");
db.getCollectionNames().forEach(function(collName) {
  if (!collName.startsWith("system.")) {
    print("Dropping collection: " + collName);
    db[collName].drop();
  }
});
print("All collections dropped successfully");
EOF

# Run the script using docker
docker run --rm -v /tmp/drop_collections.js:/tmp/drop_collections.js mongo:latest mongosh "$MONGO_URI" --quiet --file /tmp/drop_collections.js

# Clean up temporary file
rm /tmp/drop_collections.js

echo "Operation completed" 