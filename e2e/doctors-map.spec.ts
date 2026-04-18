import { expect, test } from '@playwright/test';
import { mockCoreApi } from './fixtures/mock-routes';

test.describe('Doctors map interactions', () => {
  test('centers map to selected doctor saved location', async ({ page }) => {
    await mockCoreApi(page);

    await page.goto('/doctors');

    const map = page.getByTestId('doctors-leaflet-map');
    await expect(map).toBeVisible();
    await expect(page.getByTestId('selected-doctor-name')).toContainText('د. سارة أحمد');
    await expect(page.getByTestId('selected-doctor-coords')).toHaveText('33.5731,-7.5898');

    await page.getByTestId('doctor-focus-doc-2').click();
    await expect(page.getByTestId('selected-doctor-name')).toContainText('د. عمر علي');
    await expect(page.getByTestId('selected-doctor-coords')).toHaveText('34.0209,-6.8416');
  });

  test('shows ratings and sorts doctors by highest rating', async ({ page }) => {
    await mockCoreApi(page);

    await page.goto('/doctors');

    await expect(page.getByTestId('doctor-rating-doc-1')).toContainText('4.8');
    await expect(page.getByTestId('doctor-rating-doc-2')).toContainText('3.9');

    await page.getByTestId('doctors-sort').selectOption('highest-rating');

    const firstCard = page.locator('[data-testid^="doctor-card-"]').first();
    await expect(firstCard).toHaveAttribute('data-testid', 'doctor-card-doc-1');
  });
});


