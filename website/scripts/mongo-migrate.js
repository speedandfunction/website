
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const dotenv = require('dotenv');

const BATCH_SIZE = 1000;

const parseArguments = () => {
  const args = process.argv.slice(2);
  const options = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--env=')) options.envPath = arg.split('=')[1];
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--verbose' || arg === '-v') options.verbose = true;
    else if (arg.startsWith('--')) throw new Error(`Unknown argument: ${arg}`);
  });
  
  return options;
};

const displayHelp = () => {
  console.log(`
MongoDB Migration Script

Usage: node mongo-migrate.js [options]

Options:
  --env=<path>     Path to .env file
  --dry-run        Preview migration
  --verbose, -v    Verbose logging
  --help, -h       Show help

Environment Variables:
  EXPORT_MONGO_URI    Source MongoDB URI
  EXPORT_DB_NAME      Source database name
  IMPORT_MONGO_URI    Target MongoDB URI
  IMPORT_DB_NAME      Target database name
`);
};

const loadEnvironment = async (envPath) => {
  if (!envPath) return;
  
  await fs.access(envPath);
  const result = dotenv.config({ path: envPath });
  
  if (result.error) throw result.error;
  console.log(`✅ Loaded: ${envPath}`);
};

const validateEnvironment = () => {
  const required = ['EXPORT_MONGO_URI', 'EXPORT_DB_NAME', 'IMPORT_MONGO_URI', 'IMPORT_DB_NAME'];
  const missing = required.filter(key => !process.env[key]?.trim());
  
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  
  const config = {
    exportUri: process.env.EXPORT_MONGO_URI.trim(),
    exportDbName: process.env.EXPORT_DB_NAME.trim(),
    importUri: process.env.IMPORT_MONGO_URI.trim(),
    importDbName: process.env.IMPORT_DB_NAME.trim(),
  };
  
  if (config.exportUri === config.importUri && config.exportDbName === config.importDbName) {
    throw new Error('Source and target databases cannot be identical');
  }
  
  return config;
};

const createClient = async (uri) => {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  await client.connect();
  return client;
};

const getCollections = async (db) => {
  const collections = await db.listCollections().toArray();
  return collections.map(col => col.name);
};

const getCollectionStats = async (collection) => {
  const count = await collection.countDocuments();
  return { count };
};

const copyCollection = async (sourceCol, targetCol, name, verbose) => {
  const { count } = await getCollectionStats(sourceCol);
  
  if (count === 0) {
    if (verbose) console.log(`⚠️  ${name}: Empty collection`);
    return { processed: 0, errors: 0 };
  }
  
  let processed = 0;
  let errors = 0;
  const cursor = sourceCol.find({}).batchSize(BATCH_SIZE);
  
  while (await cursor.hasNext()) {
    const batch = [];
    
    while (batch.length < BATCH_SIZE && await cursor.hasNext()) {
      batch.push(await cursor.next());
    }
    
    try {
      await targetCol.insertMany(batch, { ordered: false });
      processed += batch.length;
      
      if (verbose) {
        process.stdout.write(`\r   Progress: ${processed}/${count}`);
      }
    } catch (error) {
      errors += batch.length;
      if (verbose) console.error(`\n⚠️  Batch error: ${error.message}`);
    }
  }
  
  if (verbose && processed > 0) console.log('');
  return { processed, errors };
};

const copyIndexes = async (sourceCol, targetCol, name, verbose) => {
  const indexes = await sourceCol.listIndexes().toArray();
  const customIndexes = indexes.filter(index => index.name !== '_id_');
  
  for (const index of customIndexes) {
    try {
      const { v, ns, ...indexSpec } = index;
      await targetCol.createIndex(indexSpec.key, indexSpec);
      
      if (verbose) console.log(`   📇 ${name}: Created index "${index.name}"`);
    } catch (error) {
      if (verbose) console.error(`⚠️  Index error: ${error.message}`);
    }
  }
};

const verifyMigration = async (sourceDb, targetDb, collections, verbose) => {
  console.log('\n🔍 Verifying migration...');
  
  const results = await Promise.all(
    collections.map(async (name) => {
      const sourceCount = await sourceDb.collection(name).countDocuments();
      const targetCount = await targetDb.collection(name).countDocuments();
      const match = sourceCount === targetCount;
      
      if (verbose || !match) {
        console.log(`   ${match ? '✅' : '❌'} ${name}: ${sourceCount} → ${targetCount}`);
      }
      
      return { name, match };
    })
  );
  
  return results.every(result => result.match);
};

const migrate = async (options) => {
  const config = validateEnvironment();
  const { verbose, dryRun } = options;
  
  console.log('🚀 Starting MongoDB migration...');
  console.log(`📤 Source: ${config.exportDbName}`);
  console.log(`📥 Target: ${config.importDbName}`);
  
  if (dryRun) console.log('🔍 DRY RUN MODE');
  
  const sourceClient = await createClient(config.exportUri);
  const targetClient = await createClient(config.importUri);
  
  try {
    const sourceDb = sourceClient.db(config.exportDbName);
    const targetDb = targetClient.db(config.importDbName);
    
    const collections = await getCollections(sourceDb);
    
    if (collections.length === 0) {
      console.log('⚠️  No collections found');
      return;
    }
    
    console.log(`\n📋 Found ${collections.length} collections`);
    
    if (dryRun) {
      for (const name of collections) {
        const { count } = await getCollectionStats(sourceDb.collection(name));
        console.log(`   - ${name}: ${count} documents`);
      }
      return;
    }
    
    console.log('\n📦 Starting migration...');
    const startTime = Date.now();
    let totalDocs = 0;
    let totalErrors = 0;
    
    for (const name of collections) {
      console.log(`\n🔄 ${name}`);
      
      const sourceCol = sourceDb.collection(name);
      const targetCol = targetDb.collection(name);
      
      try {
        await targetCol.drop();
      } catch (error) {
        // Collection doesn't exist
      }
      
      const result = await copyCollection(sourceCol, targetCol, name, verbose);
      totalDocs += result.processed;
      totalErrors += result.errors;
      
      await copyIndexes(sourceCol, targetCol, name, verbose);
      
      console.log(`   ✅ ${result.processed} documents migrated`);
      if (result.errors > 0) {
        console.log(`   ⚠️  ${result.errors} failed`);
      }
    }
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n🎉 Completed in ${duration}s`);
    console.log(`📊 Total: ${totalDocs} documents`);
    
    if (totalErrors > 0) {
      console.log(`⚠️  Errors: ${totalErrors} documents`);
    }
    
    const verified = await verifyMigration(sourceDb, targetDb, collections, verbose);
    
    if (verified) {
      console.log('\n✅ Migration verified - databases match!');
    } else {
      console.log('\n❌ Verification failed');
      process.exit(1);
    }
    
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
};

const main = async () => {
  try {
    const options = parseArguments();
    
    if (options.help) {
      displayHelp();
      process.exit(0);
    }
    
    await loadEnvironment(options.envPath);
    await migrate(options);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled rejection:', reason);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Interrupted');
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = { migrate, validateEnvironment, parseArguments };
