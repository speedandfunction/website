const { MongoClient } = require("mongodb");
require("dotenv").config();

async function importData() {
  const collections = [
    "aposDocs",
    "aposFormSubmissions",
    "aposCache",
    "aposAttachments",
    "aposUsersSafe",
  ];

  try {
    // Read JSON files
    const fs = require("fs");
    const path = require("path");
    const exportDir = path.join(__dirname, "..", "export");

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    console.log("Connected successfully");

    const db = client.db("test");

    for (const collection of collections) {
      const filePath = path.join(exportDir, `${collection}.json`);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        continue;
      }

      console.log(`📥 Reading ${collection}...`);
      const fileContent = fs.readFileSync(filePath, "utf8");

      if (fileContent === "[]" || fileContent.trim() === "") {
        console.log(`⏭️  Skipping ${collection} - empty array`);
        await db
          .collection(collection)
          .drop()
          .catch(() => {});
        continue;
      }

      const data = JSON.parse(fileContent);

      console.log(`🗑️  Dropping existing ${collection} collection...`);
      await db
        .collection(collection)
        .drop()
        .catch(() => {});

      console.log(`📤 Importing ${collection}...`);
      await db.collection(collection).insertMany(data);

      const count = await db.collection(collection).countDocuments();
      console.log(`✅ Imported ${count} documents into ${collection}`);
    }

    await client.close();
    console.log("\n✨ Import completed successfully");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

importData();
