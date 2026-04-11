'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Home, ArrowRightLeft, Clock, LogOut, Menu, X, Hexagon, ChevronRight, MapPin, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertiesAPI, transfersAPI } from '@/lib/api';
import { Property, Transfer, User } from '@/lib/types';

export default function CitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'properties' | 'transfers'>('properties');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propsRes, transfersRes] = await Promise.all([
        propertiesAPI.getMyProperties(),
        transfersAPI.getMyTransfers(),
      ]);
      setProperties(propsRes.data);
      setTransfers(transfersRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
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
        {/* Sidebar */}
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
              <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider mb-1">Citizen Portal</p>
              <p className="text-[var(--ledger-text)] font-medium">{user.full_name}</p>
              <p className="text-sm text-[var(--ledger-muted)] mono">{user.email}</p>
            </div>

            <nav className="space-y-2 flex-1">
              <button
                onClick={() => { setActiveTab('properties'); setSidebarOpen(false); }}
                className={`sidebar-link w-full ${activeTab === 'properties' ? 'sidebar-link-active' : ''}`}
              >
                <Home className="w-5 h-5" /> My Properties
              </button>
              <button
                onClick={() => { setActiveTab('transfers'); setSidebarOpen(false); }}
                className={`sidebar-link w-full ${activeTab === 'transfers' ? 'sidebar-link-active' : ''}`}
              >
                <ArrowRightLeft className="w-5 h-5" /> Transfer Requests
              </button>
              <button
                onClick={() => router.push('/verify')}
                className="sidebar-link w-full"
              >
                <Clock className="w-5 h-5" /> Verify Property
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
              className="mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold text-[var(--ledger-text)] mb-2">
                {activeTab === 'properties' ? 'My Properties' : 'Transfer Requests'}
              </h1>
              <p className="text-[var(--ledger-muted)]">
                {activeTab === 'properties' 
                  ? 'View and manage your registered land holdings' 
                  : 'Track your property transfer applications'}
              </p>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[var(--ledger-gold)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeTab === 'properties' ? (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {properties.length === 0 ? (
                  <div className="ledger-card text-center py-12">
                    <Home className="w-10 h-10 text-[var(--ledger-muted)] mx-auto mb-4" />
                    <p className="text-[var(--ledger-muted)]">No properties registered</p>
                  </div>
                ) : (
                  properties.map((property, idx) => (
                    <motion.div 
                      key={property.property_id}
                      className="ledger-card group cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => property.status === 'CLEAR' && router.push(`/citizen/transfer?property_id=${property.property_id}`)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-semibold text-[var(--ledger-text)] mono">{property.property_id}</span>
                            <span className={property.status === 'CLEAR' ? 'status-clear' : 'status-pending'}>
                              {property.status === 'CLEAR' ? 'Clear Title' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[var(--ledger-muted)] text-sm">
                            <MapPin className="w-4 h-4" />
                            {property.location_address}
                          </div>
                          <div className="flex items-center gap-2 text-[var(--ledger-muted)] text-sm mt-1">
                            <Calculator className="w-4 h-4" />
                            {property.area_sqft.toLocaleString()} sq ft
                          </div>
                        </div>
                        {property.status === 'CLEAR' && (
                          <div className="flex items-center gap-2 text-[var(--ledger-gold)] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Initiate Transfer <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {transfers.length === 0 ? (
                  <div className="ledger-card text-center py-12">
                    <ArrowRightLeft className="w-10 h-10 text-[var(--ledger-muted)] mx-auto mb-4" />
                    <p className="text-[var(--ledger-muted)]">No transfer requests</p>
                  </div>
                ) : (
                  transfers.map((transfer, idx) => (
                    <motion.div 
                      key={transfer.transfer_id}
                      className="ledger-card"
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
                          <p className="text-[var(--ledger-muted)] text-sm">Property: <span className="mono text-[var(--ledger-text)]">{transfer.property_id}</span></p>
                          <p className="text-[var(--ledger-muted)] text-sm mt-1">
                            To: <span className="text-[var(--ledger-text)]">{transfer.buyer_name}</span> • 
                            <span className="text-[var(--ledger-gold)] ml-1">₹{transfer.agreed_price.toLocaleString()}</span>
                          </p>
                          {transfer.rejection_reason && (
                            <p className="text-[var(--ledger-rose)] text-sm mt-2">Reason: {transfer.rejection_reason}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-[var(--ledger-muted)] mono">
                          {new Date(transfer.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}