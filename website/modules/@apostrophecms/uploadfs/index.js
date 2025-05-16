const required = [
  'APOS_S3_BUCKET',
  'APOS_S3_REGION',
  'APOS_S3_KEY',
  'APOS_S3_SECRET',
];

required.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env var: ${envVar}`);
  }
});

if (process.env.APOS_CDN_ENABLED === 'true' && !process.env.APOS_CDN_URL) {
  throw new Error('CDN is enabled but APOS_CDN_URL is not set');
}

const s3Options = {
  params: {
    ACL: null,
  },
};

// Add custom endpoint for LocalStack if provided
if (process.env.APOS_S3_ENDPOINT) {
  s3Options.endpoint = process.env.APOS_S3_ENDPOINT;
  s3Options.s3ForcePathStyle = true;
  s3Options.signatureVersion = 'v4';
}

module.exports = {
  options: {
    uploadfs: {
      storage: 's3',
      bucket: process.env.APOS_S3_BUCKET,
      region: process.env.APOS_S3_REGION,
      key: process.env.APOS_S3_KEY,
      secret: process.env.APOS_S3_SECRET,
      // Disable https for LocalStack
      https: !process.env.APOS_S3_ENDPOINT,

      disableACL: true,

      cdn: {
        url: process.env.APOS_CDN_URL || '',
        enabled: process.env.APOS_CDN_ENABLED === 'true',
      },

      s3Options,
    },
  },
};
