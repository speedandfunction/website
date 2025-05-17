import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'homepage.png' },
  { path: '/cases', name: 'cases.png' },
  { path: '/about-us', name: 'about-us.png' },
];

for (const { path, name } of routes) {
  test(`Snapshot for ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto(
      `${process.env.BASE_URL ?? 'http://localhost:3000'}${path}`,
      {
        timeout: 60000,
        waitUntil: 'networkidle',
      },
    );

    await Promise.all([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle'),
    ]);
    await page.evaluate(() => document.fonts.ready);

    const snapshot = await page.screenshot({
      fullPage: true,
      timeout: 30000,
    });

    expect(snapshot).toMatchSnapshot(name, {
      maxDiffPixels: 300,
      threshold: 0.5,
    });
  });
}
