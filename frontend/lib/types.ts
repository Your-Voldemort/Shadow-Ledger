export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'CITIZEN' | 'GOVERNMENT';
  aadhaar_id?: string;
}

export interface Property {
  property_id: string;
  owner_id: string;
  owner_name: string;
  location_address: string;
  area_sqft: number;
  status: 'CLEAR' | 'PENDING_TRANSFER';
}

export interface Transfer {
  transfer_id: string;
  property_id: string;
  property_address?: string;
  seller_id?: string;
  seller_name: string;
  buyer_name: string;
  buyer_aadhaar_id: string;
  agreed_price: number;
  document_url?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface Block {
  block_index: number;
  timestamp: string;
  transaction_data: Record<string, unknown>;
  previous_hash: string;
  hash: string;
}

export interface PropertyVerification {
  property_id: string;
  current_owner: string;
  current_owner_aadhaar: string;
  is_verified: boolean;
  blockchain_history: Block[];
}

export interface BlockchainStats {
  total_blocks: number;
  total_transactions: number;
  chain_valid: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}