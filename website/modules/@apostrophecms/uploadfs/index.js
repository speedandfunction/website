// Make environment variables optional with defaults for local development
const getEnv = (name, defaultValue) => process.env[name] || defaultValue;

// S3 configuration
const s3Config = {
  bucket: getEnv('APOS_S3_BUCKET', 'apostrophe-test-bucket'),
  region: getEnv('APOS_S3_REGION', 'us-east-1'),
  key: getEnv('APOS_S3_KEY', 'test'),
  secret: getEnv('APOS_S3_SECRET', 'test'),
  // LocalStack requires http:// for development
  endpoint: getEnv('APOS_S3_ENDPOINT', 'https://localstack:4566'),
};

// Public URL for browser access (localhost instead of localstack)
const publicUrl = getEnv(
  'APOS_UPLOADS_PUBLIC_URL',
  'http://localhost:4566/apostrophe-test-bucket',
);

// Uploadfs options object with all required settings
module.exports = {
  options: {
    uploadfs: {
      storage: 's3',
      // Used S3 bucket name
      bucket: s3Config.bucket,
      region: s3Config.region,
      key: s3Config.key,
      secret: s3Config.secret,
      endpoint: s3Config.endpoint,
      // Required for LocalStack - force path style for S3 URLs
      https: false,
      // Set the base URL for public URLs
      uploadsUrl: publicUrl,
      // S3 client options
      style: 'path',
      clients: {
        s3: {
          s3ForcePathStyle: true,
          forcePathStyle: true,
          signatureVersion: 'v4',
          endpoint: s3Config.endpoint,
          // For browser-facing URLs, replace localstack with localhost
          publicEndpoint: publicUrl.split('/').slice(0, 3).join('/'),
        },
      },
      // CDN configuration
      cdn: {
        enabled: getEnv('APOS_CDN_ENABLED', 'true') === 'true',
        url: getEnv(
          'APOS_CDN_URL',
          'http://localhost:4566/apostrophe-test-bucket',
        ),
      },
    },
  },
};
