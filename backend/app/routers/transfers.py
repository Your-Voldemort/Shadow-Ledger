"""
Transfer API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
import hashlib

from app.database import get_db
from app.models import User, Property, TransferRequest, TransferStatus, PropertyStatus, Block
from app.routers.auth import get_current_user
from app.blockchain.blockchain import get_blockchain

router = APIRouter()

class TransferInitiateRequest(BaseModel):
    property_id: str
    buyer_name: str
    buyer_aadhaar_id: str
    agreed_price: float
    document_url: Optional[str] = None

class TransferResponse(BaseModel):
    transfer_id: str
    property_id: str
    seller_name: str
    buyer_name: str
    buyer_aadhaar_id: str
    agreed_price: float
    document_url: Optional[str] = None
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TransferDetailResponse(BaseModel):
    transfer_id: str
    property_id: str
    property_address: str
    seller_id: str
    seller_name: str
    buyer_name: str
    buyer_aadhaar_id: str
    agreed_price: float
    document_url: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ApproveResponse(BaseModel):
    message: str
    block: dict

class RejectRequest(BaseModel):
    reason: str

def calculate_document_hash(document_content: bytes) -> str:
    """Calculate SHA-256 hash of document"""
    return hashlib.sha256(document_content).hexdigest()

@router.post("/initiate", response_model=TransferResponse)
async def initiate_transfer(
    transfer_data: TransferInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate a new land transfer request (Citizen)"""
    
    # Verify user owns the property
    property = db.query(Property).filter(
        Property.property_id == transfer_data.property_id,
        Property.owner_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=404,
            detail="Property not found or you don't own it"
        )
    
    if property.status == PropertyStatus.PENDING_TRANSFER:
        raise HTTPException(
            status_code=400,
            detail="Property already has a pending transfer"
        )
    
    # Create transfer request
    transfer_id = f"TRF-{uuid.uuid4().hex[:8].upper()}"
    transfer = TransferRequest(
        transfer_id=transfer_id,
        property_id=transfer_data.property_id,
        seller_id=current_user.id,
        buyer_name=transfer_data.buyer_name,
        buyer_aadhaar_id=transfer_data.buyer_aadhaar_id,
        agreed_price=transfer_data.agreed_price,
        document_url=transfer_data.document_url,
        status=TransferStatus.PENDING
    )
    
    # Update property status
    property.status = PropertyStatus.PENDING_TRANSFER
    
    db.add(transfer)
    db.commit()
    db.refresh(transfer)
    
    # Get seller name
    return TransferResponse(
        transfer_id=transfer.transfer_id,
        property_id=transfer.property_id,
        seller_name=current_user.full_name,
        buyer_name=transfer.buyer_name,
        buyer_aadhaar_id=transfer.buyer_aadhaar_id,
        agreed_price=transfer.agreed_price,
        document_url=transfer.document_url,
        status=transfer.status.value,
        created_at=transfer.created_at
    )

@router.get("/my", response_model=List[TransferResponse])
async def get_my_transfers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transfer requests initiated by the current user"""
    transfers = db.query(TransferRequest).filter(
        TransferRequest.seller_id == current_user.id
    ).all()
    
    result = []
    for transfer in transfers:
        result.append(TransferResponse(
            transfer_id=transfer.transfer_id,
            property_id=transfer.property_id,
            seller_name=current_user.full_name,
            buyer_name=transfer.buyer_name,
            buyer_aadhaar_id=transfer.buyer_aadhaar_id,
            agreed_price=transfer.agreed_price,
            document_url=transfer.document_url,
            status=transfer.status.value,
            created_at=transfer.created_at
        ))
    
    return result

@router.get("/pending", response_model=List[TransferDetailResponse])
async def get_pending_transfers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pending transfer requests (Government only)"""
    if current_user.role.value != "GOVERNMENT":
        raise HTTPException(status_code=403, detail="Government access required")
    
    transfers = db.query(TransferRequest).filter(
        TransferRequest.status == TransferStatus.PENDING
    ).order_by(TransferRequest.created_at.desc()).all()
    
    result = []
    for transfer in transfers:
        property = db.query(Property).filter(Property.property_id == transfer.property_id).first()
        seller = db.query(User).filter(User.id == transfer.seller_id).first()
        
        result.append(TransferDetailResponse(
            transfer_id=transfer.transfer_id,
            property_id=transfer.property_id,
            property_address=property.location_address if property else "Unknown",
            seller_id=transfer.seller_id,
            seller_name=seller.full_name if seller else "Unknown",
            buyer_name=transfer.buyer_name,
            buyer_aadhaar_id=transfer.buyer_aadhaar_id,
            agreed_price=transfer.agreed_price,
            document_url=transfer.document_url,
            status=transfer.status.value,
            rejection_reason=transfer.rejection_reason,
            created_at=transfer.created_at,
            updated_at=transfer.updated_at
        ))
    
    return result

