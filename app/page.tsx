'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTomorrowMenu, getTomorrowOrders, getImageUrl, cleanupExpiredData } from '@/lib/pb';
import { MenuItem, CalendarItem, OrderItem } from '@/types/pocketbase';
import { motion } from 'framer-motion';
import { ChefHat, Calendar, ArrowRight, Clock } from 'lucide-react';
import { useTranslation, formatIDR } from '@/lib/utils';

export default function Home() {
  const { t } = useTranslation();
  const [tomorrowMenus, setTomorrowMenus] = useState<CalendarItem[]>([]);
  const [tomorrowOrders, setTomorrowOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Run cleanup silently in background
        await cleanupExpiredData();
        
        const menus = await getTomorrowMenu();
        const orders = await getTomorrowOrders();
        setTomorrowMenus(menus);
        setTomorrowOrders(orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const totalOrders = tomorrowOrders.length;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % tomorrowMenus.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + tomorrowMenus.length) % tomorrowMenus.length);
  };

  const activeMenu = tomorrowMenus[activeIndex];
  const activeOrders = tomorrowOrders.filter(o => o.calendar_id === activeMenu?.id);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-8 py-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              Deni MBG - Dapur Kesayangan Anak MSID
            </div>
            <h1 className="text-4xl md:text-8xl font-black tracking-tight leading-none italic">
                {t.heroTitle}
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground max-w-xl mx-auto font-medium px-4">
                {t.heroSub}
            </p>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
        >
            <Link 
                href="/order" 
                className="inline-flex items-center gap-3 px-10 py-5 rounded-3xl bg-primary text-black font-black text-xl hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20 group"
            >
                {t.orderNow} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </motion.div>
      </section>

      {/* Main Slider Section */}
      <section className="relative">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Kitchen Plans...</p>
             </div>
        ) : tomorrowMenus.length > 0 ? (
          <div className="space-y-8">
            {/* Header Controls */}
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">{t.tomorrowMenu}</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.kitchenPlan} — {activeIndex + 1} of {tomorrowMenus.length}</p>
              </div>
              
              {tomorrowMenus.length > 1 && (
                <div className="flex gap-2">
                  <button onClick={prevSlide} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <ArrowRight size={20} className="rotate-180" />
                  </button>
                  <button onClick={nextSlide} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch min-h-[480px]">
              {/* Menu Details Card */}
              <motion.div 
                  key={`menu-${activeMenu.id}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 flex flex-col justify-center relative overflow-hidden group"
              >
                  {activeMenu.expand?.menu_item?.image && (
                    <div className="absolute inset-0 opacity-10 blur-2xl grayscale group-hover:opacity-20 transition-opacity">
                      <img 
                        src={getImageUrl(activeMenu.expand.menu_item!) || ''} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="relative z-10 space-y-6">
                    {activeMenu.expand?.menu_item?.image && (
                      <div className="w-full h-48 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl skew-y-1">
                        <img 
                          src={getImageUrl(activeMenu.expand.menu_item!) || ''} 
                          alt={activeMenu.expand.menu_item?.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-4xl font-black italic tracking-tighter leading-tight">{activeMenu.expand?.menu_item?.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
                          {activeMenu.expand?.menu_item?.description}
                      </p>
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                      <span className="text-3xl font-black text-primary italic leading-none">{formatIDR(activeMenu.expand?.menu_item?.price || 0)}</span>
                      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-muted-foreground">Premium Selection</div>
                    </div>
                  </div>
              </motion.div>

              {/* Prep List for Specific Menu */}
              <motion.div 
                  key={`prep-${activeMenu.id}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 flex flex-col border-dashed border-white/10"
              >
                  <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                          <ChefHat className="text-primary" /> {t.prepList}
                      </h2>
                      <span className="px-3 py-1 bg-primary text-black text-[10px] font-black rounded-full shadow-lg shadow-primary/20">{activeOrders.length} {t.activeOrders}</span>
                  </div>

                  <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto px-2 custom-scrollbar pr-4">
                      {activeOrders.length > 0 ? (
                          activeOrders.map((order, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.05 * idx }}
                                key={order.id} 
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/5 hover:border-primary/20 transition-all group"
                              >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-black text-xs text-black shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                      {order.buyer_name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{order.buyer_name}</span>
                                  </div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary animate-pulse transition-colors" />
                              </motion.div>
                          ))
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground italic text-sm opacity-50 py-12">
                            <Clock size={48} className="mb-4 text-white/5" />
                            <p className="font-black uppercase tracking-widest text-[10px]">{t.noOrders}</p>
                            <p className="text-[10px] opacity-60">Be the first to secure this meal!</p>
                          </div>
                      )}
                  </div>
              </motion.div>
            </div>
            
            {/* Dots navigation */}
            {tomorrowMenus.length > 1 && (
              <div className="flex justify-center gap-2">
                {tomorrowMenus.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-8 bg-primary shadow-lg shadow-primary/20' : 'w-2 bg-white/10 hover:bg-white/20'}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="glass p-16 rounded-[4rem] text-center space-y-4 border-dashed border-white/10">
              <Clock size={64} className="mx-auto text-primary opacity-20" />
              <h3 className="text-2xl font-black italic">{t.noMenu}</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">The kitchen hasn't announced tomorrow's plan yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* Info Bar */}
      <section className="text-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-6 px-8 py-4 rounded-full bg-white/5 border border-white/10 shadow-lg">
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.kitchenOpen}</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  <span className="text-[10px] font-black tracking-tighter text-muted-foreground uppercase">{t.orderBy} 20:00 WIB</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-tighter text-primary uppercase">Total: {totalOrders} {t.activeOrders}</span>
              </div>
          </div>
      </section>
    </div>
  );
}
