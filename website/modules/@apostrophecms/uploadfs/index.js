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

module.exports = {
  options: {
    uploadfs: {
      storage: 's3',
      bucket: process.env.APOS_S3_BUCKET,
      region: process.env.APOS_S3_REGION,
      key: process.env.APOS_S3_KEY,
      secret: process.env.APOS_S3_SECRET,
      https: true,

      disableACL: true,

      cdn: {
        url: process.env.APOS_CDN_URL || '',
        enabled: process.env.APOS_CDN_ENABLED === 'true',
      },

      s3Options: {
        params: {
          ACL: null,
        },
      },
    },
  },
};
