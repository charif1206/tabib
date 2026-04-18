# API Design

Last verified: 2026-04-18
Source of truth: yes

## Public/Shared
- `GET /api/doctors`
  - Query: `q` (name/specialty search)
  - Returns: doctor list + `todayAvailableSlots` + optional `location { lat, lng }`

- `GET /api/doctors/:id`
  - Returns: doctor profile + available slots + optional `location { lat, lng }`

## Patient
- `POST /api/appointments`
  - Auth: patient only
  - Body: `{ doctorId, slot, appointmentDate, note? }`
  - Result: create appointment with `status=pending`

- `PATCH /api/appointments/:id`
  - Auth: patient owner only
  - Body: `{ action }`
  - Actions: `cancel`, `accept_reschedule`, `reject_reschedule`

- `GET /api/me`
  - Auth: required
  - Returns: authenticated user + appointments

## Doctor
- `GET /api/doctor/dashboard`
  - Auth: doctor only
  - Returns: request/bookings counters + doctor appointments

- `GET /api/doctor/appointments?type=requests|bookings`
  - Auth: doctor only
  - `requests` => pending only
  - `bookings` => accepted only

- `PATCH /api/doctor/appointments/:id`
  - Auth: doctor owner only
  - Body: `{ action, new_time? }`
  - Actions: `accept`, `reject`, `reschedule`

- `GET /api/doctor/calendar`
  - Auth: doctor only
  - Returns: weekly slot matrix (`booked`/`free`)

## Error style
- Common: `{ error: string }`
- Typical codes: `400`, `401`, `403`, `404`, `409`, `500`

