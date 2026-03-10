const { getEnv } = require('../../../utils/env');

const aposS3Secret = process.env.APOS_S3_SECRET;

const uploadfsOptions = {
  storage: 's3',
  bucket: getEnv('APOS_S3_BUCKET'),
  region: getEnv('APOS_S3_REGION'),
  endpoint: getEnv('APOS_S3_ENDPOINT'),
  style: getEnv('APOS_S3_STYLE'),
  https: getEnv('APOS_S3_HTTPS'),
  cdn: {
    enabled: true,
    url: getEnv('APOS_CDN_URL'),
  },
};

if (aposS3Secret !== undefined) {
  uploadfsOptions.secret = aposS3Secret;
  uploadfsOptions.key = getEnv('APOS_S3_KEY');
}

const res = {
  options: {
    uploadfs: uploadfsOptions,
  },
};

module.exports = res;
