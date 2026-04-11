"""
Database models for Shadow-Ledger
"""

from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    GOVERNMENT = "GOVERNMENT"

class PropertyStatus(str, enum.Enum):
    CLEAR = "CLEAR"
    PENDING_TRANSFER = "PENDING_TRANSFER"

class TransferStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    full_name = Column(String, nullable=False)
    aadhaar_id = Column(String, nullable=True)
    
    # Relationships
    properties = relationship("Property", back_populates="owner")
    transfer_requests = relationship("TransferRequest", foreign_keys="TransferRequest.seller_id", back_populates="seller")

class Property(Base):
    __tablename__ = "properties"
    
    property_id = Column(String, primary_key=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    location_address = Column(String, nullable=False)
    area_sqft = Column(Float, nullable=False)
    status = Column(Enum(PropertyStatus), default=PropertyStatus.CLEAR)
    
    # Relationships
    owner = relationship("User", back_populates="properties")
    transfers = relationship("TransferRequest", back_populates="property")

class TransferRequest(Base):
    __tablename__ = "transfer_requests"
    
    transfer_id = Column(String, primary_key=True)
    property_id = Column(String, ForeignKey("properties.property_id"), nullable=False)
    seller_id = Column(String, ForeignKey("users.id"), nullable=False)
    buyer_name = Column(String, nullable=False)
    buyer_aadhaar_id = Column(String, nullable=False)
    agreed_price = Column(Float, nullable=False)
    document_url = Column(String, nullable=True)
    status = Column(Enum(TransferStatus), default=TransferStatus.PENDING)
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = relationship("Property", back_populates="transfers")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="transfer_requests")

class Block(Base):
    __tablename__ = "blockchain"
    
    block_index = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    transaction_data = Column(JSON, nullable=False)
    previous_hash = Column(String, nullable=False)
    hash = Column(String, nullable=False)
    
    # Store property_id for easy lookup
    property_id = Column(String, nullable=True)
    from_owner = Column(String, nullable=True)
    to_owner = Column(String, nullable=True)