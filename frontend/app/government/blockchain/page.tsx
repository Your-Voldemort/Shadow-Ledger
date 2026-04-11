'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Hash, ArrowLeft, Activity } from 'lucide-react';
import { blockchainAPI } from '@/lib/api';
import { Block, BlockchainStats } from '@/lib/types';

export default function BlockchainVisualizer() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'GOVERNMENT') {
      router.push('/login');
      return;
    }
    fetchBlockchainData();
  }, []);

  const fetchBlockchainData = async () => {
    try {
      const [chainRes, statsRes] = await Promise.all([
        blockchainAPI.getChain(),
        blockchainAPI.getStats(),
      ]);
      setBlocks(chainRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching blockchain:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-primary text-white p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <span className="font-bold">Blockchain Visualizer</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Hash className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Total Blocks</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total_blocks}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total_transactions}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.chain_valid ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                <Activity className={`w-6 h-6 ${stats.chain_valid ? 'text-emerald-600' : 'text-rose-600'}`} />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Chain Status</p>
                <p className={`text-2xl font-bold ${stats.chain_valid ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.chain_valid ? 'Valid' : 'Invalid'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Visualization */}
        <div className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Hash className="w-5 h-5 text-emerald-500" />
            Blockchain Ledger
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No blocks in the blockchain yet
            </div>
          ) : (
            <div className="space-y-6">
              {blocks.map((block, idx) => {
                const txData = block.transaction_data;
                const isGenesis = txData?.type === 'GENESIS';

                return (
                  <div key={block.block_index} className="relative">
                    {/* Connector line */}
                    {idx < blocks.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-slate-300"></div>
                    )}

                    <div className="flex gap-4">
                      {/* Block number circle */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isGenesis ? 'bg-slate-600' : 'bg-gradient-to-br from-emerald-400 to-emerald-600'} shadow-lg`}>
                        <span className="text-white font-bold">{block.block_index}</span>
                      </div>

                      {/* Block content */}
                      <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`font-semibold ${isGenesis ? 'text-slate-600' : 'text-emerald-600'}`}>
                            {isGenesis ? 'Genesis Block' : `Block #${block.block_index}`}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {new Date(block.timestamp).toLocaleString()}
                          </span>
                        </div>

                        {/* Transaction data */}
                        {!isGenesis && txData && (
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {txData.from_owner_name && (
                              <div className="bg-slate-100 rounded-lg p-3">
                                <p className="text-slate-500 text-xs">From</p>
                                <p className="font-medium text-slate-800 truncate">{txData.from_owner_name}</p>
                              </div>
                            )}
                            {txData.to_name && (
                              <div className="bg-slate-100 rounded-lg p-3">
                                <p className="text-slate-500 text-xs">To</p>
                                <p className="font-medium text-slate-800 truncate">{txData.to_name}</p>
                              </div>
                            )}
                            {txData.price && (
                              <div className="bg-slate-100 rounded-lg p-3">
                                <p className="text-slate-500 text-xs">Price</p>
                                <p className="font-medium text-slate-800">₹{Number(txData.price).toLocaleString()}</p>
                              </div>
                            )}
                            {txData.approver_name && (
                              <div className="bg-slate-100 rounded-lg p-3">
                                <p className="text-slate-500 text-xs">Approved By</p>
                                <p className="font-medium text-slate-800 truncate">{txData.approver_name}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Hash display */}
                        <div className="space-y-2">
                          <div className="bg-slate-800 rounded-lg p-3">
                            <p className="text-slate-400 text-xs mb-1">Block Hash (SHA-256)</p>
                            <p className="text-emerald-400 font-mono text-sm break-all">{block.hash}</p>
                          </div>
                          <div className="bg-slate-100 rounded-lg p-3">
                            <p className="text-slate-500 text-xs mb-1">Previous Hash</p>
                            <p className="text-slate-600 font-mono text-sm break-all">{block.previous_hash}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}