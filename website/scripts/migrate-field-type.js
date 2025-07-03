const { MongoClient } = require('mongodb');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const {
  stripHtml,
  areaToString,
  updateTestimonialFeedback,
  updateTableRowsDescriptions,
} = require('./migrate-field-type.utils');

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

const getCollection = async () => {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
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

const migrateTestimonialFeedbackToString = async () => {
  const { client, collection } = await getCollection();
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

const migrateTableDescriptions = async () => {
  const { client, collection } = await getCollection();
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
  (async () => {
    try {
      const testimonials = await migrateTestimonialFeedbackToString();
      process.stdout.write(`Updated testimonials: ${testimonials}\n`);
      const tables = await migrateTableDescriptions();
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
};
