'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Search, CheckCircle, ArrowLeft, Hash, Clock, User, Hexagon, Building2, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { blockchainAPI } from '@/lib/api';
import { PropertyVerification, Block } from '@/lib/types';

export default function VerifyPage() {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verification, setVerification] = useState<PropertyVerification | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId.trim()) return;
    
    setLoading(true);
    setError('');
    setVerification(null);

    try {
      const res = await blockchainAPI.verify(propertyId.trim());
      setVerification(res.data);
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = 'Property not found';
      
      if (Array.isArray(errorData)) {
        errorMessage = errorData.map((e: any) => e.msg || e.detail || 'Verification error').join(', ');
      } else if (errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : 'Property not found';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ledger-black)] grid-bg relative">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--ledger-gold)]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
      </div>

      {/* Header */}
      <header className="relative border-b border-[var(--ledger-border)] bg-[var(--ledger-black)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-2 -ml-2 text-[var(--ledger-muted)] hover:text-[var(--ledger-text)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Hexagon className="w-6 h-6 text-[var(--ledger-gold)]" />
              <span className="text-xl font-bold text-[var(--ledger-text)]">SHADOW-LEDGER</span>
            </div>
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="btn-secondary text-sm py-2"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Search Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--ledger-text)] mb-4 tracking-tight">
            Verify <span className="text-[var(--ledger-gold)]">Land Records</span>
          </h1>
          <p className="text-[var(--ledger-muted)] text-lg mb-8 max-w-xl mx-auto">
            Enter a Property ID to verify ownership and view cryptographic proof on the blockchain
          </p>

          <form onSubmit={handleVerify} className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="input-field flex-1 text-lg"
                placeholder="PROP-001"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-8 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[var(--ledger-black)] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div 
                className="max-w-xl mx-auto mt-4 bg-[var(--ledger-rose)]/10 border border-[var(--ledger-rose)]/30 text-[var(--ledger-rose)] px-4 py-3 rounded-lg text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Verification Result */}
        <AnimatePresence>
          {verification && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Verification Badge */}
              <motion.div 
                className={`ledger-card ${verification.is_verified ? 'gold-glow' : ''}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-5 mb-6">
                  {verification.is_verified ? (
                    <div className="w-16 h-16 bg-[var(--ledger-gold)]/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-[var(--ledger-gold)]" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-[var(--ledger-amber)]/20 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-[var(--ledger-amber)]" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--ledger-text)]">
                      {verification.is_verified ? 'Verified Property' : 'Property Found'}
                    </h2>
                    <p className="text-[var(--ledger-muted)] mono">{verification.property_id}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-[var(--ledger-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--ledger-graphite)] rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-[var(--ledger-gold)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider">Current Owner</p>
                      <p className="text-[var(--ledger-text)] font-semibold">{verification.current_owner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--ledger-graphite)] rounded-lg flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-[var(--ledger-gold)]" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider">Owner ID</p>
                      <p className="text-[var(--ledger-text)] font-semibold mono">{verification.current_owner_aadhaar}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Blockchain History */}
              {verification.blockchain_history.length > 0 && (
                <motion.div 
                  className="ledger-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-bold text-[var(--ledger-text)] mb-6 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-[var(--ledger-gold)]" />
                    Blockchain Transaction History
                  </h3>
                  
                  <div className="space-y-4">
                    {verification.blockchain_history.map((block, idx) => {
                      const txData = block.transaction_data;
                      const isGenesis = txData?.type === 'GENESIS';
                      
                      return (
                        <motion.div 
                          key={block.block_index}
                          className="relative"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                        >
                          {/* Timeline connector */}
                          {idx < verification.blockchain_history.length - 1 && (
                            <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-[var(--ledger-border)]"></div>
                          )}
                          
                          <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isGenesis ? 'bg-[var(--ledger-graphite)]' : 'bg-[var(--ledger-gold)]'}`}>
                              {isGenesis ? (
                                <Hash className="w-5 h-5 text-[var(--ledger-muted)]" />
                              ) : (
                                <span className="text-[var(--ledger-black)] font-bold text-sm mono">{block.block_index}</span>
                              )}
                            </div>
                            
                            <div className="flex-1 bg-[var(--ledger-graphite)] rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[var(--ledger-text)] font-semibold">
                                  {isGenesis ? 'Genesis Block' : `Transfer #${block.block_index}`}
                                </span>
                                <div className="flex items-center gap-1 text-[var(--ledger-muted)] text-xs">
                                  <Clock className="w-3 h-3" />
                                  {new Date(block.timestamp).toLocaleString()}
                                </div>
                              </div>
                              
                              {!isGenesis && txData && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                                  <div>
                                    <p className="text-[var(--ledger-muted)] text-xs">From</p>
                                    <p className="text-[var(--ledger-text)]">{txData.from_owner_name ? String(txData.from_owner_name) : '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[var(--ledger-muted)] text-xs">To</p>
                                    <p className="text-[var(--ledger-gold)]">{txData.to_name ? String(txData.to_name) : '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[var(--ledger-muted)] text-xs">Value</p>
                                    <p className="text-[var(--ledger-text)]">₹{Number(txData.price || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[var(--ledger-muted)] text-xs">Approved By</p>
                                    <p className="text-[var(--ledger-text)]">{txData.approver_name ? String(txData.approver_name) : '—'}</p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="pt-3 border-t border-[var(--ledger-border)]">
                                <p className="text-[var(--ledger-muted)] text-xs mb-1">SHA-256 Hash</p>
                                <p className="text-[var(--ledger-gold)] font-mono text-xs break-all">{block.hash}</p>
                              </div>
                              
                              <div className="mt-2">
                                <p className="text-[var(--ledger-muted)] text-xs mb-1">Previous Hash</p>
                                <p className="text-[var(--ledger-muted)] font-mono text-xs break-all">{block.previous_hash}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {verification.blockchain_history.length === 0 && (
                <motion.div 
                  className="ledger-card text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Hash className="w-10 h-10 text-[var(--ledger-muted)] mx-auto mb-4" />
                  <p className="text-[var(--ledger-muted)]">No blockchain transactions for this property</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}