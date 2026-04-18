# Architecture

Last verified: 2026-04-18
Source of truth: yes

## High-level
- App Router UI in `app/`
- API routes in `app/api/*`
- Auth/session helpers in `lib/auth.ts`
- Firestore access via `lib/firebase-admin.ts`
- Client-side API wrappers in `services/*`

## Route groups
- `app/(public)` public pages (doctor listing/profile/login/register)
- `app/(patient)` patient pages (profile, appointments)
- `app/(doctor)` doctor pages (dashboard, requests, bookings, calendar)

## Booking data model (Firestore)
- `users` (patients)
- `doctors`
- `appointments`

## Appointment lifecycle
- Create: patient -> `pending`
- Doctor actions: `accept`, `reject`, `reschedule`
- Patient actions: `cancel`, `accept_reschedule`, `reject_reschedule`

## Boundaries
- UI never writes Firestore directly
- UI calls API routes only
- API routes enforce role auth using JWT session

