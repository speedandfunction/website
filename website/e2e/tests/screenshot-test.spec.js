import { test, expect } from '@playwright/test';
import { getEnv } from '../../utils/env.js';

test('Snapshot for Home Page', async ({ page }) => {
  await page.setViewportSize({
    width: 1280,
    height: 720,
  });

  await page.goto(getEnv('BASE_URL'), {
    timeout: 60000,
    waitUntil: 'networkidle',
  });

  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    page.waitForLoadState('networkidle'),
  ]);
  await page.evaluate(() => document.fonts.ready);

  const snapshot = await page.screenshot({
    fullPage: true,
    timeout: 30000,
  });

  expect(snapshot).toMatchSnapshot('homepage.png', {
    maxDiffPixels: 300,
    threshold: 0.5,
  });
});
