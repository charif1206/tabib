import { expect, test } from '@playwright/test';
import { mockCoreApi } from './fixtures/mock-routes';

test.describe('Doctor sidebar buttons load data', () => {
  test.beforeEach(async ({ page }) => {
    await mockCoreApi(page);
  });

  test('navigates between dashboard, bookings, requests, and calendar with data', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-total-requests')).toHaveText('2');

    await page.getByTestId('doctor-nav-bookings').click();
    await expect(page.getByTestId('doctor-appointment-card-apt-book-1')).toContainText('Lina K.');

    await page.getByTestId('doctor-nav-requests').click();
    await expect(page.getByTestId('doctor-appointment-card-apt-req-1')).toContainText('Ahmed N.');

    const calendarResponse = page.waitForResponse(
      (response) => response.url().includes('/api/doctor/calendar') && response.request().method() === 'GET',
    );
    await page.getByTestId('doctor-nav-calendar').click();
    await calendarResponse;
    await expect(page.getByTestId('doctor-calendar-table')).toBeVisible();
    await expect(page.getByText('محجوز').first()).toBeVisible();
  });
});


