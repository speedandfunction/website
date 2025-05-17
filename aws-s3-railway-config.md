# AWS S3 Configuration for Railway Deployment

## Issue Resolution

The error `@apostrophecms/attachment: api-error: Inaccessible host: 'localstack' at port 'undefined'. This service may not be available in the 'us-east-1' region.` occurs because the application is trying to use LocalStack (local S3 emulator) in production environment instead of connecting to the actual AWS S3 bucket.

## Required Environment Variables

Configure the following environment variables in your Railway project settings:

| Variable                  | Description                              | Example Value                              |
| ------------------------- | ---------------------------------------- | ------------------------------------------ |
| `NODE_ENV`                | Set to production for Railway deployment | `production`                               |
| `APOS_S3_BUCKET`          | Your AWS S3 bucket name                  | `your-bucket-name`                         |
| `APOS_S3_REGION`          | AWS region where your bucket is located  | `eu-central-1`                             |
| `APOS_S3_KEY`             | AWS Access Key ID                        | `AKIAIOSFODNN7EXAMPLE`                     |
| `APOS_S3_SECRET`          | AWS Secret Access Key                    | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `APOS_S3_ENDPOINT`        | Only set if using a custom S3 endpoint   | Leave blank for AWS S3                     |
| `APOS_UPLOADS_PUBLIC_URL` | Optional: Custom URL for uploads         | Leave blank to use bucket URL              |
| `APOS_CDN_ENABLED`        | Enable CDN if using one                  | `true` or `false`                          |
| `APOS_CDN_URL`            | CDN URL if enabled                       | Leave blank if not using CDN               |

## AWS S3 Bucket Configuration

1. Create an S3 bucket in your AWS account
2. Make sure the bucket has proper CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

3. Configure bucket permissions:
   - Ensure the IAM user with the provided access key has permissions to read/write to the bucket
   - Public read access should be enabled for uploaded files

## IAM User Permissions

The IAM user identified by `APOS_S3_KEY` should have the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME",
        "arn:aws:s3:::YOUR-BUCKET-NAME/*"
      ]
    }
  ]
}
```

## Implementation Notes

The application code has been updated to:

1. Check the `NODE_ENV` variable to determine if running in development or production environment
2. Use LocalStack only in development mode
3. Connect to real AWS S3 in production (Railway deployment)
4. Use the appropriate URL style and protocol based on environment

After configuring these environment variables in Railway, redeploy your application to apply the changes.
