# OmniLock Backend — Implementation README

This README documents the full implementation journey carried out in this workspace for the OmniLock software solution (backend-focused), including file creation order, module responsibilities, breakdown of implementation, and integration testing process.

---

## 1) Implementation Workflow (Serial Order)

The following sequence reflects the implementation flow used during development.

### Phase A — Workspace and Backend Foundation
1. Created project folders:
   - `backend/`, `api-docs/`, `database/`, `frontend-user/`, `frontend-locker/`
2. Created backend skeleton folders under `backend/src/`:
   - `config/`, `middleware/`, `routes/`, `controllers/`, `services/`, `repositories/`, `jobs/`, `utils/`, `validators/`
3. Created backend setup files:
   - `backend/package.json`
   - `backend/server.js`
   - `backend/src/app.js`
   - `backend/.env.example`
   - `backend/.gitignore`

### Phase B — Core Configuration and Security Primitives
4. Added configuration files:
   - `backend/src/config/env.js`
   - `backend/src/config/db.js`
   - `backend/src/config/mqtt.js`
5. Added utility primitives:
   - `backend/src/utils/jwt.js`
   - `backend/src/utils/httpError.js`
6. Added middleware:
   - `backend/src/middleware/auth.js`
   - `backend/src/middleware/adminOnly.js`
   - `backend/src/middleware/rateLimiter.js`
   - `backend/src/middleware/validate.js`

### Phase C — Auth Module (End-to-End)
7. Added auth validator:
   - `backend/src/validators/auth.validator.js`
8. Added user repository:
   - `backend/src/repositories/user.repo.js`
9. Added auth service:
   - `backend/src/services/auth.service.js`
10. Added auth controller and route:
   - `backend/src/controllers/auth.controller.js`
   - `backend/src/routes/auth.routes.js`
11. Wired `/me` and auth routes in app:
   - updated `backend/src/app.js`

### Phase D — Database Schema Migrations
12. Added migration files in order:
   - `database/migrations/001_create_users.sql`
   - `database/migrations/002_create_locations_lockers.sql`
   - `database/migrations/003_create_bookings.sql`
   - `database/migrations/004_create_access_grants.sql`
   - `database/migrations/005_create_otp_challenges.sql`
   - `database/migrations/006_create_payments.sql`
   - `database/migrations/007_create_biometrics.sql`
   - `database/migrations/008_create_devices.sql`
   - `database/migrations/009_create_events_logs.sql`
   - `database/migrations/010_create_device_telemetry.sql`

### Phase E — Discovery + Booking Core APIs
13. Added repositories:
   - `backend/src/repositories/location.repo.js`
   - `backend/src/repositories/locker.repo.js`
   - `backend/src/repositories/plan.repo.js`
   - `backend/src/repositories/booking.repo.js`
14. Added discovery modules:
   - `backend/src/services/discovery.service.js`
   - `backend/src/controllers/discovery.controller.js`
   - `backend/src/routes/discovery.routes.js`
15. Added booking modules:
   - `backend/src/services/booking.service.js`
   - `backend/src/controllers/bookings.controller.js`
   - `backend/src/validators/booking.validator.js`
   - `backend/src/routes/bookings.routes.js`
16. Wired discovery/booking routes in app:
   - updated `backend/src/app.js`

### Phase F — Payments Module
17. Added payment components:
   - `backend/src/repositories/payment.repo.js`
   - `backend/src/utils/webhook.js`
   - `backend/src/services/payment.service.js`
   - `backend/src/controllers/payments.controller.js`
   - `backend/src/validators/payment.validator.js`
   - `backend/src/routes/payments.routes.js`
18. Wired payment routes:
   - updated `backend/src/app.js`

### Phase G — OTP + Access Control + Device Security
19. Added OTP/MQTT/SMS utilities:
   - `backend/src/utils/otp.js`
   - `backend/src/utils/sms.js`
   - `backend/src/utils/mqttPublish.js`
20. Added repositories:
   - `backend/src/repositories/otp.repo.js`
   - `backend/src/repositories/device.repo.js`
   - `backend/src/repositories/event.repo.js`
21. Added device auth and validators:
   - `backend/src/middleware/deviceAuth.js`
   - `backend/src/validators/otp.validator.js`
   - `backend/src/validators/access.validator.js`
