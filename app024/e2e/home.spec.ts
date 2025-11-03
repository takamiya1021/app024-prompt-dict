import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('shows the default hero section', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading');
    await expect(heading).toBeVisible();
  });
});
