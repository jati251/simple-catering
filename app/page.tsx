'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTomorrowMenu, getTomorrowOrders } from '@/lib/pb';
import { MenuItem, CalendarItem, OrderItem } from '@/types/pocketbase';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChefHat, ShoppingBasket, Calendar, ArrowRight, Star, Clock, Users } from 'lucide-react';

export default function Home() {
  const [tomorrowMenu, setTomorrowMenu] = useState<CalendarItem | null>(null);
  const [tomorrowOrders, setTomorrowOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    async function fetchData() {
      try {
        const menu = await getTomorrowMenu();
        const orders = await getTomorrowOrders();
        setTomorrowMenu(menu);
        setTomorrowOrders(orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalOrders = tomorrowOrders.reduce((sum, order) => sum + (order.quantity || 1), 0);

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-orange-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-blue-500/5 blur-[120px] rounded-full" />

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <section className="flex flex-col lg:flex-row items-center justify-between gap-16 py-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 space-y-8"
          >
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest"
            >
              <Star size={14} fill="currentColor" />
              Trusted by 500+ Happy Customers
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-balance">
              Gourmet <br />
              <span className="gradient-text">Catering</span> <br />
              Redefined.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Elevate your daily dining with professional chef-prepared meals delivered fresh to your doorstep. Simple ordering, premium taste.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href="/order" 
                className="px-10 py-5 rounded-full bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 transition-all shadow-2xl shadow-orange-500/40 flex items-center gap-3 group btn-premium"
              >
                Order Now <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex items-center gap-6 px-4">
                  <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-zinc-800 overflow-hidden">
                              <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                          </div>
                      ))}
                  </div>
                  <div className="text-sm">
                      <p className="font-bold underline cursor-pointer hover:text-orange-500">Join our community</p>
                  </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            style={{ y: y1 }}
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "backOut" }}
            className="flex-1 relative"
          >
            <div className="w-full aspect-[4/5] rounded-[3rem] bg-gradient-to-br from-zinc-800 to-black shadow-[0_0_80px_-20px_rgba(249,115,22,0.3)] overflow-hidden relative group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
               
               <div className="absolute top-6 right-6 flex gap-2">
                    <div className="glass px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">Premium</div>
                    <div className="glass px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter text-orange-500">Chef Special</div>
               </div>

               <div className="absolute bottom-10 left-10 right-10 space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass p-6 rounded-[2rem]"
                  >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-orange-500" />
                                <span className="text-xs font-bold text-white/70">Fresh Delivery Daily</span>
                            </div>
                            <Star size={16} className="text-orange-500 fill-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">The Ultimate Food Experience</h3>
                  </motion.div>
               </div>
            </div>
            
            {/* Floating Card */}
            <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-12 top-1/2 glass p-6 rounded-3xl shadow-2xl hidden xl:block"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground">Active Buyers</p>
                        <p className="text-xl font-black italic tracking-wider">1.2K</p>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        </section>

        <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
            {/* Tomorrow's Menu */}
            <motion.div 
                variants={item}
                className="glass p-10 rounded-[3rem] space-y-6 relative overflow-hidden group hover:bg-white/[0.08] transition-colors"
            >
                <div className="absolute -top-4 -right-4 text-orange-500/5 group-hover:text-orange-500/10 transition-colors">
                    <Calendar size={180} />
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tight flex items-center gap-3">
                        <Calendar className="text-orange-500" />
                        Next Menu
                    </h2>
                    <div className="px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-black uppercase tracking-tighter text-orange-500">
                        Scheduled
                    </div>
                </div>
                
                <div className="relative z-10 p-8 rounded-[2rem] bg-black/40 border border-white/5 h-64 flex flex-col justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs font-bold text-muted-foreground animate-pulse">Syncing Kitchen...</p>
                        </div>
                    ) : tomorrowMenu ? (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Tomorrow's Selection</p>
                                <h3 className="text-4xl font-black text-white leading-tight">{tomorrowMenu.expand?.menu_item?.name}</h3>
                            </div>
                            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">{tomorrowMenu.expand?.menu_item?.description}</p>
                            <div className="pt-4 flex items-center gap-4">
                                <div className="text-2xl font-black text-orange-500 italic">${tomorrowMenu.expand?.menu_item?.price || '25'}</div>
                                <div className="h-4 w-px bg-white/10" />
                                <div className="text-xs font-bold text-muted-foreground">All inclusive</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <ChefHat size={48} className="mx-auto text-muted-foreground/20" />
                            <p className="text-muted-foreground italic font-medium">Chef is currently planning <br /> something amazing.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Prep List */}
            <motion.div 
                variants={item}
                className="glass p-10 rounded-[3rem] space-y-6 relative overflow-hidden group bg-orange-500/[0.02] hover:bg-orange-500/[0.04] transition-colors"
            >
                <div className="absolute -top-4 -right-4 text-orange-500/5 group-hover:text-orange-500/10 transition-colors">
                    <ChefHat size={180} />
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tight flex items-center gap-3">
                        <ChefHat className="text-orange-500" />
                        Today Prep
                    </h2>
                    <span className="px-5 py-2 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
                        {totalOrders} Active Orders
                    </span>
                </div>
                
                <div className="relative z-10 h-64 overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                    {loading ? (
                         <div className="h-full flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : tomorrowOrders.length > 0 ? (
                        tomorrowOrders.map((order, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={order.id} 
                                className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all card-hover"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-sm text-white shadow-lg">
                                        {order.buyer_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white leading-none">{order.buyer_name}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">{new Date(order.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Recorded</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-500 border border-orange-500/20">
                                    <ShoppingBasket size={14} />
                                    <span className="font-black text-sm">x{order.quantity || 1}</span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <Clock size={48} className="text-muted-foreground" />
                            <p className="text-muted-foreground italic font-medium leading-relaxed">Preparation starts when <br /> orders arrive.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
