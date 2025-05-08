#!/usr/bin/env node
import 'source-map-support/register';
import * as dotenv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import { CloudfrontCdkStack } from '../lib/cloudfront-stack';

// Завантаження змінних оточення з локального .env файлу
dotenv.config();

// Отримуємо змінні оточення з конфігурації або використовуємо значення за замовчуванням
const account =
  process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;
const region =
  process.env.CDK_DEPLOY_REGION ||
  process.env.CDK_DEFAULT_REGION ||
  'us-east-1';

const app = new cdk.App();
new CloudfrontCdkStack(app, 'CloudfrontCdkStack', {
  // Використовуємо env тільки якщо обидва параметри доступні
  ...(account && region ? { env: { account, region } } : {}),
});
