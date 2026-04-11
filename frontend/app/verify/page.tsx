'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Search, CheckCircle, ArrowLeft, Hash, Clock, User }
 from 'lucide-react';
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
      setError(err.response?.data?.detail || 'Property not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-md bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Shadow-Ledger</span>
          </div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/login')}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Verify Land Records</h1>
          <p className="text-slate-400 text-lg mb-8">
            Enter a property ID to verify ownership and view blockchain proof
          </p>

          <form onSubmit={handleVerify} className="max-w-xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="flex-1 px-5 py-4 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
                placeholder="Enter Property ID (e.g., PROP-001)"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-600/50 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Verify
              </button>
            </div>
          </form>

          {error && (
            <div className="max-w-xl mx-auto mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Verification Result */}
        {verification && (
          <div className="space-y-6">
            {/* Verification Badge */}
            <div className={`bg-slate-800/50 border rounded-2xl p-6 ${verification.is_verified ? 'border-emerald-500/50' : 'border-amber-500/50'}`}>
              <div className="flex items-center gap-4 mb-4">
                {verification.is_verified ? (
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-amber-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {verification.is_verified ? 'Verified Property' : 'Property Found - Unverified'}
                  </h2>
                  <p className="text-slate-400">Property ID: {verification.property_id}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Current Owner</p>
                    <p className="text-white font-semibold">{verification.current_owner}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Owner Aadhaar</p>
                    <p className="text-white font-semibold">{verification.current_owner_aadhaar}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain History */}
            {verification.blockchain_history.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-emerald-400" />
                  Blockchain Transaction History
                </h3>
                
                <div className="space-y-4">
                  {verification.blockchain_history.map((block, idx) => {
                    const txData = block.transaction_data;
                    const isGenesis = txData?.type === 'GENESIS';
                    
                    return (
                      <div key={block.block_index} className="relative">
                        {/* Timeline connector */}
                        {idx < verification.blockchain_history.length - 1 && (
                          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-700"></div>
                        )}
                        
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isGenesis ? 'bg-slate-600' : 'bg-gradient-to-br from-emerald-400 to-emerald-600'}`}>
                            <span className="text-white font-bold text-sm">{block.block_index}</span>
                          </div>
                          
                          <div className="flex-1 bg-slate-700/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-semibold">
                                {isGenesis ? 'Genesis Block' : `Transfer #${block.block_index}`}
                              </span>
                              <div className="flex items-center gap-1 text-slate-400 text-sm">
                                <Clock className="w-4 h-4" />
                                {new Date(block.timestamp).toLocaleString()}
                              </div>
                            </div>
                            
                            {!isGenesis && txData && (
                              <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-slate-400">From</p>
                                    <p className="text-white">{txData.from_owner_name || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">To</p>
                                    <p className="text-white">{txData.to_name || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Price</p>
                                    <p className="text-white">₹{Number(txData.price || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Approver</p>
                                    <p className="text-white">{txData.approver_name || 'Unknown'}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-3 pt-3 border-t border-slate-600">
                              <p className="text-slate-400 text-xs mb-1">Hash</p>
                              <p className="text-emerald-400 font-mono text-xs break-all">{block.hash}</p>
                            </div>
                            
                            <div className="mt-2">
                              <p className="text-slate-400 text-xs mb-1">Previous Hash</p>
                              <p className="text-slate-500 font-mono text-xs break-all">{block.previous_hash}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {verification.blockchain_history.length === 0 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
                <Hash className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No blockchain transactions found for this property</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}