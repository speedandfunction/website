// eslint-disable-next-line node/no-unpublished-import
import { test, expect } from '@playwright/test';

test('Snapshot for Home Page', async ({ page }) => {
  await page.setViewportSize({
    width: 1280,
    height: 720
  });

  await page.goto(process.env.BASE_URL ?? 'http://localhost:3000', {
    timeout: 60000,
    waitUntil: 'networkidle'
  });

  await Promise.all([
    page.waitForLoadState('domcontentloaded'),
    page.waitForLoadState('networkidle')
  ]);
  await page.evaluate(() => document.fonts.ready);

  const snapshot = await page.screenshot({
    fullPage: true,
    timeout: 30000
  });

  expect(snapshot).toMatchSnapshot('homepage.png', {
    maxDiffPixels: 300,
    threshold: 0.5
  });
});