22. Added services/routes/controllers:
   - `backend/src/services/otp.service.js`
   - `backend/src/services/access.service.js`
   - `backend/src/controllers/access.controller.js`
   - `backend/src/routes/otp.routes.js`
   - `backend/src/routes/access.routes.js`
23. Enhanced JWT for unlock token:
   - updated `backend/src/utils/jwt.js`
24. Updated env requirements:
   - updated `backend/src/config/env.js`
   - updated `backend/.env.example`
25. Wired routes in app:
   - updated `backend/src/app.js`

### Phase H — Scheduler + Device Events + Biometric + Admin
26. Added booking expiry scheduler:
   - `backend/src/services/scheduler.service.js`
   - `backend/src/jobs/bookingExpiry.job.js`
   - updated `backend/server.js`
27. Added device endpoints:
   - `backend/src/services/device.service.js`
   - `backend/src/controllers/device.controller.js`
   - `backend/src/validators/device.validator.js`
   - `backend/src/routes/device.routes.js`
   - updated `backend/src/app.js`
28. Added biometric endpoints:
   - `backend/src/services/biometric.service.js`
   - `backend/src/controllers/biometric.controller.js`
   - `backend/src/validators/biometric.validator.js`
   - `backend/src/routes/biometric.routes.js`
   - existing `backend/src/repositories/biometric.repo.js` used
29. Added booking extension endpoint:
   - updated `backend/src/services/booking.service.js`
   - updated `backend/src/controllers/bookings.controller.js`
   - updated `backend/src/validators/booking.validator.js`
   - updated `backend/src/routes/bookings.routes.js`
30. Added admin modules:
   - `backend/src/services/admin.service.js`
   - `backend/src/controllers/admin.controller.js`
   - `backend/src/validators/admin.validator.js`
   - `backend/src/routes/admin.routes.js`
   - updated repositories for admin queries
31. Fixed route scoping issue:
   - mounted admin router at `/admin` in `backend/src/app.js`
   - changed admin route file to use relative paths in `backend/src/routes/admin.routes.js`

### Phase I — Testing + API Documentation + CI
32. Added integration test setup and suites:
   - `backend/tests/setupEnv.js`
   - `backend/tests/integration/auth.integration.test.js`
   - `backend/tests/integration/booking-payment.integration.test.js`
   - `backend/tests/integration/security-admin.integration.test.js`
   - updated `backend/package.json` test script
33. Added OpenAPI docs:
   - `api-docs/openapi.yaml`
   - `api-docs/README.md`
34. Added Postman collection:
   - `api-docs/omnilock.postman_collection.json`
35. Added CI workflow:
   - `.github/workflows/backend-ci.yml`

---

## 2) Which File Does What

## Root-Level
- `README.md` (this file): project implementation log + technical guide.
- `omnilock-backend-plan.md`: planning/spec interpretation source used for implementation.
- `.github/workflows/backend-ci.yml`: runs backend tests on push/PR.

## Backend Runtime
- `backend/server.js`: application bootstrap, DB connection check, HTTP server start, cron startup, graceful shutdown.
- `backend/src/app.js`: middleware stack, route registration, health endpoint, 404 + global error handling.

## Config
- `backend/src/config/env.js`: environment variable loading and validation.
- `backend/src/config/db.js`: PostgreSQL `pg` pool + query helper.
- `backend/src/config/mqtt.js`: MQTT client connection/reconnect behavior.

## Middleware
- `auth.js`: JWT bearer validation and `req.user` population.
- `adminOnly.js`: role guard for admin routes.
- `deviceAuth.js`: validates `x-device-secret` for device endpoints.
- `rateLimiter.js`: auth/otp/access route-specific throttling.
- `validate.js`: request body schema validation via Joi.

## Utilities
- `jwt.js`: sign/verify access + refresh + short unlock tokens.
- `otp.js`: OTP generation/hash/verify.
- `httpError.js`: standardized typed HTTP error creation.
- `webhook.js`: payment webhook HMAC signature verification.
- `mqttPublish.js`: publish unlock/lock commands to locker topics.
- `sms.js`: SMS sending wrapper (integration stub currently).