@router.get("/{transfer_id}", response_model=TransferDetailResponse)
async def get_transfer(
    transfer_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed transfer request information"""
    transfer = db.query(TransferRequest).filter(
        TransferRequest.transfer_id == transfer_id
    ).first()
    
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    property = db.query(Property).filter(Property.property_id == transfer.property_id).first()
    seller = db.query(User).filter(User.id == transfer.seller_id).first()
    
    return TransferDetailResponse(
        transfer_id=transfer.transfer_id,
        property_id=transfer.property_id,
        property_address=property.location_address if property else "Unknown",
        seller_id=transfer.seller_id,
        seller_name=seller.full_name if seller else "Unknown",
        buyer_name=transfer.buyer_name,
        buyer_aadhaar_id=transfer.buyer_aadhaar_id,
        agreed_price=transfer.agreed_price,
        document_url=transfer.document_url,
        status=transfer.status.value,
        rejection_reason=transfer.rejection_reason,
        created_at=transfer.created_at,
        updated_at=transfer.updated_at
    )

@router.post("/{transfer_id}/approve", response_model=ApproveResponse)
async def approve_transfer(
    transfer_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve a transfer request (Government only)"""
    if current_user.role.value != "GOVERNMENT":
        raise HTTPException(status_code=403, detail="Government access required")
    
    # Get transfer request
    transfer = db.query(TransferRequest).filter(
        TransferRequest.transfer_id == transfer_id
    ).first()
    
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    if transfer.status != TransferStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transfer is not pending")
    
    # Get property and calculate document hash
    property = db.query(Property).filter(
        Property.property_id == transfer.property_id
    ).first()
    
    # For demo purposes, we'll use a placeholder hash if no document
    doc_hash = "demo-document-hash"
    if transfer.document_url:
        doc_hash = hashlib.sha256(transfer.document_url.encode()).hexdigest()
    
    # Get buyer info (for demo, we'll create a simple lookup or use placeholder)
    buyer_aadhaar = transfer.buyer_aadhaar_id
    
    # Create blockchain block
    blockchain = get_blockchain()
    transaction_data = {
        "type": "LAND_TRANSFER",
        "transfer_id": transfer_id,
        "property_id": transfer.property_id,
        "from_owner_id": transfer.seller_id,
        "from_owner_name": current_user.full_name,  # This is actually seller
        "to_aadhaar": buyer_aadhaar,
        "to_name": transfer.buyer_name,
        "price": transfer.agreed_price,
        "document_hash": doc_hash,
        "approver_id": current_user.id,
        "approver_name": current_user.full_name,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    new_block = blockchain.add_block(transaction_data)
    
    # Get the next block index from database (to handle app reloads)
    # Find max existing index and use the next one
    max_block_index = db.query(func.max(Block.block_index)).scalar()
    next_block_index = (max_block_index + 1) if max_block_index is not None else 1
    
    # Store block in database
    db_block = Block(
        block_index=next_block_index,
        timestamp=datetime.fromtimestamp(new_block.timestamp),
        transaction_data=new_block.transaction_data,
        previous_hash=new_block.previous_hash,
        hash=new_block.hash,
        property_id=transfer.property_id,
        from_owner=transfer.seller_id,
        to_owner=buyer_aadhaar
    )
    db.add(db_block)
    
    # Update transfer status
    transfer.status = TransferStatus.APPROVED
    transfer.updated_at = datetime.utcnow()
    
    # Update property ownership (for demo, we'll
    # In a real system, we'd find the buyer in the users table
    # For demo, property stays with seller but status changes
    
    # Update property status to CLEAR (transfer complete)
    property.status = PropertyStatus.CLEAR
    
    db.commit()
    
    return ApproveResponse(
        message="Transfer approved successfully",
        block=new_block.to_dict()
    )

@router.post("/{transfer_id}/reject", response_model=TransferDetailResponse)
async def reject_transfer(
    transfer_id: str,
    reject_data: RejectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject a transfer request (Government only)"""
    if current_user.role.value != "GOVERNMENT":
        raise HTTPException(status_code=403, detail="Government access required")
    
    # Get transfer request
    transfer = db.query(TransferRequest).filter(
        TransferRequest.transfer_id == transfer_id
    ).first()
    
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    if transfer.status != TransferStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transfer is not pending")
    
    # Update transfer status
    transfer.status = TransferStatus.REJECTED
    transfer.rejection_reason = reject_data.reason
    transfer.updated_at = datetime.utcnow()
    
    # Reset property status
    property = db.query(Property).filter(
        Property.property_id == transfer.property_id
    ).first()
    if property:
        property.status = PropertyStatus.CLEAR
    
    db.commit()
    db.refresh(transfer)
    
    property = db.query(Property).filter(Property.property_id == transfer.property_id).first()
    seller = db.query(User).filter(User.id == transfer.seller_id).first()
    
    return TransferDetailResponse(
        transfer_id=transfer.transfer_id,
        property_id=transfer.property_id,
        property_address=property.location_address if property else "Unknown",
        seller_id=transfer.seller_id,
        seller_name=seller.full_name if seller else "Unknown",
        buyer_name=transfer.buyer_name,
        buyer_aadhaar_id=transfer.buyer_aadhaar_id,
        agreed_price=transfer.agreed_price,
        document_url=transfer.document_url,
        status=transfer.status.value,
        rejection_reason=transfer.rejection_reason,
        created_at=transfer.created_at,
        updated_at=transfer.updated_at
    )