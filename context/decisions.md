# Decisions

Last verified: 2026-04-18
Source of truth: yes

## D-001: Auth via JWT cookie
- Decision: use `token` httpOnly cookie + `getSession()`
- Why: simple role-based auth for both patient/doctor

## D-002: Firestore as primary store
- Decision: keep all booking entities in Firestore
- Why: already integrated with Firebase Admin SDK

## D-003: React Query for server state
- Decision: all list/detail/mutation data flows use React Query
- Why: caching + invalidation after mutations

## D-004: Zustand for UI-only state
- Decision: transient selection/search states stay in Zustand
- Why: avoid overloading query cache for local UI concerns

## D-005: Booking statuses are fixed enum
- Decision: allowed statuses:
  - pending
  - accepted
  - rejected
  - rescheduled
  - completed
  - no_show
  - cancelled
- Why: consistent transitions across doctor/patient flows

