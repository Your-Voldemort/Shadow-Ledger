"""
Simulated Blockchain Implementation
SHA-256 hash chain for immutable transaction recording
"""

import hashlib
import json
from time import time
from typing import Dict, List, Optional
from datetime import datetime


class Block:
    """Single block in the blockchain"""
    
    def __init__(
        self,
        index: int,
        transaction_data: Dict,
        previous_hash: str,
        timestamp: Optional[float] = None
    ):
        self.index = index
        self.timestamp = timestamp or time()
        self.transaction_data = transaction_data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calculate SHA-256 hash of the block"""
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.transaction_data,
            "previous": self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def to_dict(self) -> Dict:
        """Convert block to dictionary"""
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "timestamp_formatted": datetime.fromtimestamp(self.timestamp).isoformat(),
            "transaction_data": self.transaction_data,
            "previous_hash": self.previous_hash,
            "hash": self.hash
        }


class SimulatedBlockchain:
    """
    Simulated blockchain for land record transactions.
    Simple SHA-256 hash chain - no consensus mechanism needed for hackathon.
    """
    
    def __init__(self):
        self.chain: List[Block] = [self.create_genesis_block()]
    
    def create_genesis_block(self) -> Block:
        """Create the first block in the chain"""
        return Block(
            index=0,
            transaction_data={"type": "GENESIS", "message": "Shadow-Ledger Blockchain Initialized"},
            previous_hash="0"
        )
    
    def get_previous_block(self) -> Block:
        """Get the last block in the chain"""
        return self.chain[-1]
    
    def add_block(self, transaction_data: Dict) -> Block:
        """
        Add a new block with transaction data.
        Returns the created block.
        """
        previous_block = self.get_previous_block()
        new_block = Block(
            index=len(self.chain),
            transaction_data=transaction_data,
            previous_hash=previous_block.hash
        )
        self.chain.append(new_block)
        return new_block
    
    def get_chain(self) -> List[Dict]:
        """Get the full blockchain as list of dictionaries"""
        return [block.to_dict() for block in self.chain]
    
    def get_blocks_for_property(self, property_id: str) -> List[Dict]:
        """Get all blocks related to a specific property"""
        related_blocks = []
        for block in self.chain:
            if block.transaction_data.get("property_id") == property_id:
                related_blocks.append(block.to_dict())
        return related_blocks
    
    def verify_chain(self) -> bool:
        """Verify integrity of the blockchain"""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # Verify hash calculation
            if current_block.hash != current_block.calculate_hash():
                return False
            
            # Verify previous hash link
            if current_block.previous_hash != previous_block.hash:
                return False
        
        return True
    
    def get_block_count(self) -> int:
        """Get total number of blocks"""
        return len(self.chain)


# Global blockchain instance
blockchain = SimulatedBlockchain()


def get_blockchain() -> SimulatedBlockchain:
    """Get the global blockchain instance"""
    return blockchain