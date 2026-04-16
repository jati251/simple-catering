'use client';

import React, { useEffect, useState } from 'react';
import { pb, createOrder } from '@/lib/pb';
import { CalendarItem } from '@/types/pocketbase';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, User, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrderPage() {
  const [availableDates, setAvailableDates] = useState<CalendarItem[]>([]);
  const [selectedDateId, setSelectedDateId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const router = useRouter();

  useEffect(() => {
    async function fetchDates() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const records = await pb.collection('calendar').getFullList<CalendarItem>({
          filter: `date >= "${today}"`,
          expand: 'menu_item',
          sort: 'date',
          requestKey: null,
        });
        setAvailableDates(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateId || !buyerName) return;

    setSubmitting(true);
    setStatus('idle');
    try {
      await createOrder(buyerName, selectedDateId);
      setStatus('success');
      setTimeout(() => router.push('/'), 2500);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItem = availableDates.find(d => d.id === selectedDateId);

  return (
    <div className="relative min-h-[90vh] py-24 px-6 overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute top-[20%] right-[-10%] w-[50%] aspect-square bg-orange-500/5 blur-[150px] rounded-full" />
      
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
        <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-10 sticky top-32"
        >
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest">
                    <ShoppingBag size={12} />
                    Secure Checkout
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-white leading-[0.9]">
                    Reserve <br /> Your <span className="gradient-text">Delicacy</span>.
                </h1>
                <p className="text-muted-foreground font-medium max-w-sm leading-relaxed">
                    Select your preferred date and we'll ensure your meal is prepared with the utmost care by our executive chefs.
                </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-6">
                <h3 className="text-sm font-black italic tracking-wider text-white uppercase opacity-50 flex items-center gap-2">
                    <Info size={16} /> Order Summary
                </h3>
                {selectedItem ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none mb-2">Selected Menu</p>
                            <h4 className="text-2xl font-black italic text-white leading-tight">{selectedItem.expand?.menu_item?.name}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Date</p>
                                <p className="font-bold text-sm text-white">{new Date(selectedItem.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Price</p>
                                <p className="font-bold text-sm text-orange-500">${selectedItem.expand?.menu_item?.price || '25'}</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="py-10 text-center space-y-3 opacity-30">
                        <ShoppingBag size={40} className="mx-auto" />
                        <p className="text-xs font-bold italic">Select a date to view menu details</p>
                    </div>
                )}
            </div>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 w-full"
        >
            <form onSubmit={handleSubmit} className="glass p-10 rounded-[3rem] shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 text-orange-500/5 -mr-8 -mt-8 rotate-12">
                    <CalendarIcon size={240} />
                </div>

                <div className="relative z-10 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
                                <User size={16} />
                            </div>
                            <h3 className="text-xl font-black italic tracking-tight">Identity</h3>
                        </div>
                        <input 
                            type="text" 
                            required
                            placeholder="Type your full name..."
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold placeholder:opacity-30"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                                <CalendarIcon size={16} />
                            </div>
                            <h3 className="text-xl font-black italic tracking-tight">Timeline Selections</h3>
                        </div>
                        
                        {loading ? (
                            <div className="grid grid-cols-2 gap-3">
                                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-3xl" />)}
                            </div>
                        ) : availableDates.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {availableDates.map((item) => {
                                    const dateObj = new Date(item.date);
                                    const isSelected = selectedDateId === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSelectedDateId(item.id)}
                                            className={`p-5 rounded-3xl border transition-all text-left relative overflow-hidden group ${
                                                isSelected 
                                                ? 'bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/20 scale-[1.02]' 
                                                : 'bg-white/5 border-white/10 hover:border-orange-500/30'
                                            }`}
                                        >
                                            <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isSelected ? 'text-white/80' : 'text-orange-500'}`}>
                                                {dateObj.toLocaleDateString(undefined, { weekday: 'long' })}
                                            </div>
                                            <p className="text-xl font-black italic tracking-tighter leading-none mb-1">
                                                {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className={`text-[10px] font-bold truncate opacity-60 ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
                                                {item.expand?.menu_item?.name || 'Curating...'}
                                            </p>
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 space-y-4 opacity-50">
                                <AlertCircle size={32} className="mx-auto" />
                                <p className="font-bold italic text-sm">No reservations available currently.</p>
                            </div>
                        )}
                    </div>

                    <button
                        disabled={submitting || !selectedDateId || !buyerName || status === 'success'}
                        className="relative w-full h-20 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-500/30 transition-all flex items-center justify-center gap-3 btn-premium overflow-hidden group"
                    >
                        {submitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : status === 'success' ? (
                            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                                Reservation Confirmed! <CheckCircle2 size={24} />
                            </motion.div>
                        ) : (
                            <>Confirm Your Gourment Reservation <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                    
                    <AnimatePresence>
                        {status === 'error' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-center text-xs font-bold flex items-center justify-center gap-2"
                            >
                                <AlertCircle size={14} /> System unavailable. Please retry.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </form>
        </motion.div>
      </div>
    </div>
  );
}
