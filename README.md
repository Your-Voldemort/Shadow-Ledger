[![Build Status](https://img.shields.io/badge/Project-Shadow--Ledger-blue?style=flat-square)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

# Shadow-Ledger

A blockchain-powered Digital Land Record Management System that creates a tamper-proof, transparent ledger of land ownership and transactions.

> Shadow-Ledger replaces error-prone, manual paper-based land registries with a secure digital solution. It provides dedicated portals for **Citizens** and **Government Officials**, paired with a simulated blockchain layer to guarantee the immutability of transaction records.

[Overview](#overview) • [Features](#features) • [Quick Start](#quick-start) • [Manual Setup](#manual-setup) • [Architecture](#architecture) • [Documentation](#documentation)

## Overview

Land disputes and fraud exist due to manual paper-based records that are error-prone, easily manipulated, lack transparency, and require slow verification processes. Shadow-Ledger addresses these issues by providing:

- **Dual Portals**: Separate interfaces for citizens and government officials
- **Immutable Records**: Every land transfer creates a cryptographic hash chain block
- **Document Verification**: Off-chain storage with on-chain hash verification
- **Real-time Tracking**: Monitor transfer status from initiation to completion

## Features

### Citizen Portal

| Feature | Description |
|---------|-------------|
| **Dashboard** | View all owned land properties, current status, and full transaction history |
| **Initiate Transfers** | Start land transfer requests to buyers with document uploads |
| **Track Status** | Monitor transfer progress: Pending -> Under Review -> Approved/Rejected |

### Government Portal

| Feature | Description |
|---------|-------------|
| **Review Queue** | View and review pending land transfer requests |
| **Approve/Reject** | Process transfers; approval triggers blockchain transaction |
| **Audit Trail** | Complete chronological history of all transfers |

### Blockchain Layer

- **Immutable Ledger**: Each transfer mints a new block with SHA-256 cryptographic linking
- **Public Verification**: Anyone can verify land records using a property ID
- **Hash Proof**: Documents stored off-chain (Supabase) with their hashes on-chain

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [Supabase](https://supabase.com/) account (for document storage)
- PowerShell (Windows) — optional, for the startup script

### One-Click Startup (Windows)

```powershell
# First-time setup: install dependencies and start servers
.\start.ps1 -Install

# Subsequent runs
.\start.ps1
```

This script starts both the backend (`http://localhost:8000`) and frontend (`http://localhost:3000`) servers.

## Manual Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

> [!TIP]
> Use these demo accounts to test the system:
> - **Citizen**: `citizen@example.com` / `password123`
> - **Government**: `govt@example.com` / `password123`

## Architecture

```
Shadow-Ledger/
├── backend/                 # Python FastAPI application
│   ├── app/
│   │   ├── routers/         # Auth, Properties, Transfers, Blockchain APIs
│   │   ├── models.py        # SQLAlchemy ORM models
│   │   └── database.py      # SQLite database configuration
│   └── blockchain/          # Simulated blockchain implementation
│       └── blockchain.py    # SHA-256 hash chain ledger
├── frontend/                # Next.js 14 / React 18
│   ├── app/
│   │   ├── citizen/         # Citizen dashboard and transfers
│   │   ├── government/      # Government review portal
│   │   └── verify/          # Public land record verification
│   └── tailwind.config.js   # Styling configuration
├── PRD.md                   # Product Requirements Document
└── start.ps1                # Startup script
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| Backend | Python 3.10+, FastAPI, SQLAlchemy, Pydantic |
| Blockchain | Custom Python implementation (SHA-256 hash chains) |
| Database | SQLite |
| Storage | Supabase (off-chain document storage) |

### Data Flow

1. **Citizen** initiates transfer → uploads document to Supabase → creates transfer request
2. **Government** reviews request → verifies documents → approves/rejects
3. **On Approval**: Backend hashes document, creates blockchain block, updates ownership
4. **Verification**: Public endpoint fetches blockchain history for any property ID

## Documentation

For detailed information about system architecture, database schema, user stories, and the demo walkthrough, see:

- [Product Requirements Document (PRD.md)](./PRD.md)

## License

This project is licensed under the terms found in the `LICENSE` file.