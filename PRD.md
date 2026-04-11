# Product Requirements Document (PRD)
## Digital Land Record Management System (Blockchain)
**Project Name**: Shadow-Ledger

---

## 1. Executive Summary

### Problem Statement
Land disputes and fraud exist due to manual paper-based records that are error-prone, easily manipulated, lack transparency, and require slow verification processes. Current centralized databases remain vulnerable to tampering and fail to provide a unified, verifiable history of ownership.

### Proposed Solution
A blockchain-powered Digital Land Record Management System creating a tamper-proof, transparent ledger of land ownership and transactions. The system provides separate portals for citizens and government officials, paired with a simulated blockchain layer for the hackathon to demonstrate immutable transaction recording. Off-chain document storage (via Supabase) securely handles PDFs, maps, and identity documents.

### Success Criteria
- **Flow Completion Rate**: 100% of judges can complete a full land transfer flow from initiation to final ownership update within the 6-hour hackathon demo constraint.
- **UI/UX Score**: Deliver a modern, sleek interface achieving immediate visual appeal and intuitive navigation.
- **Technical Soundness**: Architecture supports all core flows with clear separation between frontend, backend, blockchain simulation, and storage layers.
- **Transaction Immutability**: Every land transfer successfully creates an immutable record in the simulated blockchain with cryptographic linking.
- **Document Handling**: All supporting documents upload and link correctly to transactions off-chain without bloating the main ledger.

---

## 2. User Experience & Functionality

### User Personas
| Persona | Role | Goals |
|---------|------|-------|
| **Citizen** | Landowner or buyer | View land ownership records, initiate transfer requests, upload supporting documents, track transfer status |
| **Government Official** | Land registry officer | View pending transfer requests, verify documents, approve/reject transfers, view audit trail |
| **System Admin** | Demo manager | Seed initial data for the hackathon demo |

### User Stories & Acceptance Criteria

#### Citizen Portal
**Story 1: View Land Ownership**
*As a citizen, I want to view all land properties I own to verify my ownership records.*
- [ ] Dashboard displays list of owned lands (property ID, location, area, current status).
- [ ] Each land record shows full transaction history from the blockchain.

**Story 2: Initiate Land Transfer**
*As a citizen, I want to initiate a land transfer request so that I can sell my property.*
- [ ] User selects owned land to transfer.
- [ ] Form captures buyer details (name, aadhaar-like ID), sale price, and document upload.
- [ ] System generates unique transaction ID for tracking.

**Story 3: Track Transfer Status**
*As a citizen, I want to track my transfer request status.*
- [ ] Status displayed: Pending → Under Review → Approved/Rejected.
- [ ] Status updates reflect real-time government actions.

**Story 4: Verify Land Records (Public)**
*As any user, I want to verify a land record using a property ID.*
- [ ] Public search functionality returns current owner, history, and blockchain hash proof.
- [ ] Shows a "Verified" badge with cryptographic confirmation.

#### Government Portal
**Story 5: View & Review Pending Transfers**
*As a government official, I want to see all pending transfers and review documents.*
- [ ] Dashboard shows queue of pending transfers sorted by date.
- [ ] Clicking a request reveals seller verification, buyer details, and uploaded documents (opens in modal/new tab).

**Story 6: Approve/Reject Transfer**
*As a government official, I want to approve or reject a transfer request.*
- [ ] Approve action triggers the blockchain transaction and updates ownership permanently.
- [ ] Reject action requires a reason.
- [ ] Both actions create an immutable blockchain record with the official's credentials.

**Story 7: View Complete Audit Trail**
*As a government official, I want to see full transaction history.*
- [ ] Chronological list of all transfers with timestamps, hashes, from/to owners, and document hashes.

### Non-Goals (Out of Scope for Hackathon)
- Real blockchain integration (Hyperledger Fabric deployment) — simulated locally for speed.
- Court/revenue department legal system integration.
- Real biometric/Aadhaar authentication.
- Real payment gateway integration.

---

## 3. Technical Specifications

### Architecture Overview
- **Frontend Layer**: Next.js (App Router), Tailwind CSS.
- **Backend Layer**: Python (FastAPI/Flask) handling Auth, Logic, and APIs.
- **Blockchain Layer**: Simulated Python class implementing cryptographic hash chains.
- **Data Storage**: Supabase (Off-chain document storage) + SQLite/PostgreSQL (relational mapping & fast queries).

### Database Schema (SQLite/PostgreSQL)

