const { test, expect } = require('@playwright/test');
const path = require('node:path');
const fs = require('node:fs/promises');

if (!process.env.DEPLOY_URL) {
  throw new Error('DEPLOY_URL must be set to the local app URL.');
}
if (!process.env.DEMO_OUTPUT_DIR) {
  throw new Error('DEMO_OUTPUT_DIR must be set to a writable artifact directory.');
}

test('shows the verified delivery badge on the home page', async ({ page }) => {
  await page.goto(`${process.env.DEPLOY_URL}/`);
  const badge = page.locator('#delivery-verified-badge');
  await expect(badge).toBeVisible();
  await expect(badge).toContainText('Livraison vérifiée');
  await expect(badge).toBeInViewport();
  await fs.mkdir(process.env.DEMO_OUTPUT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(process.env.DEMO_OUTPUT_DIR, 'delivery-verified-desktop.png'),
    fullPage: true,
  });

  await page.setViewportSize({ width: 375, height: 812 });
  await expect(badge).toBeVisible();
  await expect(badge).toBeInViewport();
  await page.screenshot({
    path: path.join(process.env.DEMO_OUTPUT_DIR, 'delivery-verified-mobile.png'),
    fullPage: true,
  });
});
