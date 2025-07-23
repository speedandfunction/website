const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  GetObjectAclCommand,
} = require('@aws-sdk/client-s3');
const path = require('path');

const getEnvPath = () => {
  const args = process.argv.slice(2);
  const envArg =
    args.find((arg) => arg.startsWith('--env='))?.split('=')[1] ||
    args[args.findIndex((arg) => arg === '--env') + 1];
  return path.resolve(envArg || path.join(__dirname, '..', '.env'));
};

const envPath = getEnvPath();
require('dotenv').config({ path: envPath });

const config = {
  envPath,
  get buckets() {
    return {
      source: process.env.S3_SOURCE_BUCKET,
      dest: process.env.S3_DEST_BUCKET,
    };
  },
  get credentials() {
    const validateCredentials = (creds, type) => {
      if (!creds.accessKeyId || !creds.secretAccessKey) {
        throw new Error(`Missing AWS ${type} credentials`);
      }
      if (creds.accessKeyId.length < 16 || creds.secretAccessKey.length < 20) {
        throw new Error(`Invalid AWS ${type} credential format`);
      }
      return creds;
    };

    return {
      source: validateCredentials(
        {
          region: process.env.AWS_SOURCE_REGION || 'us-east-1',
          accessKeyId: process.env.AWS_SOURCE_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SOURCE_SECRET_ACCESS_KEY,
        },
        'source',
      ),
      dest: validateCredentials(
        {
          region: process.env.AWS_DEST_REGION || 'us-east-1',
          accessKeyId: process.env.AWS_DEST_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_DEST_SECRET_ACCESS_KEY,
        },
        'destination',
      ),
    };
  },
};

/*
 * Configuration constants
 * Number of files to copy concurrently per batch
 */
const COPY_BATCH_SIZE = 3;

const s3Clients = {
  source: () =>
    new S3Client({
      region: config.credentials.source.region,
      credentials: {
        accessKeyId: config.credentials.source.accessKeyId,
        secretAccessKey: config.credentials.source.secretAccessKey,
      },
    }),
  dest: () =>
    new S3Client({
      region: config.credentials.dest.region,
      credentials: {
        accessKeyId: config.credentials.dest.accessKeyId,
        secretAccessKey: config.credentials.dest.secretAccessKey,
      },
    }),
};

const operations = {
  listObjects(bucket, client) {
    const fetchPage = (continuationToken) => {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      });
      return client.send(command);
    };

    const getAllPages = (token = null, allObjects = []) => {
      return fetchPage(token).then((response) => {
        let newObjects = [];
        if (response.Contents) {
          newObjects = response.Contents.map((obj) => obj.Key);
        }
        const updatedObjects = [...allObjects, ...newObjects];

        if (response.NextContinuationToken) {
          return getAllPages(response.NextContinuationToken, updatedObjects);
        }
        return updatedObjects;
      });
    };

    return getAllPages();
  },

  async getObjectWithACL(key, bucket, client) {
    const [objectData, acl] = await Promise.all([
      client.send(new GetObjectCommand({ Bucket: bucket, Key: key })),
      this.getACL(key, bucket, client),
    ]);
    return { ...objectData, acl };
  },

  async getACL(key, bucket, client) {
    try {
      const { Grants } = await client.send(
        new GetObjectAclCommand({ Bucket: bucket, Key: key }),
      );
      const isPublic = Grants?.some(
        (grant) =>
          grant.Grantee?.URI ===
            'https://acs.amazonaws.com/groups/global/AllUsers' &&
          grant.Permission === 'READ',
      );
      if (isPublic) return 'public-read';
      return 'private';
    } catch (err) {
      if (err.name === 'AccessDenied') return 'private';
      throw err;
    }
  },

  streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  },

  async copyObject(key, sourceBucket, destBucket, sourceClient, destClient) {
    const objectData = await this.getObjectWithACL(
      key,
      sourceBucket,
      sourceClient,
    );
    const body = await this.streamToBuffer(objectData.Body);
    await destClient.send(
      new PutObjectCommand({
        Bucket: destBucket,
        Key: key,
        Body: body,
        ContentType: objectData.ContentType,
        Metadata: objectData.Metadata,
        ACL: objectData.acl,
      }),
    );
  },
};

