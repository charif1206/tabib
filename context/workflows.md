# Workflows

Last verified: 2026-04-18
Source of truth: yes

## Patient booking workflow
1. Patient searches doctor (`GET /api/doctors`)
2. Patient opens doctor profile (`GET /api/doctors/:id`)
3. Patient sends booking request (`POST /api/appointments`)
4. Appointment created with `status=pending`

## Doctor management workflow
1. Doctor checks dashboard (`GET /api/doctor/dashboard`)
2. Doctor opens requests (`GET /api/doctor/appointments?type=requests`)
3. Doctor action (`PATCH /api/doctor/appointments/:id`)
   - accept -> accepted + confirmed_time
   - reject -> rejected
   - reschedule -> rescheduled + new_time

## Patient response to reschedule
1. Patient reviews appointment in profile
2. Patient action (`PATCH /api/appointments/:id`)
   - cancel
   - accept_reschedule
   - reject_reschedule

## Calendar workflow
1. Doctor opens calendar (`GET /api/doctor/calendar`)
2. Weekly slots rendered as booked/free

