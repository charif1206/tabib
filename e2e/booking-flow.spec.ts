import { expect, test } from '@playwright/test';
import { mockCoreApi } from './fixtures/mock-routes';

test.describe('Patient booking core flow', () => {
  test('books an appointment from doctor profile', async ({ page }) => {
    await mockCoreApi(page);

    const doctorsResponse = page.waitForResponse(
      (response) => response.url().includes('/api/doctors') && response.request().method() === 'GET',
    );

    await page.goto('/doctors');
    await doctorsResponse;
    await expect(page.getByTestId('doctor-card-doc-1')).toContainText('د. سارة أحمد');

    const doctorProfileResponse = page.waitForResponse(
      (response) => response.url().includes('/api/doctors/doc-1') && response.request().method() === 'GET',
    );
    await page.getByTestId('doctor-link-doc-1').click();
    await doctorProfileResponse;
    await expect(page).toHaveURL(/\/doctor\/doc-1$/);

    await page.getByTestId('slot-09:00').click();
    await page.getByTestId('submit-booking').click();

    await expect(page.getByTestId('booking-message')).toContainText('تم إرسال طلب الحجز بنجاح');
  });

  test('shows API error message when booking fails', async ({ page }) => {
    await mockCoreApi(page, {
      bookingPostStatus: 409,
      bookingPostError: 'الموعد محجوز بالفعل',
    });

    const doctorProfileResponse = page.waitForResponse(
      (response) => response.url().includes('/api/doctors/doc-1') && response.request().method() === 'GET',
    );
    await page.goto('/doctor/doc-1');
    await doctorProfileResponse;
    await page.getByTestId('slot-10:00').click();
    await page.getByTestId('submit-booking').click();

    await expect(page.getByTestId('booking-message')).toHaveText('الموعد محجوز بالفعل');
  });
});


