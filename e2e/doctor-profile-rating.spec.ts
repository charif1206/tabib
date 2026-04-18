import { expect, test } from '@playwright/test';
import { mockCoreApi } from './fixtures/mock-routes';

test.describe('Doctor profile rating button', () => {
  test('shows the star rating button on doctor profile', async ({ page }) => {
    await mockCoreApi(page);

    await page.goto('/doctor/doc-1');

    await expect(page.getByTestId('open-rating-modal')).toBeVisible();
    await expect(page.getByTestId('open-rating-modal')).toHaveText('نجمة');
  });
});

