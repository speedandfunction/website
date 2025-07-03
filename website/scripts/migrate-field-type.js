const { MongoClient } = require('mongodb');
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

const stripHtml = (html) => {
  if (typeof html !== 'string') return '';
  let temp = html;
  while (temp.includes('<p') || temp.includes('<span')) {
    const startP = temp.indexOf('<p');
    const startSpan = temp.indexOf('<span');
    let start = -1;
    if (startP !== -1 && (startSpan === -1 || startP < startSpan)) {
      start = startP;
    } else if (startSpan !== -1) {
      start = startSpan;
    }
    if (start === -1) break;
    const end = temp.indexOf('>', start);
    if (end === -1) break;
    temp = temp.slice(0, start) + temp.slice(end + 1);
  }
  temp = temp.replaceAll('</p>', '').replaceAll('</span>', '');
  return temp;
};

const areaToString = (areaData) => {
  if (typeof areaData === 'string') return stripHtml(areaData);
  if (areaData && areaData.items && areaData.items.length > 0) {
    return areaData.items
      .map(function (item) {
        if (typeof item.content === 'string') {
          return stripHtml(item.content);
        }
        return '';
      })
      .join(' ')
      .trim();
  }
  return '';
};

const getCollection = async () => {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection('aposDocs');
  return { client, collection };
};

const updateTestimonialFeedback = async function (collection, doc, idKey) {
  if (
    typeof doc.feedback !== 'string' &&
    doc.feedback &&
    typeof doc.feedback === 'object'
  ) {
    const fixedFeedback = areaToString(doc.feedback);
    if (typeof fixedFeedback === 'string' && fixedFeedback !== doc.feedback) {
      await collection.updateOne(
        { [idKey]: doc[idKey] },
        { $set: { feedback: fixedFeedback } },
      );
      return 1;
    }
  }
  return 0;
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

const updateTableRowsDescriptions = async (collection, doc, idKey) => {
  let changed = false;
  if (doc.main?.items && Array.isArray(doc.main.items)) {
    const newItems = doc.main.items.map((widget) => {
      if (widget.type === 'table' && Array.isArray(widget.rows)) {
        const newRows = widget.rows.map((row) => {
          if (
            row &&
            typeof row.description === 'object' &&
            row.description !== null &&
            row.description.items
          ) {
            changed = true;
            return { ...row, description: areaToString(row.description) };
          }
          return row;
        });
        return { ...widget, rows: newRows };
      }
      return widget;
    });
    if (changed) {
      await collection.updateOne(
        { [idKey]: doc[idKey] },
        { $set: { 'main.items': newItems } },
      );
      return 1;
    }
  }
  return 0;
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
