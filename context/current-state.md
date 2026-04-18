# Current State

Last verified: 2026-04-18
Source of truth: yes

## Implemented
- Patient can search doctors and view doctor profile slots
- Patient can create booking request (`pending`)
- Doctor dashboard endpoints exist and respond
- Doctor can list requests/bookings and update appointment status
- Doctor calendar endpoint returns weekly booked/free matrix
- Patient profile shows user data + appointments

## API status (core)
- `GET /api/doctors`
- `GET /api/doctors/:id`
- `POST /api/appointments`
- `PATCH /api/appointments/:id`
- `GET /api/me`
- `GET /api/doctor/dashboard`
- `GET /api/doctor/appointments?type=requests|bookings`
- `PATCH /api/doctor/appointments/:id`
- `GET /api/doctor/calendar`

## Known notes
- Keep status labels and transitions synced across UI/API/types
- Any new endpoint must be added to `context/api-design.md`

