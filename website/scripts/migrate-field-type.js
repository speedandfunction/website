const { MongoClient } = require('mongodb');
const {
  stripHtml,
  areaToString,
  updateTestimonialFeedback,
  updateTableRowsDescriptions,
} = require('./migrate-field-type.utils');

const getCollection = async (
  mongoUri = 'mongodb://localhost:27017',
  dbName = 'test',
) => {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection('aposDocs');
  return { client, collection };
};

const processBatches = async (
  batches,
  idKey,
  collection,
  updateFn = updateTestimonialFeedback,
) => {
  let updatedCount = 0;
  const allPromises = [];
  for (const batch of batches) {
    allPromises.push(...batch.map((doc) => updateFn(collection, doc, idKey)));
  }
  const results = await Promise.all(allPromises);
  updatedCount = results.reduce((sum, value) => sum + value, 0);
  return updatedCount;
};

const migrateTestimonialFeedbackToString = async (mongoUri, dbName) => {
  const { client, collection } = await getCollection(mongoUri, dbName);
  try {
    const documents = await collection.find({ type: 'testimonials' }).toArray();
    const idKey = '_id';
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < documents.length; i += batchSize) {
      batches.push(documents.slice(i, i + batchSize));
    }
    const updatedCount = await processBatches(batches, idKey, collection);
    return updatedCount;
  } finally {
    await client.close();
  }
};

const migrateTableDescriptions = async (mongoUri, dbName) => {
  const { client, collection } = await getCollection(mongoUri, dbName);
  try {
    const docs = await collection
      .find({ 'main.items.type': 'table' })
      .toArray();
    const idKey = '_id';
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < docs.length; i += batchSize) {
      batches.push(docs.slice(i, i + batchSize));
    }
    const updatedCount = await processBatches(
      batches,
      idKey,
      collection,
      updateTableRowsDescriptions,
    );
    return updatedCount;
  } finally {
    await client.close();
  }
};

if (require.main === module) {
  const yargs = require('yargs/yargs');
  const { hideBin } = require('yargs/helpers');
  const { argv } = yargs(hideBin(process.argv))
    .option('mongoUri', {
      describe: 'MongoDB connection URI',
      type: 'string',
      demandOption: true,
    })
    .option('dbName', {
      describe: 'MongoDB database name',
      type: 'string',
      demandOption: true,
    })
    .help()
    .alias('help', 'h');

  const MONGODB_URI = argv.mongoUri;
  const DB_NAME = argv.dbName;

  (async () => {
    try {
      const testimonials = await migrateTestimonialFeedbackToString(
        MONGODB_URI,
        DB_NAME,
      );
      process.stdout.write(`Updated testimonials: ${testimonials}\n`);
      const tables = await migrateTableDescriptions(MONGODB_URI, DB_NAME);
      process.stdout.write(`Updated table rows: ${tables}\n`);
    } catch (error) {
      process.stdout.write(`Migration error: ${error}\n`);
      throw error;
    }
  })();
}

module.exports = {
  stripHtml,
  areaToString,
  updateTestimonialFeedback,
  updateTableRowsDescriptions,
  getCollection,
  processBatches,
  migrateTestimonialFeedbackToString,
  migrateTableDescriptions,
};
