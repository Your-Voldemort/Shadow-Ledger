'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, Upload, Loader2, Hexagon, User, Fingerprint, Banknote, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { transfersAPI } from '@/lib/api';

function TransferForm() {
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
      const errorData = err.response?.data;
      let errorMessage = 'Failed to initiate transfer';
      
      if (Array.isArray(errorData)) {
        errorMessage = errorData.map((e: any) => e.msg || e.detail || 'Transfer error').join(', ');
      } else if (errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : 'Failed to initiate transfer';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--ledger-black)] grid-bg flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--ledger-gold)]/10 rounded-full blur-[150px]" />
        </div>
        <motion.div 
          className="max-w-md w-full text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="w-20 h-20 bg-[var(--ledger-gold)]/20 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle className="w-10 h-10 text-[var(--ledger-gold)]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[var(--ledger-text)] mb-2">Transfer Initiated</h2>
          <p className="text-[var(--ledger-muted)]">Your transfer request has been submitted for government review.</p>
          <p className="text-[var(--ledger-muted)] text-sm mt-4">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ledger-black)]">
      {/* Header */}
      <header className="bg-[var(--ledger-charcoal)] border-b border-[var(--ledger-border)] p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 text-[var(--ledger-muted)] hover:text-[var(--ledger-text)] hover:bg-[var(--ledger-graphite)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Hexagon className="w-6 h-6 text-[var(--ledger-gold)]" />
            <span className="font-bold text-[var(--ledger-text)]">Initiate Transfer</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <motion.div 
          className="ledger-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 pb-6 border-b border-[var(--ledger-border)]">
            <p className="text-xs text-[var(--ledger-muted)] uppercase tracking-wider mb-1">Transferring Property</p>
            <p className="text-xl font-semibold text-[var(--ledger-text)] mono">{propertyId}</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                className="bg-[var(--ledger-rose)]/10 border border-[var(--ledger-rose)]/30 text-[var(--ledger-rose)] px-4 py-3 rounded-lg mb-6 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--ledger-muted)] mb-2">
                Buyer Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ledger-muted)]" />
                <input
                  type="text"
                  value={formData.buyer_name}
                  onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                  className="input-field pl-11"
                  placeholder="Enter buyer's full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ledger-muted)] mb-2">
                Buyer Aadhaar ID
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ledger-muted)]" />
                <input
                  type="text"
                  value={formData.buyer_aadhaar_id}
                  onChange={(e) => setFormData({ ...formData, buyer_aadhaar_id: e.target.value })}
                  className="input-field pl-11 mono"
                  placeholder="123456789012"
                  maxLength={12}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ledger-muted)] mb-2">
                Sale Price (₹)
              </label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ledger-muted)]" />
                <input
                  type="number"
                  value={formData.agreed_price}
                  onChange={(e) => setFormData({ ...formData, agreed_price: e.target.value })}
                  className="input-field pl-11"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-[var(--ledger-border)] rounded-xl p-8 text-center hover:border-[var(--ledger-gold)]/50 transition-colors cursor-pointer">
              <FileText className="w-10 h-10 text-[var(--ledger-muted)] mx-auto mb-3" />
              <p className="text-[var(--ledger-text)] mb-1">Upload Supporting Documents</p>
              <p className="text-[var(--ledger-muted)] text-sm">Drag and drop or click to upload</p>
              <p className="text-[var(--ledger-muted)] text-xs mt-2">(Coming soon)</p>
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
        </motion.div>
      </main>
    </div>
  );
}

export default function InitiateTransfer() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--ledger-black)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--ledger-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TransferForm />
    </Suspense>
  );
}