**Users Table**
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password_hash` (String)
- `role` (Enum: 'CITIZEN', 'GOVERNMENT')
- `full_name` (String)
- `aadhaar_id` (String)

**Properties Table**
- `property_id` (String, Primary Key)
- `owner_id` (UUID, Foreign Key -> Users.id)
- `location_address` (String)
- `area_sqft` (Float)
- `status` (Enum: 'CLEAR', 'PENDING_TRANSFER')

**Transfer Requests Table**
- `transfer_id` (UUID, Primary Key)
- `property_id` (String, Foreign Key -> Properties.property_id)
- `seller_id` (UUID, Foreign Key -> Users.id)
- `buyer_aadhaar_id` (String)
- `agreed_price` (Float)
- `document_url` (String, Supabase URL)
- `status` (Enum: 'PENDING', 'APPROVED', 'REJECTED')
- `created_at` (Timestamp)

**Blockchain Ledger Table**
- `block_index` (Int, Primary Key)
- `timestamp` (Timestamp)
- `transaction_data` (JSON: from, to, property_id, doc_hash, approver_id)
- `previous_hash` (String)
- `hash` (String)

### REST API Endpoints (Python Backend)
- `POST /api/auth/login` - Authenticate users
- `GET /api/properties/me` - Fetch properties for logged-in citizen
- `POST /api/transfers/initiate` - Create a transfer request (Citizen)
- `GET /api/transfers/pending` - List all pending requests (Government)
- `POST /api/transfers/{id}/approve` - Approve transfer, mint block, update owner (Government)
- `POST /api/transfers/{id}/reject` - Reject transfer (Government)
- `GET /api/blockchain/verify/{property_id}` - Public endpoint to fetch block history of a property

### Data Storage Strategy
**On-Chain (Simulated Blockchain Ledger):**
- Ownership records
- Transaction hashes (from_owner, to_owner)
- Document hashes (verifying the off-chain document)
- Timestamps and Approver IDs

**Off-Chain (Supabase & DB):**
- Actual PDF agreements, maps, and ID images.
- User accounts and session states.
- Cached relational data for fast UI queries.

---

## 4. Blockchain Simulation Mechanics (Python implementation)
For the 6-hour hackathon, we will implement a custom `Blockchain` class in Python.
```python
import hashlib
import json
from time import time

class Block:
    def __init__(self, index, transaction_data, previous_hash):
        self.index = index
        self.timestamp = time()
        self.transaction_data = transaction_data  # Dict with transfer details
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.transaction_data,
            "previous": self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

class SimulatedBlockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self):
        return Block(0, "Genesis Block", "0")

    def add_block(self, transaction_data):
        previous_block = self.chain[-1]
        new_block = Block(len(self.chain), transaction_data, previous_block.hash)
        self.chain.append(new_block)
        return new_block
```

---

## 5. UI/UX Requirements
- **Theme**: Modern, sleek design. High contrast, dark/light mode toggle if possible.
- **Color Palette**:
  - Primary: Deep navy (#0F172A)
  - Accent: Emerald green (#10B981)
  - Warning: Amber (#F59E0B)
  - Error: Rose (#F43F5E)
  - Background: Slate-50 (#F8FAFC) to Slate-100 (#F1F5F9)
- **Components**: 
  - Status Pills (Amber=Pending, Green=Approved, Red=Rejected).
  - Data Tables for easy queue management.
  - File Dropzone for intuitive document uploads.
  - "Blockchain Visualizer" component to visually show blocks linking (high impact for hackathon judges).
- **Interactivity**: Skeleton loaders, seamless transitions, and immediate toast notifications.

---

## 6. Risks & Hackathon Execution Roadmap

### Timeline (6 Hours)
- **Hour 1**: Database schema setup, Next.js boilerplate, Supabase bucket configuration.
- **Hour 2**: Python Backend API scaffolding + Auth mechanism.
- **Hour 3**: Simulated Blockchain class implementation & integration into transfer logic.
- **Hour 4**: Frontend Citizen Portal (Dashboard, Initiate Transfer, Upload).
- **Hour 5**: Frontend Government Portal (Queue, Review, Approve/Reject).
- **Hour 6**: Data seeding, UI polish, Bug fixing, Demo walkthrough rehearsal.

### Demo Script for Judges (3-Minute Walkthrough)
1. **[0:00 - 0:30]** Open Citizen Portal. Login as Citizen A. Show Dashboard with owned properties.
2. **[0:30 - 1:00]** Initiate Transfer. Select Property, enter Buyer ID, upload a fake PDF deed to Supabase, and hit "Submit".
3. **[1:00 - 1:30]** Switch tabs. Login as Government Official. Open Pending Queue. Show the new request.
4. **[1:30 - 2:00]** Click "Review", show the uploaded PDF, and click "Approve". (Mention that the Python backend is now hashing the document and minting a block).
5. **[2:00 - 2:30]** Navigate to the Public Verification Page. Enter the Property ID.
6. **[2:30 - 3:00]** Display the "Blockchain Visualizer" component showing the immutable block history with cryptographic hashes, proving the system is tamper-proof.

### Technical Risks
- **Supabase Integration Delay**: Fallback to local file storage if bucket setup takes >20 mins.
- **Blockchain Over-engineering**: Keep the simulated blockchain to simple SHA-256 chaining. Avoid complex consensus mechanisms.
- **UI Clutter**: Focus strictly on the happy path to ensure the core demo succeeds flawlessly.