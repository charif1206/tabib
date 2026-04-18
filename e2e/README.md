# E2E tests (Playwright)

These tests focus on core flows only and mock all `/api/*` calls.

## Covered flows

- Doctor dashboard counters + requests/bookings tab + action confirmation
- Patient booking from doctors list to doctor profile
- Booking API error message path

## Run

1. Install dependencies and browser:
   - `npm install`
   - `npx playwright install chromium`
2. Run tests:
   - `npm run e2e`

