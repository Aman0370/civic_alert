# CivicAlert

A real-time civic safety platform connecting citizens and police through verified incident reporting and severity-scaled area alerts.

Citizens register with an authenticated email and a government ID number, then report suspicious activity — with photo, video, or text — straight to their nearest police station. An officer reviews every report before anything becomes public: once verified, the platform generates a live alert radius (0.5km–5km, scaled to severity) and pushes it to nearby citizens in real time.

## How it works

1. **Citizen registers** — email OTP verification + government ID (Aadhaar) format/checksum validation. The raw ID number is never stored, only a salted one-way hash.
2. **Citizen files a report** — title, category, description, photo/video, and GPS location. It's auto-routed to the nearest station by great-circle distance.
3. **Officer reviews it** — moves the report to "under review" (the citizen gets notified instantly), then either verifies it with a severity level or rejects it with a reason.
4. **Verification triggers an alert** — severity sets the radius (low 0.5km, medium 1km, high 2km, critical 5km) and an expiry window. Every citizen with a live location inside that radius gets a real-time push notification, and the incident appears on the public live map.

## Architecture

```
civicalert/
├── backend/     Node.js + Express + PostgreSQL (Sequelize) + Socket.io
└── frontend/    React (Vite) + Tailwind CSS + Leaflet + Socket.io client
```

**Backend stack**
- PostgreSQL via Sequelize ORM
- JWT auth, bcrypt password hashing
- Socket.io for real-time notifications and live map alerts
- Cloudinary for photo/video storage (via multer)
- Nodemailer for OTP emails (falls back to console logging in dev if SMTP isn't configured)
- Haversine formula for distance/radius math — no PostGIS dependency needed

**Frontend stack**
- React 18 + Vite
- Tailwind CSS (custom "dispatch console" design system — see `tailwind.config.js`)
- React Leaflet for the live incident map with severity-radius circles
- Socket.io client for live notifications

## Local setup

### 1. Database
Create a PostgreSQL database (locally, or a free instance on Railway/Supabase/Neon).

### 2. Backend
```bash
cd backend
cp .env.example .env       # fill in DATABASE_URL, JWT_SECRET, Cloudinary keys, SMTP (optional)
npm install
npm run seed                # creates 2 demo stations + a demo citizen/officer login
npm run dev                 # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

### Demo logins (after running `npm run seed`)
- Citizen — `citizen@demo.com` / `Password123!`
- Officer — `officer@demo.com` / `Password123!`

To register a new authority account yourself, you'll need the `AUTHORITY_SIGNUP_CODE` value from your `.env` file — this simulates an admin-issued onboarding code for station staff.

## Notes on the government ID handling

This project validates Aadhaar-style numbers using the public **Verhoeff checksum algorithm** (the same one UIDAI uses to catch typos) — this confirms the number is *well-formed*, not that it belongs to a real, matching identity. True identity verification would require UIDAI's licensed eKYC API, which is a regulated government integration outside the scope of a student/portfolio project. The raw number is never persisted; only a salted HMAC hash (for uniqueness checks) and a masked display value (`XXXX-XXXX-1234`) are stored.

## Deployment

The original CivicAlert build was deployed with the backend on **Railway** (which also hosts the PostgreSQL instance) and the frontend on **Vercel**. Set `VITE_API_URL` and `VITE_SOCKET_URL` in the frontend's environment to point at your deployed backend, and `CLIENT_URL` in the backend's environment to your deployed frontend origin (for CORS).

## Possible next steps

- Admin panel for provisioning station/officer accounts instead of the shared signup code
- Push notifications (web push / FCM) in addition to in-app Socket.io alerts
- Heatmap view of report density per station jurisdiction
- Rate-limiting + anti-abuse scoring on report submission to deter spam reports
