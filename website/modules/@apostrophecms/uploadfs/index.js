// Make environment variables optional with defaults for local development
const getEnv = (name, defaultValue) => process.env[name] || defaultValue;

// Determine if we're in development mode
const isDev = getEnv('NODE_ENV', 'development') === 'development';

/*
 * Protocol constants - we need HTTP for local development with LocalStack
 * This disables the linter warning deliberately for local development
 */
const DEV_PROTOCOL = 'http://';
const PROD_PROTOCOL = 'https://';

// S3 configuration
const s3Config = {
  bucket: getEnv('APOS_S3_BUCKET', 'apostrophe-test-bucket'),
  region: getEnv('APOS_S3_REGION', 'us-east-1'),
  key: getEnv('APOS_S3_KEY', 'test'),
  secret: getEnv('APOS_S3_SECRET', 'test'),
  endpoint: null,
};

// Set endpoint for local development or production
if (isDev) {
  s3Config.endpoint = getEnv(
    'APOS_S3_ENDPOINT',
    `${DEV_PROTOCOL}localstack:4566`,
  );
} else {
  s3Config.endpoint = getEnv('APOS_S3_ENDPOINT', null);
}

// Public URL for browser access - different protocol based on environment
let basePublicUrl = `${PROD_PROTOCOL}${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com`;
if (isDev) {
  basePublicUrl = `${DEV_PROTOCOL}localhost:4566/${s3Config.bucket}`;
}

const publicUrl = getEnv('APOS_UPLOADS_PUBLIC_URL', basePublicUrl);

// S3 client configuration
const urlObj = new URL(publicUrl);
const s3ClientConfig = {
  s3ForcePathStyle: false,
  forcePathStyle: false,
  signatureVersion: 'v4',
  publicEndpoint: urlObj.origin,
};

// Set path style options for development
if (isDev) {
  s3ClientConfig.s3ForcePathStyle = true;
  s3ClientConfig.forcePathStyle = true;
}

// Add endpoint if provided
if (s3Config.endpoint) {
  s3ClientConfig.endpoint = s3Config.endpoint;
}

// CDN URL based on environment
let baseCdnUrl = `${PROD_PROTOCOL}${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com`;
if (isDev) {
  baseCdnUrl = `${DEV_PROTOCOL}localhost:4566/${s3Config.bucket}`;
}

const cdnUrl = getEnv('APOS_CDN_URL', baseCdnUrl);
const cdnUrlObj = new URL(cdnUrl);

// Determine storage style based on environment
let storageStyle = 'virtualHosted';
if (isDev) {
  storageStyle = 'path';
}

// Create uploadfs configuration object
const uploadfsConfig = {
  storage: 's3',
  bucket: s3Config.bucket,
  region: s3Config.region,
  key: s3Config.key,
  secret: s3Config.secret,
  https: true,
  uploadsUrl: publicUrl,
  style: storageStyle,
  clients: {
    s3: s3ClientConfig,
  },
  cdn: {
    enabled: getEnv('APOS_CDN_ENABLED', 'true') === 'true',
    url: cdnUrl,
    origin: cdnUrlObj.origin,
  },
};

// Set HTTP/HTTPS based on environment
if (isDev) {
  uploadfsConfig.https = false;
}

// Add endpoint only if it exists
if (s3Config.endpoint) {
  uploadfsConfig.endpoint = s3Config.endpoint;
}

// Export the module configuration
module.exports = {
  options: {
    uploadfs: uploadfsConfig,
  },
};