## Repositories (SQL/Data Access)
- `user.repo.js`: user lookup/create.
- `location.repo.js`: list/create locations.
- `locker.repo.js`: list/search/detail/update lockers, status transitions.
- `plan.repo.js`: plan lookup/list/create.
- `booking.repo.js`: booking create/list/detail/activate/expire/extend lookups.
- `payment.repo.js`: payment transaction create/update/history.
- `accessGrant.repo.js`: grant create/find active/expire.
- `otp.repo.js`: OTP challenge create/fetch/increment/mark used.
- `device.repo.js`: device nonce management + telemetry.
- `event.repo.js`: access attempt logs, door events, audit aggregation.
- `biometric.repo.js`: biometric enrollment persistence.

## Services (Business Logic)
- `auth.service.js`: register/login/refresh/me logic.
- `discovery.service.js`: locations/lockers query logic.
- `booking.service.js`: quote/create/fetch/extend logic.
- `payment.service.js`: checkout + webhook processing + activation/idempotency.
- `otp.service.js`: request/verify OTP and enrollment OTP process.
- `access.service.js`: access decision, nonce replay prevention, unlock publish.
- `device.service.js`: event/telemetry handling.
- `biometric.service.js`: biometric registration checks + persistence.
- `admin.service.js`: admin operations (locations, lockers, audit, unlock, plans).
- `scheduler.service.js`: booking expiry processing pipeline.

## Controllers (HTTP Layer)
Controllers translate request/response and delegate to services:
- `auth.controller.js`, `discovery.controller.js`, `bookings.controller.js`, `payments.controller.js`,
  `otp.controller.js`, `access.controller.js`, `device.controller.js`, `biometric.controller.js`, `admin.controller.js`.

## Routes
Route modules define endpoint paths and middleware chains:
- `auth.routes.js`, `discovery.routes.js`, `bookings.routes.js`, `payments.routes.js`,
  `otp.routes.js`, `access.routes.js`, `device.routes.js`, `biometric.routes.js`, `admin.routes.js`.

## Validators
Input validation schemas:
- `auth.validator.js`, `booking.validator.js`, `payment.validator.js`, `otp.validator.js`,
  `access.validator.js`, `device.validator.js`, `biometric.validator.js`, `admin.validator.js`.

## Jobs
- `jobs/bookingExpiry.job.js`: cron job (`* * * * *`) for booking expiration workflow.

## Database
- `database/migrations/*.sql`: schema migration scripts for all entities (users, lockers, plans, bookings, grants, payments, OTP, devices, biometrics, events, telemetry).

## API Docs
- `api-docs/openapi.yaml`: OpenAPI 3.0 API contract.
- `api-docs/omnilock.postman_collection.json`: importable Postman collection.
- `api-docs/README.md`: docs usage instructions.

## Tests
- `tests/setupEnv.js`: default env setup for tests.
- `tests/integration/*.integration.test.js`: route-level integration tests via Supertest.

---

## 3) Detailed Breakdown of Implementation

### 3.1 Architecture Used
- Strict layered architecture: **Routes → Controllers → Services → Repositories**.
- SQL lives only in repositories.
- Business rules live in services.
- Controllers remain thin and protocol-focused.

### 3.2 Security Measures Implemented
- JWT auth for user/admin routes.
- Admin route protection with role middleware.
- Device endpoint protection with shared-secret header.
- OTP hash storage (never plaintext), attempt limits, expiration checks.
- Payment webhook signature validation via HMAC.
- Route-level rate limiting for auth/otp/access.
- Nonce-based replay protection in access decision flow.

### 3.3 Booking & Payment Flow
1. User requests quote (`/bookings/quote`).
2. User creates pending booking (`/bookings`).
3. User initiates checkout (`/payments/checkout`) and receives redirect URL.
4. Webhook callback (`/payments/webhook`) validates signature.
5. On successful payment:
   - payment status updated,
   - booking activated,
   - access grant created,
   - locker status set to `OCCUPIED`.

### 3.4 OTP & Access Flow
1. User requests OTP (`/otp/request`) with active grant check.
2. OTP challenge is stored hashed and sent via SMS wrapper.
3. User verifies OTP (`/otp/verify`) and receives short unlock token.
4. Device calls `/access/decision` with nonce.
5. Backend validates grant + nonce, increments nonce, publishes unlock token to MQTT, logs access attempt.

