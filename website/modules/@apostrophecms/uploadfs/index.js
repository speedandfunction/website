const { getEnv } = require('../../../utils/env');

const res = {
  options: {
    uploadfs: { 
      storage: 's3',
      // Get your credentials at aws.amazon.com
      secret: getEnv('APOS_S3_SECRET'),
      key: getEnv('APOS_S3_KEY'),
      // Bucket name created on aws.amazon.com
      bucket: getEnv('APOS_S3_BUCKET'),
      // Region name for endpoint
      region: getEnv('APOS_S3_REGION'),
      endpoint: getEnv('APOS_S3_ENDPOINT'),
      style: getEnv('APOS_S3_STYLE'),
      https: false,
      cdn: {
        enabled: true,
        url: getEnv('APOS_CDN_URL'),
      },
    },
   
  },
};
console.log(JSON.stringify(res, null, 2));
module.exports = res;
