'use client';

import { useRouter } from 'next/navigation';
import { Shield, Search, FileCheck, Clock, ArrowRight, Hexagon, Database, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--ledger-black)] grid-bg relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--ledger-gold)]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--ledger-gold)]/3 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Header */}
      <header className="relative border-b border-[var(--ledger-border)] bg-[var(--ledger-black)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-[var(--ledger-gold)] rounded-lg flex items-center justify-center">
                <Hexagon className="w-6 h-6 text-[var(--ledger-black)]" />
              </div>
              <div className="absolute inset-0 bg-[var(--ledger-gold)]/20 rounded-lg animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold text-[var(--ledger-text)] tracking-tight">SHADOW-LEDGER</span>
              <span className="text-[var(--ledger-gold)] text-xs ml-2 font-mono">V1.0</span>
            </div>
          </motion.div>
          
          <motion.nav 
            className="flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <a href="#features" className="btn-ghost text-sm">Features</a>
            <a href="#how-it-works" className="btn-ghost text-sm">Process</a>
            <button 
              onClick={() => router.push('/verify')}
              className="btn-ghost text-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Verify
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="btn-primary text-sm"
            >
              Sign In
            </button>
          </motion.nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div 
              className="inline-flex items-center gap-3 bg-[var(--ledger-graphite)] border border-[var(--ledger-border)] rounded-full px-5 py-2 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-2 h-2 bg-[var(--ledger-gold)] rounded-full animate-pulse-gold" />
              <span className="text-[var(--ledger-muted)] text-sm font-medium mono">DECENTRALIZED LAND REGISTRY</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-[var(--ledger-text)] mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Immutable Land
              <br />
              <span className="text-[var(--ledger-gold)] gold-text-glow">Ownership Records</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-[var(--ledger-muted)] mb-10 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Cryptographically secured land ownership on a private blockchain. 
              Eliminate fraud with verifiable, tamper-proof records.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button 
                onClick={() => router.push('/login')}
                className="btn-primary flex items-center gap-2 px-8 py-4 text-base"
              >
                Enter Portal <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => router.push('/verify')}
                className="btn-secondary flex items-center gap-2 px-8 py-4 text-base"
              >
                <Search className="w-5 h-5" /> Verify Property
              </button>
            </motion.div>
          </div>

          {/* Hero visual element */}
          <motion.div 
            className="mt-20 relative max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-[var(--ledger-charcoal)] border border-[var(--ledger-border)] rounded-2xl p-6 gold-glow">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--ledger-border)]">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[var(--ledger-gold)]" />
                  <span className="text-sm font-medium text-[var(--ledger-text)] mono">BLOCK #1,247</span>
                </div>
                <span className="text-xs text-[var(--ledger-muted)]">Just now</span>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--ledger-muted)]">Property ID:</span>
                  <span className="text-[var(--ledger-text)]">PROP-0847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ledger-muted)]">From:</span>
                  <span className="text-[var(--ledger-text)]">Rajesh Kumar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ledger-muted)]">To:</span>
                  <span className="text-[var(--ledger-gold)]">Priya Sharma</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ledger-muted)]">Value:</span>
                  <span className="text-[var(--ledger-text)]">₹12,500,000</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--ledger-border)]">
                <div className="text-xs text-[var(--ledger-muted)] mb-1">SHA-256 Hash</div>
                <div className="text-xs text-[var(--ledger-gold)] font-mono break-all">7f3a...9c2d</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[var(--ledger-charcoal)]/50 border-y border-[var(--ledger-border)]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--ledger-text)] mb-4 tracking-tight">
              System <span className="text-[var(--ledger-gold)]">Capabilities</span>
            </h2>
            <p className="text-[var(--ledger-muted)] text-lg max-w-xl mx-auto">
              Enterprise-grade features for land registry management
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Lock,
                title: 'Immutable Records',
                description: 'Every transaction cryptographically linked to the previous block, creating an unbroken chain.'
              },
              {
                icon: Search,
                title: 'Public Verification',
                description: 'Anyone can verify ownership using Property ID with cryptographic proof.'
              },
              {
                icon: FileCheck,
                title: 'Document Security',
                description: 'Off-chain document storage with hash verification ensures complete integrity.'
              },
              {
                icon: Clock,
                title: 'Real-time Tracking',
                description: 'Track transfer status from submission to blockchain confirmation instantly.'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="ledger-card group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-12 h-12 bg-[var(--ledger-graphite)] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[var(--ledger-gold)]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[var(--ledger-gold)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--ledger-text)] mb-2">{feature.title}</h3>
                <p className="text-[var(--ledger-muted)] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--ledger-text)] mb-4 tracking-tight">
              Transfer <span className="text-[var(--ledger-gold)]">Workflow</span>
            </h2>
            <p className="text-[var(--ledger-muted)] text-lg">Three-step process for secure land transfers</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Initiate Transfer', desc: 'Property owner selects land and enters buyer details with supporting documents.' },
              { step: '02', title: 'Official Review', desc: 'Government officer verifies documents, confirms details, and approves or rejects.' },
              { step: '03', title: 'Block Minted', desc: 'Approved transfer becomes a permanent blockchain record with cryptographic proof.' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
              >
                <div className="bg-[var(--ledger-charcoal)] border border-[var(--ledger-border)] rounded-2xl p-8 h-full">
                  <span className="text-7xl font-bold text-[var(--ledger-gold)]/10 mono absolute top-4 right-4">{item.step}</span>
                  <h3 className="text-xl font-semibold text-[var(--ledger-text)] mt-4 mb-3">{item.title}</h3>
                  <p className="text-[var(--ledger-muted)] text-sm leading-relaxed">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-[var(--ledger-gold)] rounded-full flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-[var(--ledger-black)]" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--ledger-border)] py-8 bg-[var(--ledger-black)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hexagon className="w-4 h-4 text-[var(--ledger-gold)]" />
            <span className="text-[var(--ledger-muted)] text-sm">Shadow-Ledger v1.0</span>
          </div>
          <p className="text-[var(--ledger-muted)] text-sm">© 2024 Blockchain Land Registry System</p>
        </div>
      </footer>
    </div>
  );
}