# OmniLock Frontend (Integrated)

This frontend is created inside CapstoneProject450 and follows the Omnilock UI framework design style.

## Stack
- React + TypeScript + Vite
- Tailwind CSS v4
- Motion animations
- Sonner toast notifications
- Lucide icons

## Backend sync
The app is connected to these backend routes:
- /auth/*
- /locations, /lockers
- /plans
- /bookings/*
- /payments/*
- /otp/*
- /admin/*

## Component structure (feature based)

- `src/app/OmniLockApp.tsx` → main orchestrator for state + API calls
- `src/app/components/auth/AuthPanel.tsx` → `/auth/register`, `/auth/login`
- `src/app/components/mobile/DiscoveryPanel.tsx` → `/locations`, `/lockers`, `/lockers/:id`
- `src/app/components/mobile/BookingPanel.tsx` → `/bookings/quote`, `/bookings`, `/payments/checkout`, `/subscriptions/extend`
- `src/app/components/mobile/OtpAndBiometricPanel.tsx` → `/otp/request`, `/otp/verify`, `/otp/enrollment`, `/otp/verify-enrollment`, `/biometric/register`
- `src/app/components/mobile/DataPanels.tsx` → `/bookings`, `/payments/history`
- `src/app/components/admin/AdminPanel.tsx` → `/admin/locations`, `/admin/lockers`, `/admin/lockers/:id`, `/admin/unlock`, `/admin/subscription-plans`, `/admin/audit`, `/admin/devices`
- `src/app/components/tablet/TabletPanel.tsx` → tablet view tied to device flow docs (`/access/decision`, `/device/events`, `/device/telemetry`)
- `src/lib/api.ts` → centralized backend API client

Set API URL in `.env`:

```bash
cp .env.example .env
```

## Run

```bash
npm install
npm run dev
```

Default backend URL is `http://localhost:3000`.
