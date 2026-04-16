'use client';

import React, { useEffect, useState } from 'react';
import { pb, getMenuItems, setFoodForDate } from '@/lib/pb';
import { MenuItem, CalendarItem } from '@/types/pocketbase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar as CalendarIcon, Check, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function CalendarConfig() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [scheduledDates, setScheduledDates] = useState<CalendarItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const items = await getMenuItems();
      setMenuItems(items);
      
      const calendar = await pb.collection('calendar').getFullList<CalendarItem>({
        sort: 'date',
        expand: 'menu_item',
      });
      setScheduledDates(calendar);
    } catch (err) {}
    setLoading(false);
  }

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const handleSave = async () => {
    if (!selectedDate || !selectedMenuId) return;
    setSaving(true);
    try {
      await setFoodForDate(selectedDate, selectedMenuId);
      fetchData();
    } catch (err) {}
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/admin/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold">Calendar <span className="text-blue-500">Config</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Config Panel */}
            <div className="lg:col-span-4 space-y-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-8 rounded-3xl space-y-6"
                >
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                            <CalendarIcon size={14} /> Select Date
                        </label>
                        <input 
                            type="date"
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 focus:ring-2 focus:ring-blue-500/50 outline-none color-scheme-dark"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                            <Utensils size={14} /> Assign Menu
                        </label>
                        <select 
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
                            value={selectedMenuId}
                            onChange={(e) => setSelectedMenuId(e.target.value)}
                        >
                            <option value="">Choose a dish...</option>
                            {menuItems.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={saving || !selectedMenuId}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Save Configuration <Check size={18} /></>}
                    </button>
                </motion.div>
            </div>

            {/* Schedule Overview */}
            <div className="lg:col-span-8 space-y-4">
                <h2 className="text-xl font-bold mb-4">Upcoming Schedule</h2>
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl" />)
                ) : scheduledDates.length > 0 ? (
                    <div className="space-y-3">
                        {scheduledDates.map((item) => {
                            const dateObj = new Date(item.date);
                            const isToday = new Date().toISOString().split('T')[0] === item.date.split(' ')[0];
                            return (
                                <div key={item.id} className={`glass p-5 rounded-2xl border flex items-center justify-between ${isToday ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/5'}`}>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center w-12">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{dateObj.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                                            <p className="text-xl font-bold">{dateObj.getDate()}</p>
                                        </div>
                                        <div className="h-10 w-px bg-white/10" />
                                        <div>
                                            <p className="font-bold text-lg">{item.expand?.menu_item?.name || 'Unknown'}</p>
                                            <p className="text-xs text-muted-foreground">{dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    {isToday && <span className="text-[10px] font-bold px-2 py-1 rounded bg-orange-500 text-white uppercase">Today</span>}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center glass rounded-3xl border-dashed">
                        <p className="text-muted-foreground italic">No scheduled meals yet.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
