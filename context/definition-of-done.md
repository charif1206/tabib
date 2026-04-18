# Definition of Done

Last verified: 2026-04-18
Source of truth: yes

## Booking lifecycle ready when
- Patient can search doctors
- Patient can create booking request
- Doctor can view requests and bookings
- Doctor can accept/reject/reschedule
- Patient can cancel/accept_reschedule/reject_reschedule
- Calendar shows booked vs free weekly slots

## Engineering DoD
- Type checks pass
- Build passes
- Auth checks enforced on protected endpoints
- Context docs updated when behavior or API changes

## Documentation rule (source of trust)
- Before/with any feature change, update relevant file in `context/`
- If API changes, update `context/api-design.md`
- If flow changes, update `context/workflows.md`
- If completion criteria changes, update `context/definition-of-done.md`

