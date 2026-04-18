# Tech Stack

Last verified: 2026-04-18
Source of truth: yes

## Core
- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Runtime: Node.js
- Styling: Tailwind CSS

## Client Libraries
- React Query (`@tanstack/react-query`) for server state
- Zustand for UI state
- React Hook Form for forms
- Lucide React for icons

## Backend / Data
- Firebase Admin SDK (Firestore)
- Firebase Client SDK
- JWT auth via httpOnly cookie (`token`)

## Key npm scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Environment (expected)
- Firebase public keys (`NEXT_PUBLIC_FIREBASE_*`)
- Firebase admin keys (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- Optional `JWT_SECRET`

