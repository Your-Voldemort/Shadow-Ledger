"""
Blockchain API endpoints for verification
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel

from app.database import get_db
from app.models import User, Property, Block
from app.routers.auth import get_current_user

router = APIRouter()

class BlockResponse(BaseModel):
    block_index: int
    timestamp: str
    transaction_data: Dict
    previous_hash: str
    hash: str

class PropertyVerificationResponse(BaseModel):
    property_id: str
    current_owner: str
    current_owner_aadhaar: str
    is_verified: bool
    blockchain_history: List[BlockResponse]

class BlockchainStatsResponse(BaseModel):
    total_blocks: int
    total_transactions: int
    chain_valid: bool

@router.get("/verify/{property_id}", response_model=PropertyVerificationResponse)
async def verify_property(
    property_id: str,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to verify a property's ownership and blockchain history.
    Anyone can access this for verification.
    """
    # Get property
    property = db.query(Property).filter(Property.property_id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Get current owner
    owner = db.query(User).filter(User.id == property.owner_id).first()
    
    # Get blockchain history for this property
    blocks = db.query(Block).filter(Block.property_id == property_id).order_by(Block.block_index).all()
    
    blockchain_history = []
    for block in blocks:
        blockchain_history.append(BlockResponse(
            block_index=block.block_index,
            timestamp=block.timestamp.isoformat() if block.timestamp else "",
            transaction_data=block.transaction_data,
            previous_hash=block.previous_hash,
            hash=block.hash
        ))
    
    # Property is verified if it has blockchain history
    is_verified = len(blockchain_history) > 0
    
    return PropertyVerificationResponse(
        property_id=property_id,
        current_owner=owner.full_name if owner else "Unknown",
        current_owner_aadhaar=owner.aadhaar_id if owner else "Unknown",
        is_verified=is_verified,
        blockchain_history=blockchain_history
    )

@router.get("/stats", response_model=BlockchainStatsResponse)
async def get_blockchain_stats(
    db: Session = Depends(get_db)
):
    """Get blockchain statistics"""
    total_blocks = db.query(Block).count()
    total_transactions = db.query(Block).filter(
        Block.transaction_data.contains("LAND_TRANSFER")
    ).count()
    
    # For demo, we consider chain valid if there are blocks
    chain_valid = total_blocks > 0
    
    return BlockchainStatsResponse(
        total_blocks=total_blocks,
        total_transactions=total_transactions,
        chain_valid=chain_valid
    )

@router.get("/chain", response_model=List[BlockResponse])
async def get_full_chain(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the full blockchain (for visualization)"""
    if current_user.role.value != "GOVERNMENT":
        raise HTTPException(status_code=403, detail="Government access required")
    
    blocks = db.query(Block).order_by(Block.block_index).all()
    
    result = []
    for block in blocks:
        result.append(BlockResponse(
            block_index=block.block_index,
            timestamp=block.timestamp.isoformat() if block.timestamp else "",
            transaction_data=block.transaction_data,
            previous_hash=block.previous_hash,
            hash=block.hash
        ))
    
    return result