### 3.5 Scheduler Flow
- Cron runs every minute.
- Finds `ACTIVE` bookings with expired end time.
- Expires booking and associated access grants.
- Updates locker to `LOCKED_EXPIRED`.
- Publishes lock command via MQTT.

### 3.6 Admin + Device Observability
- Admin can manage locations, lockers, maintenance, subscription plans.
- Admin can trigger emergency unlock token publish.
- Admin audit combines access attempts and door events with pagination.
- Device events/telemetry endpoints are available and persisted.

### 3.7 Documentation & Delivery Readiness
- OpenAPI contract generated.
- Postman collection generated.
- CI workflow added to run backend tests automatically.

---

## 4) Integration Testing Process

### 4.1 Test Stack
- **Jest** as test runner.
- **Supertest** for HTTP-level route integration tests.
- Environment bootstrap through `tests/setupEnv.js`.

### 4.2 Strategy Used
- Validate end-to-end route behavior and middleware chains without needing live external infrastructure.
- Keep tests deterministic by mocking service layer responses where needed.
- Cover representative success and validation/security cases.

### 4.3 Test Suites Added
1. `auth.integration.test.js`
   - Health endpoint
   - Register route
   - Login validation
   - Authenticated profile fetch
2. `booking-payment.integration.test.js`
   - Quote/create booking
   - Checkout
   - Webhook processing route
3. `security-admin.integration.test.js`
   - OTP request
   - Access decision via device secret
   - Device events
   - Admin route protection/access
   - Biometric registration route

### 4.4 Commands Used
From `backend/`:
```bash
npm test
```

### 4.5 Outcome
- All integration suites passed during final run:
  - 3 test suites
  - 13 tests
  - 0 failures

---

## Running the Backend Locally

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```
Fill required secrets in `.env`.

3. Apply SQL migrations in `database/migrations/` to your PostgreSQL instance.

4. Start backend:
```bash
npm run dev
```

5. Run tests:
```bash
npm test
```

---

## Notes
- Hardware integration is intentionally out of scope for this stage.
- MQTT/SMS integrations are software-side ready; real provider wiring can be plugged in next.
- OpenAPI and Postman reflect currently implemented endpoints.

## Connect to Supabase PostgreSQL

1. In `backend/.env`, set `DATABASE_URL` to the Supabase **pooler** connection string (IPv4-friendly):
```dotenv
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
```
If your password contains special characters (e.g. `@`), URL-encode them (e.g. `@` -> `%40`).

2. Test DB connectivity from project root:
```bash
DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' backend/.env)"
psql "$DATABASE_URL" -c "select now();"
```

3. Run migrations in order from `database/migrations`:
```bash
export DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' backend/.env)"
for f in database/migrations/*.sql; do
   echo "Applying $f"
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
psql "$DATABASE_URL" -c "\dt"
```

4. Start backend after migrations:
```bash
cd backend
npm run dev
```

## Seed Dummy Data (All Tables)

After migrations are applied, run the seed file to insert linked dummy records into all tables.

1. Apply seed SQL:
```bash
export DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' backend/.env)"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/seeds/001_dummy_data.sql
```

2. Quick verification:
```bash
psql "$DATABASE_URL" -c "select count(*) as users_count from users;"
psql "$DATABASE_URL" -c "select count(*) as bookings_count from bookings;"
psql "$DATABASE_URL" -c "select count(*) as telemetry_count from device_telemetry;"
```

Notes:
- The seed is idempotent (uses fixed UUIDs + `ON CONFLICT`), so it can be re-run safely.
- Dummy users are `demo.user@omnilock.local` and `demo.admin@omnilock.local`.

## Share Supabase DB with Teammates

1. Add teammates in Supabase project members (Developer role is enough for app development).
2. Share `DATABASE_URL` securely (password manager/private channel), never in Git or public chat.
3. Keep real secrets only in each developer's local `backend/.env`.
4. Keep `backend/.env.example` with placeholders only.
5. One teammate runs migrations on the shared DB; others can then run the backend normally.
6. If credentials are exposed, rotate the DB password in Supabase and update everyone’s `DATABASE_URL`.

