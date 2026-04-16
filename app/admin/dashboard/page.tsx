'use client';

import React, { useEffect, useState } from 'react';
import { pb } from '@/lib/pb';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LayoutGrid, Calendar, UtensilsCrossed, LogOut, Settings, TrendingUp, ShieldCheck, ChevronRight, PieChart, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ menuItems: 0, futureOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/login');
      return;
    }

    async function fetchStats() {
        try {
            const menuItems = await pb.collection('menu').getList(1, 1);
            const futureOrders = await pb.collection('orders').getList(1, 1);
            setStats({
                menuItems: menuItems.totalItems,
                futureOrders: futureOrders.totalItems
            });
        } catch (err) {}
        setLoading(false);
    }
    fetchStats();
  }, [router]);

  const handleLogout = () => {
    pb.authStore.clear();
    router.push('/');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
        >
            <div className="flex items-center gap-2 text-orange-500 font-black italic uppercase tracking-widest text-[10px]">
                <Activity size={14} />
                Live Command Center
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white">Admin <span className="gradient-text">Elite</span></h1>
            <p className="text-muted-foreground font-medium">Hello, Chef. Here's your kitchen overview.</p>
        </motion.div>
        
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
        >
            <div className="flex flex-col items-end mr-2">
                <p className="text-sm font-bold text-white leading-none">{pb.authStore.model?.username || 'Admin User'}</p>
                <p className="text-[10px] font-black uppercase text-orange-500 tracking-tighter mt-1">Super Admin</p>
            </div>
            <button 
                onClick={handleLogout}
                className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-xl shadow-red-500/5 group"
            >
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
        </motion.div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
      >
            {[
                { label: 'Kitchen Inventory', value: stats.menuItems, sub: 'Menu Items', icon: UtensilsCrossed, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { label: 'Demand Surge', value: stats.futureOrders, sub: 'Active Orders', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
                { label: 'Market Share', value: '48%', sub: 'Avg Growth', icon: PieChart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Security Protocols', value: 'Active', sub: 'System Safe', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' }
            ].map((stat, i) => (
                <motion.div 
                    key={i}
                    variants={item}
                    className="glass p-8 rounded-[2.5rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:bg-white/[0.04] transition-all"
                >
                    <div className="absolute top-0 right-0 p-6 text-white/5 -mr-4 -mt-4 transform group-hover:scale-110 transition-transform">
                        <stat.icon size={80} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black italic tracking-wider whitespace-nowrap">{stat.value}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Link href="/admin/menu" className="group">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass p-12 rounded-[3.5rem] border border-orange-500/10 hover:border-orange-500/40 hover:bg-orange-500/[0.02] transition-all relative overflow-hidden h-80 flex flex-col justify-end"
            >
                <div className="absolute top-10 right-10 text-orange-500/5 group-hover:text-orange-500/15 transition-all scale-150 transform group-hover:rotate-12">
                    <UtensilsCrossed size={180} />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="w-16 h-1 w-px bg-orange-500 mb-6" />
                    <h2 className="text-4xl font-black italic tracking-tighter">Kitchen <br /> Collection</h2>
                    <p className="text-muted-foreground font-medium max-w-xs leading-relaxed">Curate your premium menu items, define flavors, and manage your culinary identity.</p>
                    <div className="pt-6 flex items-center gap-3 text-orange-500 font-black italic text-sm group-hover:gap-5 transition-all">
                        MANAGE REPERTOIRE <ChevronRight size={18} />
                    </div>
                </div>
            </motion.div>
        </Link>

        <Link href="/admin/calendar" className="group">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass p-12 rounded-[3.5rem] border border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all relative overflow-hidden h-80 flex flex-col justify-end"
            >
                <div className="absolute top-10 right-10 text-blue-500/5 group-hover:text-blue-500/15 transition-all scale-150 transform group-hover:rotate-12">
                    <Calendar size={180} />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="w-16 h-1 w-px bg-blue-500 mb-6" />
                    <h2 className="text-4xl font-black italic tracking-tighter">Event <br /> Chronology</h2>
                    <p className="text-muted-foreground font-medium max-w-xs leading-relaxed">Architect your delivery schedule. Assign dishes to dates and orchestrate your service.</p>
                    <div className="pt-6 flex items-center gap-3 text-blue-500 font-black italic text-sm group-hover:gap-5 transition-all">
                        ACCESS SCHEDULER <ChevronRight size={18} />
                    </div>
                </div>
            </motion.div>
        </Link>
      </div>
    </div>
  );
}
