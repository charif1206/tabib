import { expect, test } from '@playwright/test';
import { mockCoreApi } from './fixtures/mock-routes';

test.describe('Doctor auth handling', () => {
  test('redirects doctor pages to login when API returns unauthorized', async ({ page }) => {
    await mockCoreApi(page);
    await page.route('**/api/doctor/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      });
    });

    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/doctor\/login$/);
    await expect(page.getByRole('heading', { name: 'بوابة الأطباء' })).toBeVisible();
  });
});


