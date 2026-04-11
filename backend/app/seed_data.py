"""
Seed data for Shadow-Ledger Demo
Creates initial users, properties, and transfers for the hackathon demo
"""

from datetime import datetime
import uuid
from passlib.context import CryptContext

from app.database import SessionLocal, init_db
from app.models import User, Property, TransferRequest, UserRole, PropertyStatus, TransferStatus, Block
from app.blockchain.blockchain import get_blockchain

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def seed_data():
    """Seed initial data for the demo"""
    init_db()
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already seeded. Skipping...")
            return
        
        print("Seeding database...")
        
        # Create Government Official
        gov_user = User(
            id="gov_001",
            email="office@land.register.gov",
            password_hash=hash_password("admin123"),
            role=UserRole.GOVERNMENT,
            full_name="Rajesh Kumar",
            aadhaar_id="Govt9876543210"
        )
        db.add(gov_user)
        
        # Create Citizen Users
        citizen1 = User(
            id="citizen_001",
            email="arun@example.com",
            password_hash=hash_password("citizen123"),
            role=UserRole.CITIZEN,
            full_name="Arun Sharma",
            aadhaar_id="Aadhaar1234567890"
        )
        db.add(citizen1)
        
        citizen2 = User(
            id="citizen_002",
            email="priya@example.com",
            password_hash=hash_password("citizen123"),
            role=UserRole.CITIZEN,
            full_name="Priya Menon",
            aadhaar_id="Aadhaar0987654321"
        )
        db.add(citizen2)
        
        db.commit()
        
        # Create Properties
        properties = [
            Property(
                property_id="PROP-001",
                owner_id="citizen_001",
                location_address="Plot No. 45, Golf Course Road, Sector 62, Gurgaon",
                area_sqft=2500.0,
                status=PropertyStatus.CLEAR
            ),
            Property(
                property_id="PROP-002",
                owner_id="citizen_001",
                location_address="Flat No. 302, Residency Tower, MG Road, Bangalore",
                area_sqft=1200.0,
                status=PropertyStatus.CLEAR
            ),
            Property(
                property_id="PROP-003",
                owner_id="citizen_002",
                location_address="House No. 78, Lake View Colony, Hyderabad",
                area_sqft=3200.0,
                status=PropertyStatus.CLEAR
            ),
        ]
        
        for prop in properties:
            db.add(prop)
        
        db.commit()
        
        # Create Genesis Block (if not exists)
        blockchain = get_blockchain()
        if blockchain.get_block_count() == 1:  # Only genesis block
            genesis_block_data = {
                "type": "GENESIS",
                "message": "Shadow-Ledger Blockchain Initialized",
                "timestamp": datetime.utcnow().isoformat()
            }
            blockchain.add_block(genesis_block_data)
            
            # Store in DB
            db_block = Block(
                block_index=0,
                timestamp=datetime.utcnow(),
                transaction_data=genesis_block_data,
                previous_hash="0",
                hash=blockchain.chain[0].hash,
                property_id=None,
                from_owner=None,
                to_owner=None
            )
            db.add(db_block)
            db.commit()
        
        print("Database seeded successfully!")
        print("\n=== Demo Credentials ===")
        print("Government Official:")
        print("  Email: office@land.register.gov")
        print("  Password: admin123")
        print("\nCitizen 1:")
        print("  Email: arun@example.com")
        print("  Password: citizen123")
        print("\nCitizen 2:")
        print("  Email: priya@example.com")
        print("  Password: citizen123")
        print("\n=== Property IDs ===")
        print("  PROP-001 - Arun Sharma (Gurgaon)")
        print("  PROP-002 - Arun Sharma (Bangalore)")
        print("  PROP-003 - Priya Menon (Hyderabad)")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()