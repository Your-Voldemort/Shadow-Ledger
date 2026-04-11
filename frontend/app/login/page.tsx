'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Hexagon, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.role === 'GOVERNMENT') {
        router.push('/government');
      } else {
        router.push('/citizen');
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = 'Authentication failed';
      
      if (Array.isArray(errorData)) {
        errorMessage = errorData.map((e: any) => e.msg || e.detail || 'Validation error').join(', ');
      } else if (errorData?.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : 'Authentication failed';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ledger-black)] grid-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--ledger-gold)]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--ledger-gold)]/3 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <motion.div 
            className="relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="w-14 h-14 bg-[var(--ledger-gold)] rounded-xl flex items-center justify-center">
              <Hexagon className="w-8 h-8 text-[var(--ledger-black)]" />
            </div>
          </motion.div>
          <div className="text-center">
            <span className="text-3xl font-bold text-[var(--ledger-text)] tracking-tight">SHADOW</span>
            <span className="text-xl font-bold text-[var(--ledger-gold)]">LEDGER</span>
          </div>
        </div>

        {/* Login Card */}
        <motion.div 
          className="bg-[var(--ledger-charcoal)] border border-[var(--ledger-border)] rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--ledger-text)] mb-2">Access Portal</h1>
            <p className="text-[var(--ledger-muted)]">Authenticate to continue</p>
          </div>

          {error && (
            <motion.div 
              className="bg-[var(--ledger-rose)]/10 border border-[var(--ledger-rose)]/30 text-[var(--ledger-rose)] px-4 py-3 rounded-lg mb-6 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--ledger-muted)] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ledger-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ledger-muted)] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ledger-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 pr-12"
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ledger-muted)] hover:text-[var(--ledger-text)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[var(--ledger-black)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Authenticate
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-[var(--ledger-border)]">
            <p className="text-xs text-[var(--ledger-muted)] mb-4 uppercase tracking-wider">Demo Access</p>
            <div className="space-y-3">
              <div className="bg-[var(--ledger-graphite)] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--ledger-muted)]">Government</span>
                  <span className="text-sm text-[var(--ledger-text)] font-mono">office@land.register.gov</span>
                </div>
                <div className="text-xs text-[var(--ledger-gold)] font-mono mt-1">admin123</div>
              </div>
              <div className="bg-[var(--ledger-graphite)] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--ledger-muted)]">Citizen</span>
                  <span className="text-sm text-[var(--ledger-text)] font-mono">arun@example.com</span>
                </div>
                <div className="text-xs text-[var(--ledger-gold)] font-mono mt-1">citizen123</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => router.push('/')}
            className="btn-ghost text-sm"
          >
            ← Return to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}