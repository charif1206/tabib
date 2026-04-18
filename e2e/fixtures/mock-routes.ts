import { Page, Route } from '@playwright/test';
import {
  mockBookingsAppointments,
  mockCalendar,
  mockDashboard,
  mockDoctorProfile,
  mockDoctors,
  mockRequestsAppointments,
} from './mock-data';

type MockOptions = {
  bookingPostStatus?: number;
  bookingPostError?: string;
  doctorUnauthorized?: boolean;
};

function json(route: Route, payload: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });
}

function getPathname(url: string) {
  const noOrigin = url.replace(/^https?:\/\/[^/]+/i, '');
  const [pathOnly] = noOrigin.split('?');
  const normalized = pathOnly.replace(/\/+$/, '');
  return normalized || '/';
}

export async function mockCoreApi(page: Page, options: MockOptions = {}) {
  const { bookingPostStatus = 201, bookingPostError = 'Slot is not available', doctorUnauthorized = false } = options;

  await page.route('**/api/**', async (route) => {
    try {
      const request = route.request();
      const method = request.method();
      const requestUrl = request.url();
      const pathname = getPathname(requestUrl);

      if (doctorUnauthorized && pathname.startsWith('/api/doctor/')) {
        return json(route, { error: 'Unauthorized' }, 401);
      }

      if (pathname === '/api/doctors' && method === 'GET') {
        return json(route, { doctors: mockDoctors });
      }

      if (pathname.startsWith('/api/doctors/') && method === 'GET') {
        const doctorId = pathname.split('/').pop();
        if (doctorId === mockDoctorProfile.id) {
          return json(route, { doctor: mockDoctorProfile });
        }
        return json(route, { error: 'Doctor not found' }, 404);
      }

      if (pathname === '/api/doctor/dashboard' && method === 'GET') {
        return json(route, mockDashboard);
      }

      if (pathname === '/api/doctor/appointments' && method === 'GET') {
        if (requestUrl.includes('type=requests')) {
          return json(route, { appointments: mockRequestsAppointments });
        }

        if (requestUrl.includes('type=bookings')) {
          return json(route, { appointments: mockBookingsAppointments });
        }
      }

      if (pathname === '/api/doctor/calendar' && method === 'GET') {
        return json(route, mockCalendar);
      }

      if (pathname.startsWith('/api/doctor/appointments/') && method === 'PATCH') {
        return json(route, {
          appointment: {
            id: pathname.split('/').pop(),
            status: 'updated',
          },
        });
      }

      if (pathname === '/api/appointments' && method === 'POST') {
        if (bookingPostStatus >= 400) {
          return json(route, { error: bookingPostError }, bookingPostStatus);
        }

        return json(route, { appointment: { id: 'apt-new-1', status: 'pending' } }, bookingPostStatus);
      }

      return json(route, { error: `No mock for ${method} ${pathname}` }, 500);
    } catch (error) {
      return json(route, { error: `Mock route failed: ${(error as Error).message}` }, 500);
    }
  });
}




