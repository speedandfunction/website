const { getEnv } = require('../../../utils/env');

const s3aws = {
  bucket: getEnv('APOS_S3_BUCKET'),
  region: getEnv('APOS_S3_REGION'),,
  https: true,
};

// const s3localstack = {
//   bucket: getEnv('APOS_S3_BUCKET'),
//   region: getEnv('APOS_S3_REGION'),
//   endpoint: getEnv('APOS_S3_ENDPOINT'),
//   style: 'path',
//   https: false,
// };

const res = {
  options: {
    uploadfs: {
      storage: 's3',
      ...s3aws,
      // Get your credentials at aws.amazon.com
      // secret: getEnv('APOS_S3_SECRET'),
      // key: getEnv('APOS_S3_KEY'),
      // // Bucket name created on aws.amazon.com
      // bucket: getEnv('APOS_S3_BUCKET'),
      // // Region name for endpoint
      // region: getEnv('APOS_S3_REGION'),
      // endpoint: getEnv('APOS_S3_ENDPOINT'),
      // style: getEnv('APOS_S3_STYLE'),
      // https: getEnv('APOS_S3_HTTPS'),
      cdn: {
        enabled: true,
        url: getEnv('APOS_CDN_URL'),
      },
    },
  },
};

module.exports = res;
