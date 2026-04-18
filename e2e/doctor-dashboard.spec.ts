import { expect, test } from '@playwright/test';
import { mockCoreApi } from './fixtures/mock-routes';

test.describe('Doctor dashboard core flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockCoreApi(page);
  });

  test('shows counters, switches tab, and confirms request action', async ({ page }) => {
    const dashboardResponse = page.waitForResponse(
      (response) => response.url().includes('/api/doctor/dashboard') && response.request().method() === 'GET',
    );
    const requestsResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/doctor/appointments') &&
        response.url().includes('type=requests') &&
        response.request().method() === 'GET',
    );

    await page.goto('/dashboard');
    await dashboardResponse;
    await requestsResponse;

    await expect(page.getByTestId('dashboard-total-requests')).toHaveText('2');
    await expect(page.getByTestId('dashboard-total-bookings')).toHaveText('1');

    await expect(page.getByTestId('appointment-card-apt-req-1')).toContainText('Ahmed N.');

    await page.getByTestId('appointment-action-apt-req-1').click();
    await expect(page.getByTestId('appointment-action-modal')).toBeVisible();

    await page.getByTestId('action-accept').click();
    await page.getByTestId('confirm-action').click();
    await expect(page.getByTestId('appointment-action-modal')).toBeHidden();

    await page.getByTestId('dashboard-tab-bookings').click();
    await expect(page.getByTestId('appointment-card-apt-book-1')).toContainText('Lina K.');
  });
});


