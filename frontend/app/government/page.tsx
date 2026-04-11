'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, FileCheck, XCircle, ArrowRightLeft, LogOut, Menu, X, Search, Hexagon, ChevronRight, User, Calendar, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { transfersAPI } from '@/lib/api';
import { Transfer, User as UserType } from '@/lib/types';

export default function GovernmentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

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
    setUser(parsedUser);
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const res = await transfersAPI.getPending();
      setTransfers(res.data);
    } catch (err) {
      console.error('Error fetching transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleApprove = async (transferId: string) => {
    setActionLoading(transferId);
    try {
      await transfersAPI.approve(transferId);
      await fetchTransfers();
      setSelectedTransfer(null);
    } catch (err) {
      console.error('Error approving transfer:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedTransfer || !rejectReason.trim()) return;
    setActionLoading(selectedTransfer.transfer_id);
    try {
      await transfersAPI.reject(selectedTransfer.transfer_id, rejectReason);
      await fetchTransfers();
      setShowRejectModal(false);
      setSelectedTransfer(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error rejecting transfer:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--ledger-black)]">
      {/* Mobile Header */}
      <div className="lg:hidden bg-[var(--ledger-charcoal)] border-b border-[var(--ledger-border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hexagon className="w-5 h-5 text-[var(--ledger-gold)]" />
          <span className="font-bold text-[var(--ledger-text)]">SHADOW-LEDGER</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-[var(--ledger-muted)]">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar overlay for mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-[var(--ledger-charcoal)] w-72 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 border-r border-[var(--ledger-border)]`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-[var(--ledger-gold)] rounded-lg flex items-center justify-center">
                <Hexagon className="w-6 h-6 text-[var(--ledger-black)]" />
              </div>
              <div>
                <span className="text-lg font-bold text-[var(--ledger-text)]">SHADOW</span>
                <span className="text-lg font-bold text-[var(--ledger-gold)]">LEDGER</span>
              </div>
            </div>
            
            <div className="mb-6 pb-6 border-b border-[var(--ledger-border)]">
              <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider mb-1">Government Portal</p>
              <p className="text-[var(--ledger-text)] font-medium">{user.full_name}</p>
              <p className="text-sm text-[var(--ledger-muted)] mono">{user.email}</p>
            </div>

            <nav className="space-y-2 flex-1">
              <button
                onClick={() => { setActiveTab('pending'); setSidebarOpen(false); }}
                className={`sidebar-link w-full ${activeTab === 'pending' ? 'sidebar-link-active' : ''}`}
              >
                <FileCheck className="w-5 h-5" /> Pending Reviews
              </button>
              <button
                onClick={() => router.push('/verify')}
                className="sidebar-link w-full"
              >
                <Search className="w-5 h-5" /> Verify Property
              </button>
              <button
                onClick={() => router.push('/government/blockchain')}
                className="sidebar-link w-full"
              >
                <ArrowRightLeft className="w-5 h-5" /> Blockchain
              </button>
            </nav>

            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-[var(--ledger-rose)] hover:text-[var(--ledger-rose)]"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <motion.div 
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h1 className="text-2xl font-bold text-[var(--ledger-text)] mb-2">Transfer Requests</h1>
                <p className="text-[var(--ledger-muted)]">Review and approve property transfers</p>
              </div>
              <div className="flex items-center gap-3 bg-[var(--ledger-graphite)] border border-[var(--ledger-border)] px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-[var(--ledger-amber)] rounded-full animate-pulse" />
                <span className="text-[var(--ledger-text)] font-medium">{transfers.length} Pending</span>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[var(--ledger-gold)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : transfers.length === 0 ? (
              <motion.div 
                className="ledger-card text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FileCheck className="w-12 h-12 text-[var(--ledger-muted)] mx-auto mb-4" />
                <p className="text-[var(--ledger-muted)]">No pending transfer requests</p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {transfers.map((transfer, idx) => (
                  <motion.div 
                    key={transfer.transfer_id}
                    className="ledger-card group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-[var(--ledger-text)] mono">{transfer.transfer_id}</span>
                          <span className={getStatusClass(transfer.status)}>{transfer.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div className="flex items-center gap-2 text-[var(--ledger-muted)]">
                            <span className="text-xs">Property:</span>
                            <span className="text-[var(--ledger-text)] mono">{transfer.property_id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[var(--ledger-muted)]">
                            <User className="w-3 h-3" />
                            <span className="text-[var(--ledger-text)]">{transfer.seller_name} → {transfer.buyer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[var(--ledger-muted)]">
                            <Banknote className="w-3 h-3" />
                            <span className="text-[var(--ledger-gold)]">₹{transfer.agreed_price.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--ledger-muted)] text-xs mt-2 mono">
                          <Calendar className="w-3 h-3" />
                          {new Date(transfer.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setSelectedTransfer(transfer)}
                          className="btn-secondary flex items-center gap-2 text-sm py-2"
                        >
                          <Search className="w-4 h-4" /> Review
                        </button>
                        <button
                          onClick={() => { setSelectedTransfer(transfer); setShowRejectModal(true); }}
                          className="btn-danger flex items-center gap-2 text-sm py-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(transfer.transfer_id)}
                          disabled={actionLoading === transfer.transfer_id}
                          className="btn-primary flex items-center gap-2 text-sm py-2"
                        >
                          {actionLoading === transfer.transfer_id ? (
                            <div className="w-4 h-4 border-2 border-[var(--ledger-black)] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FileCheck className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedTransfer && !showRejectModal && (
          <motion.div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[var(--ledger-charcoal)] border border-[var(--ledger-border)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="p-6 border-b border-[var(--ledger-border)] flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--ledger-text)]">Transfer Review</h2>
                <button onClick={() => setSelectedTransfer(null)} className="btn-ghost p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="ledger-card-flat">
                    <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider mb-1">Transfer ID</p>
                    <p className="font-semibold text-[var(--ledger-text)] mono">{selectedTransfer.transfer_id}</p>
                  </div>
                  <div className="ledger-card-flat">
                    <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider mb-1">Property ID</p>
                    <p className="font-semibold text-[var(--ledger-text)] mono">{selectedTransfer.property_id}</p>
                  </div>
                  <div className="ledger-card-flat">
                    <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider mb-1">Seller Name</p>
                    <p className="font-semibold text-[var(--ledger-text)]">{selectedTransfer.seller_name}</p>
                  </div>
                  <div className="ledger-card-flat">
                    <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider mb-1">Buyer Name</p>
                    <p className="font-semibold text-[var(--ledger-text)]">{selectedTransfer.buyer_name}</p>
                  </div>
                  <div className="ledger-card-flat">
                    <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider mb-1">Buyer Aadhaar</p>
                    <p className="font-semibold text-[var(--ledger-text)] mono">{selectedTransfer.buyer_aadhaar_id}</p>
                  </div>
                  <div className="ledger-card-flat">
                    <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider mb-1">Agreed Price</p>
                    <p className="font-semibold text-[var(--ledger-gold)]">₹{selectedTransfer.agreed_price.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-[var(--ledger-border)] rounded-xl p-8 text-center">
                  <FileCheck className="w-10 h-10 text-[var(--ledger-muted)] mx-auto mb-3" />
                  <p className="text-[var(--ledger-muted)]">Supporting Documents</p>
                  <p className="text-xs text-[var(--ledger-muted)] mt-1">(Document verification)</p>
                </div>
              </div>
              <div className="p-6 border-t border-[var(--ledger-border)] flex gap-4 justify-end">
                <button
                  onClick={() => setSelectedTransfer(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => { setShowRejectModal(true); }}
                  className="btn-danger"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedTransfer.transfer_id)}
                  disabled={actionLoading === selectedTransfer.transfer_id}
                  className="btn-primary"
                >
                  {actionLoading === selectedTransfer.transfer_id ? 'Approving...' : 'Approve Transfer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedTransfer && (
          <motion.div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[var(--ledger-charcoal)] border border-[var(--ledger-rose)]/50 rounded-2xl max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="p-6 border-b border-[var(--ledger-border)]">
                <h2 className="text-xl font-bold text-[var(--ledger-rose)]">Reject Transfer</h2>
              </div>
              <div className="p-6">
                <p className="text-[var(--ledger-muted)] mb-4">
                  You are about to reject transfer <span className="text-[var(--ledger-text)] mono">{selectedTransfer.transfer_id}</span>.
                </p>
                <label className="block text-sm font-medium text-[var(--ledger-muted)] mb-2">
                  Reason for rejection
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input-field h-32 resize-none"
                  placeholder="Enter the reason for rejection..."
                  required
                />
              </div>
              <div className="p-6 border-t border-[var(--ledger-border)] flex gap-4 justify-end">
                <button
                  onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading === selectedTransfer.transfer_id || !rejectReason.trim()}
                  className="btn-danger"
                >
                  {actionLoading === selectedTransfer.transfer_id ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}