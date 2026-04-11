"""
Shadow-Ledger Backend - FastAPI Application
Digital Land Record Management System
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, properties, transfers, blockchain
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Shadow-Ledger API",
    description="Blockchain-powered Digital Land Record Management System",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(properties.router, prefix="/api/properties", tags=["properties"])
app.include_router(transfers.router, prefix="/api/transfers", tags=["transfers"])
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["blockchain"])

@app.get("/")
async def root():
    return {"message": "Shadow-Ledger API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}