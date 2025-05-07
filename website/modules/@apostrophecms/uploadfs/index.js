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
