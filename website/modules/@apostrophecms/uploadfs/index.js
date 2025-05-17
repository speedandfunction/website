// Make environment variables optional with defaults for local development
const getEnv = (name, defaultValue) => process.env[name] || defaultValue;

// Determine if we're in development mode
const isDev = getEnv('NODE_ENV', 'development') === 'development';

// S3 configuration
const s3Config = {
  bucket: getEnv('APOS_S3_BUCKET', 'apostrophe-test-bucket'),
  region: getEnv('APOS_S3_REGION', 'us-east-1'),
  key: getEnv('APOS_S3_KEY', 'test'),
  secret: getEnv('APOS_S3_SECRET', 'test'),
  endpoint: null,
};

// Set endpoint only for development mode
if (isDev) {
  s3Config.endpoint = getEnv('APOS_S3_ENDPOINT', 'https://localstack:4566');
} else {
  s3Config.endpoint = getEnv('APOS_S3_ENDPOINT', null);
}

// Public URL for browser access
let publicUrl = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com`;
if (isDev) {
  publicUrl = getEnv(
    'APOS_UPLOADS_PUBLIC_URL',
    'https://localhost:4566/apostrophe-test-bucket',
  );
} else {
  publicUrl = getEnv('APOS_UPLOADS_PUBLIC_URL', publicUrl);
}

// S3 client configuration
const s3ClientConfig = {
  s3ForcePathStyle: false,
  forcePathStyle: false,
  signatureVersion: 'v4',
  publicEndpoint: publicUrl.split('/').slice(0, 3).join('/'),
};

// Set style and path options based on environment
if (isDev) {
  s3ClientConfig.s3ForcePathStyle = true;
  s3ClientConfig.forcePathStyle = true;
}

// Add endpoint if provided
if (s3Config.endpoint) {
  s3ClientConfig.endpoint = s3Config.endpoint;
}

// CDN URL based on environment
let cdnUrl = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com`;
if (isDev) {
  cdnUrl = getEnv(
    'APOS_CDN_URL',
    'https://localhost:4566/apostrophe-test-bucket',
  );
} else {
  cdnUrl = getEnv('APOS_CDN_URL', cdnUrl);
}

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
  },
};

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
