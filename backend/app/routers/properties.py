"""
Properties API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import User, Property, PropertyStatus
from app.routers.auth import get_current_user

router = APIRouter()

class PropertyResponse(BaseModel):
    property_id: str
    owner_id: str
    owner_name: str
    location_address: str
    area_sqft: float
    status: str
    
    class Config:
        from_attributes = True

class PropertyDetailResponse(BaseModel):
    property_id: str
    owner_id: str
    owner_name: str
    location_address: str
    area_sqft: float
    status: str
    transaction_history: List[dict] = []

@router.get("/me", response_model=List[PropertyResponse])
async def get_my_properties(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all properties owned by the current user"""
    properties = db.query(Property).filter(Property.owner_id == current_user.id).all()
    
    result = []
    for prop in properties:
        result.append(PropertyResponse(
            property_id=prop.property_id,
            owner_id=prop.owner_id,
            owner_name=current_user.full_name,
            location_address=prop.location_address,
            area_sqft=prop.area_sqft,
            status=prop.status.value
        ))
    
    return result

@router.get("/{property_id}", response_model=PropertyDetailResponse)
async def get_property(
    property_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed property information with transaction history"""
    property = db.query(Property).filter(Property.property_id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    owner = db.query(User).filter(User.id == property.owner_id).first()
    
    # Get transaction history from blockchain (we'll implement this later)
    # For now, return empty history
    return PropertyDetailResponse(
        property_id=property.property_id,
        owner_id=property.owner_id,
        owner_name=owner.full_name if owner else "Unknown",
        location_address=property.location_address,
        area_sqft=property.area_sqft,
        status=property.status.value,
        transaction_history=[]
    )

@router.get("/")
async def list_all_properties(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all properties (government only)"""
    if current_user.role.value != "GOVERNMENT":
        raise HTTPException(status_code=403, detail="Government access required")
    
    properties = db.query(Property).all()
    
    result = []
    for prop in properties:
        owner = db.query(User).filter(User.id == prop.owner_id).first()
        result.append(PropertyResponse(
            property_id=prop.property_id,
            owner_id=prop.owner_id,
            owner_name=owner.full_name if owner else "Unknown",
            location_address=prop.location_address,
            area_sqft=prop.area_sqft,
            status=prop.status.value
        ))
    
    return result