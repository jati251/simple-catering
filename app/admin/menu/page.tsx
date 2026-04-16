'use client';

import React, { useEffect, useState } from 'react';
import { pb, getMenuItems, addMenuItem, deleteMenuItem } from '@/lib/pb';
import { MenuItem } from '@/types/pocketbase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronLeft, Utensils, Info, Tag } from 'lucide-react';
import Link from 'next/link';

export default function MenuManagement() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [adding, setAdding] = useState(false);

  async function fetchMenu() {
    setLoading(true);
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (err) {}
    setLoading(false);
  }

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/login');
      return;
    }
    fetchMenu();
  }, [router]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addMenuItem({ name, description, price: parseFloat(price) || 0 });
      setName('');
      setDescription('');
      setPrice('');
      fetchMenu();
    } catch (err) {}
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteMenuItem(id);
      fetchMenu();
    } catch (err) {}
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/admin/dashboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold">Menu <span className="text-orange-500">Management</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Form */}
            <div className="lg:col-span-1">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass p-8 rounded-3xl sticky top-24"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Plus className="text-orange-500" /> Add New Item
                    </h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted-foreground ml-1">Name</label>
                            <div className="relative">
                                <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input 
                                    type="text" required placeholder="Nasi Goreng Special"
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-orange-500/50 outline-none"
                                    value={name} onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted-foreground ml-1">Description</label>
                            <div className="relative">
                                <Info className="absolute left-4 top-4 text-muted-foreground" size={16} />
                                <textarea 
                                    placeholder="Brief description..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500/50 outline-none resize-none"
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-muted-foreground ml-1">Price (optional)</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input 
                                    type="number" placeholder="50.00"
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-orange-500/50 outline-none"
                                    value={price} onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            disabled={adding}
                            className="w-full h-12 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
                        >
                            {adding ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Add Item'}
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-muted-foreground">{menuItems.length} Items Total</p>
                </div>
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)
                ) : menuItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence>
                            {menuItems.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass p-6 rounded-2xl flex items-center justify-between group"
                                >
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{item.description || 'No description'}</p>
                                        <p className="text-xs font-bold text-orange-500">${item.price}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 glass rounded-3xl border-dashed">
                        <Utensils size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground italic">No menu items found. Add your first dish!</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