const logger = {
  progress(current, total, status, message) {
    const progress = Math.round((current / total) * 100);
    let icon = '❌';
    if (status === 'success') icon = '✅';
    // eslint-disable-next-line no-console
    console.log(`${icon} [${current}/${total}] ${progress}% - ${message}`);
  },

  summary(title, { success, failed, total }) {
    // eslint-disable-next-line no-console
    console.log(
      `\n📊 ${title}:\n✅ Successfully copied: ${success}\n❌ Failed to copy: ${failed}\n📦 Total objects: ${total}`,
    );
  },

  failureList(failures) {
    if (failures.length === 0) return;
    // eslint-disable-next-line no-console
    console.log('\n📋 Failed Objects List:');
    failures.forEach((failure, index) => {
      // eslint-disable-next-line no-console
      console.log(`${index + 1}. ${failure.key}`);
      let errorMsg = failure.error;
      if (failure.error.length > 100) {
        errorMsg = `${failure.error.substring(0, 100)}...`;
      }
      // eslint-disable-next-line no-console
      console.log(`   Error: ${errorMsg}`);
    });
  },
};

const copyStrategy = {
  createBatches(objects, batchSize) {
    const batches = [];
    for (let i = 0; i < objects.length; i += batchSize) {
      batches.push({
        batch: objects.slice(i, i + batchSize),
        startIndex: i,
      });
    }
    return batches;
  },

  createObjectProcessor(results, context, objects) {
    const {
      sourceBucket,
      destBucket,
      sourceClient,
      destClient,
      isRetry = false,
    } = context;
    let prefix = 'Copied';
    if (isRetry) {
      prefix = 'Retry';
    }

    return async (obj, current) => {
      const key = obj;

      try {
        await operations.copyObject(
          key,
          sourceBucket,
          destBucket,
          sourceClient,
          destClient,
        );
        results.success += 1;
        logger.progress(
          current,
          objects.length,
          'success',
          `${prefix}: ${key}`,
        );
      } catch (error) {
        results.failed += 1;
        results.failures.push({ key, error: error.message });
        logger.progress(
          current,
          objects.length,
          'error',
          `Failed to copy ${key}: ${error.message}`,
        );
      }
    };
  },

  async processBatch(batch, startIndex, processor) {
    const batchPromises = batch.map((obj, index) =>
      processor(obj, startIndex + index + 1),
    );
    await Promise.all(batchPromises);
  },

  async processObjects(objects, context) {
    const results = { success: 0, failed: 0, failures: [] };
    const processor = this.createObjectProcessor(results, context, objects);

    const batches = this.createBatches(objects, COPY_BATCH_SIZE);

    const processBatchesSequentially = (batchIndex = 0) => {
      if (batchIndex >= batches.length) {
        return Promise.resolve();
      }

      const { batch, startIndex } = batches[batchIndex];
      return this.processBatch(batch, startIndex, processor).then(() =>
        processBatchesSequentially(batchIndex + 1),
      );
    };

    await processBatchesSequentially();
    return results;
  },

  async withRetry(objects, context) {
    const firstAttempt = await this.processObjects(objects, context);
    logger.summary('First Attempt Summary', {
      ...firstAttempt,
      total: objects.length,
    });
    if (firstAttempt.failures.length === 0) return firstAttempt;

    // eslint-disable-next-line no-console
    console.log(
      `\n🔄 Retrying ${firstAttempt.failures.length} failed objects...`,
    );
    const failedKeys = firstAttempt.failures.map((failure) => failure.key);
    const retryResults = await this.processObjects(failedKeys, {
      ...context,
      isRetry: true,
    });
    logger.summary('Retry Summary', {
      ...retryResults,
      total: firstAttempt.failures.length,
    });

    /*
     * Final results: total successes vs final failures
     * Failed/failures only include objects that failed after retry
     */
    return {
      success: firstAttempt.success + retryResults.success,
      failed: retryResults.failed,
      failures: retryResults.failures,
    };
  },
};

