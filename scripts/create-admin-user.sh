#!/bin/bash
set -euo pipefail

echo "Script started"
echo "Checking environment variables..."
echo "MONGO_URI is set: ${MONGO_URI:+yes}"
echo "ADMIN_PASSWORD is set: ${ADMIN_PASSWORD:+yes}"
echo "DB_NAME is set: ${DB_NAME:+yes}"

: "${MONGO_URI:?Environment variable MONGO_URI must be set}"
: "${DB_NAME:?Environment variable DB_NAME must be set}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-1111}"

# Get base URI without query parameters
BASE_URI=$(echo "$MONGO_URI" | sed -E 's/\?.*$//')

# Function to generate bcrypt hash
generate_hash() {
    local password=$1
    # Generate salt and hash using openssl
    salt=$(openssl rand -base64 16)
    hash=$(echo -n "$password$salt" | openssl dgst -sha512 | sed 's/^.*= //')
    echo "\$2b\$10\$$salt$hash"
}

# Function to create admin user in database
create_admin_in_db() {
    local timestamp=$(date +%s%3N)  # Current timestamp in milliseconds
    local user_id="@apostrophecms/user:en:$timestamp"
    local draft_id="@apostrophecms/user:en:draft:$timestamp"
    local slug="admin-$DB_NAME-$timestamp"
    local now=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")  # Fixed format for ISODate
    local password_hash=$(generate_hash "$ADMIN_PASSWORD")

    echo "Creating admin user in database: $DB_NAME"

    # Drop all collections in database
    echo "Dropping all collections in database"
    mongosh "$BASE_URI/$DB_NAME?authSource=admin" --quiet --eval 'db.getCollectionNames().forEach((c) => db[c].drop());'

    # Delete existing users
    mongosh "$BASE_URI/$DB_NAME?authSource=admin" --quiet --eval 'db.aposUsers.deleteMany({ "type": "@apostrophecms/user" });'

    # Create published user document
    mongosh "$BASE_URI/$DB_NAME?authSource=admin" --quiet <<EOF
        db.aposUsers.insertOne({
            _id: '$user_id',
            type: '@apostrophecms/user',
            title: 'admin admin',
            slug: '$slug',
            username: 'admin',
            password: '$password_hash',
            email: 'admin@example.com',
            firstName: 'admin',
            lastName: 'admin',
            archived: false,
            published: true,
            trash: false,
            createdAt: ISODate('$now'),
            updatedAt: ISODate('$now'),
            submitted: true,
            modified: false,
            aposMode: 'published',
            aposLocale: 'en',
            aposDocId: '@apostrophecms/user:en',
            titleSortified: 'admin admin',
            highestRole: 'admin',
            loginCount: 0,
            aposUserRole: 'admin'
        });
EOF

    # Create draft user document
    mongosh "$BASE_URI/$DB_NAME?authSource=admin" --quiet <<EOF
        db.aposUsers.insertOne({
            _id: '$draft_id',
            type: '@apostrophecms/user',
            title: 'admin admin',
            slug: '$slug',
            username: 'admin',
            password: '$password_hash',
            email: 'admin@example.com',
            firstName: 'admin',
            lastName: 'admin',
            archived: false,
            published: true,
            trash: false,
            createdAt: ISODate('$now'),
            updatedAt: ISODate('$now'),
            submitted: false,
            modified: false,
            aposMode: 'draft',
            aposLocale: 'en',
            aposDocId: '@apostrophecms/user:en',
            titleSortified: 'admin admin',
            highestRole: 'admin',
            loginCount: 0,
            aposUserRole: 'admin'
        });
EOF

    echo "Created admin user in database: $DB_NAME"
}

# Main script
echo "Connecting to MongoDB..."

# Test connection
if ! mongosh "$MONGO_URI" --quiet --eval "db.runCommand({ ping: 1 })"; then
    echo "Failed to connect to MongoDB"
    exit 1
fi

echo "Connected successfully"

# Create admin user in database
create_admin_in_db

echo "All operations completed successfully" 