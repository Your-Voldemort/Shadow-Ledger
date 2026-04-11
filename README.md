# Shadow-Ledger

A blockchain-powered Digital Land Record Management System for secure, transparent land ownership tracking.

## Project Structure

```
Shadow-Ledger/
├── frontend/          # Next.js Frontend Application
│   ├── app/          # App Router pages
│   ├── components/   # Reusable UI components
│   └── lib/          # Utilities and API clients
├── backend/          # Python FastAPI Backend
│   ├── app/         # Application code
│   ├── models/      # Database models
│   ├── routers/     # API endpoints
│   └── blockchain/  # Simulated blockchain
└── PRD.md           # Product Requirements Document
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- SQLite (included)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: SQLite (relational data)
- **Blockchain**: Simulated SHA-256 hash chain
- **Storage**: Supabase (off-chain documents)

## Features

- **Citizen Portal**: View owned lands, initiate transfers, track status
- **Government Portal**: Review transfers, approve/reject, audit trail
- **Public Verification**: Verify land records with blockchain proof
- **Immutable Ledger**: Every transfer creates cryptographic 