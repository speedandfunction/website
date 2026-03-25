const { getEnv } = require('../../../utils/env');

const aposS3Secret = process.env.APOS_S3_SECRET;
const aposS3Endpoint = process.env.APOS_S3_ENDPOINT;
const aposS3Style = process.env.APOS_S3_STYLE;
const aposS3Https = process.env.APOS_S3_HTTPS;

const uploadfsOptions = {
  storage: 's3',
  bucket: getEnv('APOS_S3_BUCKET'),
  region: getEnv('APOS_S3_REGION'),
  cdn: {
    enabled: true,
    url: getEnv('APOS_CDN_URL'),
  },
};

if (aposS3Endpoint) {
  uploadfsOptions.endpoint = aposS3Endpoint;
}

if (aposS3Style) {
  uploadfsOptions.style = aposS3Style;
}

if (aposS3Https) {
  uploadfsOptions.https = aposS3Https.toLowerCase() === 'true';
}

if (aposS3Secret) {
  uploadfsOptions.secret = aposS3Secret;
  uploadfsOptions.key = getEnv('APOS_S3_KEY');
}

const aposS3BucketObjectsAcl = process.env.APOS_S3_ACL || 'private';
uploadfsOptions.bucketObjectsACL = aposS3BucketObjectsAcl;
uploadfsOptions.disabledBucketObjectsACL = aposS3BucketObjectsAcl;

const res = {
  options: {
    uploadfs: uploadfsOptions,
  },
};

module.exports = res;
