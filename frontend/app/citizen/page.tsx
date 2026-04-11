'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Home, ArrowRightLeft, Clock, LogOut, Menu, X } from 'lucide-react';
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
              <p className="text-emerald-400 text-sm">Citizen Portal</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => { setActiveTab('properties'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'properties' ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <Home className="w-5 h-5" /> My Properties
              </button>
              <button
                onClick={() => { setActiveTab('transfers'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'transfers' ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                <ArrowRightLeft className="w-5 h-5" /> My Transfers
              </button>
              <button
                onClick={() => router.push('/verify')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <Clock className="w-5 h-5" /> Verify Property
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
            <h1 className="text-2xl font-bold text-slate-800 mb-6">
              {activeTab === 'properties' ? 'My Properties' : 'My Transfer Requests'}
            </h1>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : activeTab === 'properties' ? (
              <div className="space-y-4">
                {properties.length === 0 ? (
                  <div className="card text-center py-12">
                    <Home className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No properties found</p>
                  </div>
                ) : (
                  properties.map((property) => (
                    <div key={property.property_id} className="card hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-semibold text-slate-800">{property.property_id}</span>
                            <span className={property.status === 'CLEAR' ? 'status-approved' : 'status-pending'}>
                              {property.status === 'CLEAR' ? 'Clear' : 'Pending Transfer'}
                            </span>
                          </div>
                          <p className="text-slate-600">{property.location_address}</p>
                          <p className="text-slate-500 text-sm mt-1">{property.area_sqft} sq ft</p>
                        </div>
                        {property.status === 'CLEAR' && (
                          <button
                            onClick={() => router.push(`/citizen/transfer?property_id=${property.property_id}`)}
                            className="btn-primary flex items-center gap-2"
                          >
                            <ArrowRightLeft className="w-4 h-4" /> Transfer
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {transfers.length === 0 ? (
                  <div className="card text-center py-12">
                    <ArrowRightLeft className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No transfer requests</p>
                  </div>
                ) : (
                  transfers.map((transfer) => (
                    <div key={transfer.transfer_id} className="card hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-semibold text-slate-800">{transfer.transfer_id}</span>
                            <span className={getStatusClass(transfer.status)}>{transfer.status}</span>
                          </div>
                          <p className="text-slate-600">Property: {transfer.property_id}</p>
                          <p className="text-slate-500 text-sm mt-1">
                            To: {transfer.buyer_name} • ₹{transfer.agreed_price.toLocaleString()}
                          </p>
                          {transfer.rejection_reason && (
                            <p className="text-rose-500 text-sm mt-2">Reason: {transfer.rejection_reason}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-slate-500">
                          {new Date(transfer.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}