'use client';

import React, { useState } from 'react';
import { loginAdmin } from '@/lib/pb';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await loginAdmin(username, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Access denied. Verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[20%] left-[-10%] w-[40%] aspect-square bg-orange-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] aspect-square bg-blue-500/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="glass p-12 rounded-[3.5rem] shadow-3xl space-y-10 relative overflow-hidden group">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="flex flex-col items-center text-center space-y-6">
                <motion.div 
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 bg-orange-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 relative"
                >
                    <ShieldCheck size={40} />
                    <motion.div 
                        animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 text-orange-200"
                    >
                        <Sparkles size={24} />
                    </motion.div>
                </motion.div>
                
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-white">Secure <span className="gradient-text">Gateway</span></h1>
                    <p className="text-muted-foreground font-medium text-sm">Elite access for administrative orchestration.</p>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 ml-1">Identity Signature</label>
                    <div className="relative group/field">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/field:text-orange-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            required
                            placeholder="Enter username"
                            className="w-full h-18 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-bold group-hover/field:border-white/20"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 ml-1">Access Protocol</label>
                    <div className="relative group/field">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/field:text-orange-500 transition-colors" size={20} />
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full h-18 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-bold group-hover/field:border-white/20"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-center text-xs font-bold flex items-center justify-center gap-2"
                        >
                            <AlertCircle size={14} /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    disabled={loading}
                    className="w-full h-20 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>Establish Secure Session <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                </button>
            </form>

            <div className="pt-4 text-center">
                <p className="text-[10px] font-black italic uppercase tracking-widest text-muted-foreground opacity-50">
                    Proprietary Interface • CateringGo System v2.4
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
