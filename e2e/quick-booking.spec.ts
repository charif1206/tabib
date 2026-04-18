import { expect, test } from '@playwright/test';
import { mockCoreApi } from './fixtures/mock-routes';

test.describe('Quick booking and rating features', () => {
  test('opens quick-booking modal and shows symptom/sort options', async ({ page }) => {
    await mockCoreApi(page);
    await page.goto('/doctors');

    await page.getByTestId('quick-booking-button').click();
    await expect(page.locator('text=احجز موعدك الآن')).toBeVisible();
    await expect(page.locator('text=من ما تعاني؟')).toBeVisible();
    await expect(page.locator('text=الترتيب حسب')).toBeVisible();
    await expect(page.getByTestId('quick-book-symptom')).toBeVisible();
  });

  test('selects symptoms and submits quick-booking', async ({ page }) => {
    await mockCoreApi(page);
    await page.goto('/doctors');

    await page.getByTestId('quick-booking-button').click();

    await page.getByTestId('quick-book-symptom').selectOption('الحمى');
    await expect(page.getByTestId('quick-book-symptom')).toHaveValue('الحمى');

    // Select sort option
    await page.getByTestId('sort-highest-rating').check();
    await expect(page.getByTestId('sort-highest-rating')).toBeChecked();

    // Submit symptoms
    await page.getByTestId('quick-book-submit').click();

    // Should show doctor confirmation screen with auto-picked same-day slot
    const confirmHeading = page.locator('h3.font-bold.text-gray-900').filter({ hasText: 'تأكيد الحجز' }).first();
    await expect(confirmHeading).toBeVisible();

    // Doctor name and same-day slot should be visible in cyan card
    const doctorCard = page.locator('div.bg-cyan-50');
    await expect(doctorCard).toContainText('د. سارة أحمد');
    await expect(doctorCard).toContainText('أقرب موعد متاح اليوم');
    await expect(doctorCard).toContainText('09:00');
  });
});


