const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function createAdminUser() {
  let client;
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    console.log("Connecting to MongoDB...");

    // Get base URI without database name
    let baseUri = process.env.MONGODB_URI.split("/").slice(0, -1).join("/");
    if (!baseUri.endsWith("/")) baseUri += "/";

    client = new MongoClient(baseUri);
    await client.connect();
    console.log("Connected successfully");

    // Create admin user in both databases
    const databases = ["apostrophe", "test"];

    for (const dbName of databases) {
      console.log(`\nWorking with database: ${dbName}`);

      const db = client.db(dbName);

      // Drop all collections in test database
      if (dbName === "test") {
        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
          await db.collection(collection.name).drop();
        }
        console.log("Dropped all collections in test database");
      }

      // First, create the admin user in aposDocs
      const docsCollection = db.collection("aposDocs");

      // Remove existing admin users if any
      const deleteResult = await docsCollection.deleteMany({
        type: "@apostrophecms/user",
      });
      console.log(
        `Removed existing users from ${dbName}:`,
        deleteResult.deletedCount
      );

      // Create admin user with hashed password
      const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || "1111",
        10
      );

      const now = new Date();
      const userId = `@apostrophecms/user:en:${now.getTime()}`;
      const draftId = `@apostrophecms/user:en:draft:${now.getTime()}`;
      const slug = `admin-${dbName}-${now.getTime()}`;

      // Create published version
      const publishedUser = {
        _id: userId,
        type: "@apostrophecms/user",
        title: "admin admin",
        slug: slug,
        username: "admin",
        password: hashedPassword,
        email: "admin@example.com",
        firstName: "admin",
        lastName: "admin",
        archived: false,
        published: true,
        trash: false,
        createdAt: now,
        updatedAt: now,
        submitted: true,
        modified: false,
        aposMode: "published",
        aposLocale: "en",
        aposDocId: "@apostrophecms/user:en",
        titleSortified: "admin admin",
        highestRole: "admin",
        loginCount: 0,
        aposUserRole: "admin",
      };

      // Create draft version
      const draftUser = {
        ...publishedUser,
        _id: draftId,
        aposMode: "draft",
        submitted: false,
      };

      await docsCollection.insertOne(publishedUser);
      await docsCollection.insertOne(draftUser);

      // Verify the users were created
      const count = await docsCollection.countDocuments({
        type: "@apostrophecms/user",
      });
      console.log(`Created admin user documents in ${dbName}:`, count);

      // Create the global doc if it doesn't exist
      const globalDoc = {
        _id: "@apostrophecms/global:en",
        type: "@apostrophecms/global",
        title: "Global",
        slug: `global-${dbName}`,
        published: true,
        trash: false,
        aposLocale: "en",
        aposMode: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await docsCollection.updateOne(
        { _id: "@apostrophecms/global:en" },
        { $set: globalDoc },
        { upsert: true }
      );

      console.log(`Created/updated global doc in ${dbName}`);
    }

    console.log("\nAll operations completed successfully");
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error.message);
      process.exit(1);
    });
}

module.exports = { createAdminUser };
