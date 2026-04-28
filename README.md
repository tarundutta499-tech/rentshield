# RentShield

Modern legal-tech SaaS for landlords and tenants to manage rental agreements, disputes, and rental reputation.

## Tech
- **Frontend**: React (Vite) + React Router + MUI (clean legal-tech theme)
- **Backend**: Node.js (Express)
- **Database/Auth/Storage**: Firebase (Auth + Firestore + Storage)

## Monorepo layout
- `apps/web` — React app
- `apps/api` — Express API (legal notice generation + health)

## Prereqs
- Node.js 18+ (recommended 20+)
- A Firebase project (Web app + Firestore + Storage enabled)

## Setup
1. Install dependencies

```bash
cd rentshield
npm install
```

2. Configure environment variables

Create `apps/web/.env` (or copy from `apps/web/.env.example`):

```bash
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
VITE_API_BASE_URL="http://localhost:5179"
```

Create `apps/api/.env`:

```bash
PORT=5179
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

3. Run dev servers

```bash
# terminal A
npm run dev:web

# terminal B
npm run dev:api
```

Open the app at `http://localhost:5173`.

## Go-live checklist (minimum)
- **Set your Firebase project id** in `.firebaserc` (`YOUR_FIREBASE_PROJECT_ID`).
- **Deploy Firestore + Storage rules** (included in `firestore.rules` and `storage.rules`).
- **Enable Firestore + Storage** in Firebase Console and set secure billing limits.
- **Set Firebase Auth providers** you plan to support (Email/Password and optionally Phone).
- **Set authorized domains** for Auth (your production domain).
- **Deploy frontend** (Firebase Hosting recommended).
- **Deploy API** and set `VITE_API_BASE_URL` to the production API URL.

## Deploy (Firebase Hosting)
1. Install Firebase CLI and login:

```bash
npm i -g firebase-tools
firebase login
```

2. Select your project:

```bash
firebase use --add
```

3. Build and deploy:

```bash
npm run build:web
firebase deploy
```

## Notes
- This starter uses **Firebase Auth** (email/password + phone OTP) and stores **user roles** (Tenant/Landlord) in Firestore.
- Agreement upload supports PDF to Firebase Storage and stores metadata in Firestore; “Agreement Health Score” is a heuristic placeholder you can later replace with an OCR/LLM pipeline.
- Disputes include category, evidence uploads, and a simple message thread between parties.