class S3CopyService {
  constructor() {
    this.sourceClient = s3Clients.source();
    this.destClient = s3Clients.dest();
  }

  async execute(sourceBucket, destBucket) {
    S3CopyService.validateBuckets(sourceBucket, destBucket);
    S3CopyService.logStart(sourceBucket, destBucket);

    const objects = await operations.listObjects(
      sourceBucket,
      this.sourceClient,
    );
    const results = await this.processObjects(
      objects,
      sourceBucket,
      destBucket,
    );
    return S3CopyService.handleResults(results);
  }

  static validateBuckets(sourceBucket, destBucket) {
    if (!sourceBucket || !destBucket)
      throw new Error('Missing required buckets');
    if (sourceBucket === destBucket)
      throw new Error('Source and destination buckets cannot be the same');
  }

  static logStart(sourceBucket, destBucket) {
    // eslint-disable-next-line no-console
    console.log(`🚀 Starting copy from ${sourceBucket} to ${destBucket}`);
  }

  processObjects(objects, sourceBucket, destBucket) {
    if (objects.length === 0) {
      // eslint-disable-next-line no-console
      console.log('📭 No objects found');
      return { success: 0, failed: 0, failures: [] };
    }

    // eslint-disable-next-line no-console
    console.log(`📦 Found ${objects.length} objects to copy`);

    const context = {
      sourceBucket,
      destBucket,
      sourceClient: this.sourceClient,
      destClient: this.destClient,
    };
    return copyStrategy.withRetry(objects, context);
  }

  static handleResults(results) {
    const { success, failed, failures } = results;
    logger.summary('Final Summary', {
      success,
      failed,
      total: success + failed,
    });
    logger.failureList(failures);

    if (failed > 0) throw new Error(`Copy completed with ${failed} errors`);

    // eslint-disable-next-line no-console
    console.log('🎉 All objects copied successfully!');
    return results;
  }
}

const helpText = `
S3 Cross-Account Copy Script

Usage: node s3-copy.js [--env <path>] [--help]

Environment Variables:
  S3_SOURCE_BUCKET           Source bucket name
  S3_DEST_BUCKET            Destination bucket name
  AWS_SOURCE_ACCESS_KEY_ID   Source account credentials
  AWS_SOURCE_SECRET_ACCESS_KEY
  AWS_SOURCE_REGION         (default: us-east-1)
  AWS_DEST_ACCESS_KEY_ID    Destination account credentials
  AWS_DEST_SECRET_ACCESS_KEY
  AWS_DEST_REGION          (default: us-east-1)
`;

const main = async () => {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    // eslint-disable-next-line no-console
    console.log(helpText);
    return;
  }

  const { source: sourceBucket, dest: destBucket } = config.buckets;
  if (!sourceBucket || !destBucket) {
    const missing = [];
    if (!sourceBucket) missing.push('S3_SOURCE_BUCKET');
    if (!destBucket) missing.push('S3_DEST_BUCKET');

    // eslint-disable-next-line no-console
    console.error('❌ Missing required environment variables:');
    missing.forEach((variable) => {
      // eslint-disable-next-line no-console
      console.error(`  - ${variable}`);
    });
    // eslint-disable-next-line no-console
    console.error('\n💡 Use --help for configuration details');
    throw new Error('Missing required environment variables');
  }

  // eslint-disable-next-line no-console
  console.log('🚀 S3 Copy Script Starting...');
  // eslint-disable-next-line no-console
  console.log(`📂 Source: ${sourceBucket} → Destination: ${destBucket}\n`);

  await new S3CopyService().execute(sourceBucket, destBucket);
};

if (require.main === module) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(`💥 Script failed: ${error.message}`);
    throw error;
  });
}

module.exports = { S3CopyService };
