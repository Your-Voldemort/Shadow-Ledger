'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { transfersAPI } from '@/lib/api';

export default function InitiateTransfer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('property_id');
  
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_aadhaar_id: '',
    agreed_price: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      setError('Property ID is required');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await transfersAPI.initiate({
        property_id: propertyId,
        buyer_name: formData.buyer_name,
        buyer_aadhaar_id: formData.buyer_aadhaar_id,
        agreed_price: parseFloat(formData.agreed_price),
      });
      setSuccess(true);
      setTimeout(() => router.push('/citizen'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initiate transfer');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Transfer Initiated!</h2>
          <p className="text-slate-600">Your transfer request has been submitted for government review.</p>
          <p className="text-slate-500 text-sm mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-primary text-white p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <span className="font-bold">Initiate Transfer</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div className="card">
          <div className="mb-6 pb-4 border-b border-slate-200">
            <p className="text-slate-500 text-sm">Transferring Property</p>
            <p className="text-xl font-semibold text-slate-800">{propertyId}</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buyer Full Name
              </label>
              <input
                type="text"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                className="input"
                placeholder="Enter buyer's full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buyer Aadhaar ID
              </label>
              <input
                type="text"
                value={formData.buyer_aadhaar_id}
                onChange={(e) => setFormData({ ...formData, buyer_aadhaar_id: e.target.value })}
                className="input"
                placeholder="12-digit Aadhaar ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sale Price (₹)
              </label>
              <input
                type="number"
                value={formData.agreed_price}
                onChange={(e) => setFormData({ ...formData, agreed_price: e.target.value })}
                className="input"
                placeholder="Enter agreed sale price"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 mb-1">Upload Supporting Documents</p>
              <p className="text-slate-400 text-sm">Drag and drop or click to upload</p>
              <p className="text-slate-400 text-xs mt-2">(Document upload coming soon)</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Transfer Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}