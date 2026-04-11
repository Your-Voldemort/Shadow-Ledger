# Shadow-Ledger

A blockchain-powered Digital Land Record Management System for secure, transparent, and immutable land ownership tracking. 

## Overview
Shadow-Ledger is designed to replace traditional paper-based land registries with a tamper-proof digital solution. It offers dedicated portals for **Citizens** and **Government Officials**, recording each property transaction on a simulated blockchain to guarantee immutability. Off-chain elements like PDFs and identity documents are stored efficiently using Supabase.

## Features

- **Citizen Portal**: Citizens can access an overview of their verified properties, initiate transfer requests to buyers (using their Aadhaar-like IDs), upload documents, and track transfer statuses in real time.
- **Government Portal**: Officials can efficiently review a queue of pending transfers, assess associated documentation, and either approve or reject requests. Actions taken create a permanent audit trail.
- **Immutable Blockchain Ledger**: Every successful property transfer mints a new block containing cryptographic hashes linking the current and previous owners, ensuring absolute proof of ownership history.
- **Public Verification**: A unified interface enables public verification of land records and their cryptographic proofs to restore trust in local land registries.

## Project Structure

```
Shadow-Ledger/
├── backend/          # Python 3 / FastAPI Application
│   ├── app/         # FastAPI structure (routers, models, logic)
│   ├── blockchain/  # Simulated Blockchain implementation
│   └── requirements.txt
├── frontend/         # Next.js 14 / React 18 Application
│   ├── app/         # App Router (Citizen, Government, Login flows)
│   ├── lib/         # API integrations, Utilities & Types
│   └── package.json
├── PRD.md           # Product Requirements Document
└── start.ps1        # PowerShell startup script (Backend+Frontend)
```

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic
- **Database**: SQLite (built-in relational data management)
- **Blockchain**: Locally simulated SHA-256 cryptographic hash chain
- **Storage**: Supabase (used as an off-chain store for PDFs/documents)

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PowerShell (Windows) - Optional for quick start

### One-Click Startup (Windows)
A handy PowerShell script is available for quickly spinning up both the backend and frontend at the same time:
```powershell
.\start.ps1 -Install   # First-time setup (installs deps and starts servers)
.\start.ps1            # Start servers after initial setup
```

### Manual Setup

**1. Backend Setup**
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*The API will be available at http://localhost:8000.*

**2. Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
*The Application will be available at http://localhost:3000.*

## Documentation
For more in-depth application flow details, architectural designs, and the database schema, please refer to the [Product Requirements Document (PRD.md)](./PRD.md).