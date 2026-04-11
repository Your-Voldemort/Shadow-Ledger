'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, FileCheck, XCircle, ArrowRightLeft, LogOut, Menu, X, Search, Eye } from 'lucide-react';
import { transfersAPI } from '@/lib/api';
import { Transfer, User } from '@/lib/types';

export default function GovernmentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
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
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <span className="font-bold">Shadow-Ledger</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-0 z-40 bg-primary w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Shadow-Ledger</span>
            </div>
            
            <div className="mb-6 pb-6 border-b border-slate-700">
              <p className="text-slate-400 text-sm">Welcome</p>
              <p className="text-white font-medium">{user.full_name}</p>
              <p className="text-amber-400 text-sm">Government Portal</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => { setActiveTab('pending'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <FileCheck className="w-5 h-5" /> Pending Reviews
              </button>
              <button
                onClick={() => router.push('/verify')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Search className="w-5 h-5" /> Verify Property
              </button>
              <button
                onClick={() => router.push('/government/blockchain')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" /> Blockchain
              </button>
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors mt-8"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Transfer Requests</h1>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                <span className="text-amber-700 font-medium">{transfers.length} Pending</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : transfers.length === 0 ? (
              <div className="card text-center py-12">
                <FileCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">No pending transfer requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transfers.map((transfer) => (
                  <div key={transfer.transfer_id} className="card hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-slate-800">{transfer.transfer_id}</span>
                          <span className={getStatusClass(transfer.status)}>{transfer.status}</span>
                        </div>
                        <p className="text-slate-600">Property: {transfer.property_id}</p>
                        <p className="text-slate-500 text-sm mt-1">
                          Seller: {transfer.seller_name} • Buyer: {transfer.buyer_name}
                        </p>
                        <p className="text-slate-500 text-sm">
                          Price: ₹{transfer.agreed_price.toLocaleString()} • Aadhaar: {transfer.buyer_aadhaar_id}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedTransfer(transfer)}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> Review
                        </button>
                        <button
                          onClick={() => { setSelectedTransfer(transfer); setShowRejectModal(true); }}
                          className="btn-danger flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(transfer.transfer_id)}
                          disabled={actionLoading === transfer.transfer_id}
                          className="btn-primary flex items-center gap-2"
                        >
                          {actionLoading === transfer.transfer_id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FileCheck className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500 mt-2">
                      Created: {new Date(transfer.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {selectedTransfer && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Transfer Review</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 text-sm">Transfer ID</p>
                  <p className="font-semibold">{selectedTransfer.transfer_id}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Property ID</p>
                  <p className="font-semibold">{selectedTransfer.property_id}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Seller Name</p>
                  <p className="font-semibold">{selectedTransfer.seller_name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Buyer Name</p>
                  <p className="font-semibold">{selectedTransfer.buyer_name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Buyer Aadhaar</p>
                  <p className="font-semibold">{selectedTransfer.buyer_aadhaar_id}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Agreed Price</p>
                  <p className="font-semibold">₹{selectedTransfer.agreed_price.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <p className="text-slate-500">Supporting Documents</p>
                <p className="text-slate-400 text-sm">(Document preview coming soon)</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-4 justify-end">
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
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Reject Transfer</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-4">
                You are about to reject transfer <strong>{selectedTransfer.transfer_id}</strong>.
              </p>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input h-32 resize-none"
                placeholder="Enter reason..."
                required
              />
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-4 justify-end">
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
          </div>
        </div>
      )}
    </div>
  );
}