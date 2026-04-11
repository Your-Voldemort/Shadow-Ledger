'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Hash, ArrowLeft, Activity, Hexagon, Boxes, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-[var(--ledger-black)]">
      {/* Header */}
      <header className="bg-[var(--ledger-charcoal)] border-b border-[var(--ledger-border)] p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 text-[var(--ledger-muted)] hover:text-[var(--ledger-text)] hover:bg-[var(--ledger-graphite)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Hexagon className="w-6 h-6 text-[var(--ledger-gold)]" />
            <span className="font-bold text-[var(--ledger-text)]">Blockchain Ledger</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats */}
        {stats && (
          <motion.div 
            className="grid md:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="ledger-card flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--ledger-gold)]/20 rounded-xl flex items-center justify-center">
                <Boxes className="w-6 h-6 text-[var(--ledger-gold)]" />
              </div>
              <div>
                <p className="text-[var(--ledger-muted)] text-sm">Total Blocks</p>
                <p className="text-2xl font-bold text-[var(--ledger-text)]">{stats.total_blocks}</p>
              </div>
            </div>
            <div className="ledger-card flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--ledger-amber)]/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-[var(--ledger-amber)]" />
              </div>
              <div>
                <p className="text-[var(--ledger-muted)] text-sm">Transactions</p>
                <p className="text-2xl font-bold text-[var(--ledger-text)]">{stats.total_transactions}</p>
              </div>
            </div>
            <div className="ledger-card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.chain_valid ? 'bg-[var(--ledger-emerald)]/20' : 'bg-[var(--ledger-rose)]/20'}`}>
                {stats.chain_valid ? (
                  <CheckCircle className="w-6 h-6 text-[var(--ledger-emerald)]" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-[var(--ledger-rose)]" />
                )}
              </div>
              <div>
                <p className="text-[var(--ledger-muted)] text-sm">Chain Status</p>
                <p className={`text-2xl font-bold ${stats.chain_valid ? 'text-[var(--ledger-emerald)]' : 'text-[var(--ledger-rose)]'}`}>
                  {stats.chain_valid ? 'Valid' : 'Invalid'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Blockchain Visualization */}
        <motion.div 
          className="ledger-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-[var(--ledger-text)] mb-6 flex items-center gap-2">
            <Hash className="w-5 h-5 text-[var(--ledger-gold)]" />
            Blockchain Ledger
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[var(--ledger-gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-16 text-[var(--ledger-muted)]">
              No blocks in the blockchain yet
            </div>
          ) : (
            <div className="space-y-6">
              {blocks.map((block, idx) => {
                const txData = block.transaction_data;
                const isGenesis = txData?.type === 'GENESIS';

                return (
                  <motion.div 
                    key={block.block_index}
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {/* Connector line */}
                    {idx < blocks.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-[var(--ledger-gold)] to-[var(--ledger-border)]"></div>
                    )}

                    <div className="flex gap-4">
                      {/* Block number circle */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isGenesis ? 'bg-[var(--ledger-graphite)]' : 'bg-[var(--ledger-gold)]'} shadow-lg`}>
                        <span className="text-[var(--ledger-black)] font-bold mono">{block.block_index}</span>
                      </div>

                      {/* Block content */}
                      <div className="flex-1 bg-[var(--ledger-graphite)] rounded-xl border border-[var(--ledger-border)] p-5">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`font-semibold ${isGenesis ? 'text-[var(--ledger-muted)]' : 'text-[var(--ledger-gold)]'}`}>
                            {isGenesis ? 'Genesis Block' : `Block #${block.block_index}`}
                          </span>
                          <span className="text-[var(--ledger-muted)] text-sm mono">
                            {new Date(block.timestamp).toLocaleString()}
                          </span>
                        </div>

                        {/* Transaction data */}
                        {!isGenesis && txData && (
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            {!!txData.from_owner_name && (
                              <div className="bg-[var(--ledger-charcoal)] rounded-lg p-3">
                                <p className="text-[var(--ledger-muted)] text-xs">From</p>
                                <p className="font-medium text-[var(--ledger-text)] truncate">{String(txData.from_owner_name)}</p>
                              </div>
                            )}
                            {!!txData.to_name && (
                              <div className="bg-[var(--ledger-charcoal)] rounded-lg p-3">
                                <p className="text-[var(--ledger-muted)] text-xs">To</p>
                                <p className="font-medium text-[var(--ledger-gold)] truncate">{String(txData.to_name)}</p>
                              </div>
                            )}
                            {!!txData.price && (
                              <div className="bg-[var(--ledger-charcoal)] rounded-lg p-3">
                                <p className="text-[var(--ledger-muted)] text-xs">Value</p>
                                <p className="font-medium text-[var(--ledger-text)]">₹{Number(txData.price).toLocaleString()}</p>
                              </div>
                            )}
                            {!!txData.approver_name && (
                              <div className="bg-[var(--ledger-charcoal)] rounded-lg p-3">
                                <p className="text-[var(--ledger-muted)] text-xs">Approved By</p>
                                <p className="font-medium text-[var(--ledger-text)] truncate">{String(txData.approver_name)}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Hash display */}
                        <div className="space-y-2">
                          <div className="bg-[var(--ledger-black)] rounded-lg p-3">
                            <p className="text-[var(--ledger-muted)] text-xs mb-1">SHA-256 Hash</p>
                            <p className="text-[var(--ledger-gold)] font-mono text-xs break-all">{block.hash}</p>
                          </div>
                          <div className="bg-[var(--ledger-charcoal)] rounded-lg p-3">
                            <p className="text-[var(--ledger-muted)] text-xs mb-1">Previous Hash</p>
                            <p className="text-[var(--ledger-muted)] font-mono text-xs break-all">{block.previous_hash}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}