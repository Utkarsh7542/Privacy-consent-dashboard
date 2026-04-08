# Consent Control Layer for DPDP

A hackathon prototype that puts users in control of their data consent. Every data request from an app passes through a consent check — allowed, denied, or flagged — with a plain-language AI explanation.

## What it does

- Users grant consent per app, per data type, and per purpose
- Users can add blocking rules (e.g. "never share contacts")
- When an app requests data, the system validates it in real time
- Every decision is logged in a tamper-visible audit log
- A Groq-powered AI explains each decision in plain language

## Quick start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your Groq API key to .env (free at console.groq.com)
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 3. Try the demo

Open the app, go to **Demo App** tab, and try the preloaded scenarios:
- `food_app` + `location` + `delivery` → **Allow**
- `food_app` + `location` + `analytics` → **Flag** (purpose mismatch)
- Any app + `contacts` → **Deny** (blocked by rule)

## Tech stack

| Layer | Tech |
|-------|------|
| Backend | Python FastAPI |
| Database | SQLite (no setup needed) |
| Frontend | React + Vite |
| AI explanations | Groq (llama-3.1-8b-instant) |

## Project structure

```
consent-layer/
├── backend/
│   ├── main.py         # All API routes
│   ├── database.py     # SQLite setup and queries
│   ├── ai.py           # Groq AI explainer
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx     # Full UI
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## DPDP alignment

This prototype implements three core DPDP principles:
- **Notice** — users see exactly what data each app accesses and why
- **Consent** — consent is specific (app + data type + purpose), not a blanket checkbox
- **Withdrawal** — users can revoke consent any time from the dashboard
