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
});


