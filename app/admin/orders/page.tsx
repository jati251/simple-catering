'use client';

import React, { useEffect, useState } from 'react';
import { pb } from '@/lib/pb';
import { OrderItem } from '@/types/pocketbase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Eye, CheckCircle2, XCircle, Search } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

export default function OrdersManagement() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('orders').getFullList<OrderItem>({
        sort: '-created',
        expand: 'calendar_id,calendar_id.menu_item',
        requestKey: null
      });
      setOrders(records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [router]);

  const filteredOrders = orders.filter(o => 
    o.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.expand?.calendar_id?.expand?.menu_item?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProofUrl = (record: OrderItem) => {
    if (!record.payment_proof) return null;
    return pb.files.getUrl(record, record.payment_proof);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12 pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                    <ChevronLeft size={20} md:size={24} />
                </Link>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none text-white">Orders</h1>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Management & Payments</p>
                </div>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             </div>
        ) : (
          <div className="glass rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left min-w-[800px] md:min-w-0">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 md:px-8 py-4 md:py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Buyer</th>
                    <th className="px-6 md:px-8 py-4 md:py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date / Menu</th>
                    <th className="px-6 md:px-8 py-4 md:py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Proof</th>
                    <th className="px-6 md:px-8 py-4 md:py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={order.id} 
                      className="hover:bg-white/3 transition-colors group"
                    >
                      <td className="px-6 md:px-8 py-4 md:py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs md:text-sm">
                            {order.buyer_name.charAt(0)}
                          </div>
                          <span className="font-bold text-white text-sm md:text-base">{order.buyer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-tighter italic">
                            {new Date(order.expand?.calendar_id?.date || '').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-xs md:text-sm font-medium text-muted-foreground italic line-clamp-1">
                            {order.expand?.calendar_id?.expand?.menu_item?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                        {order.payment_proof ? (
                          <a 
                            href={getProofUrl(order) || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-primary text-black font-black text-[9px] md:text-[10px] uppercase hover:scale-105 transition-all shadow-lg shadow-primary/20"
                          >
                            <Eye size={12} md:size={14} /> View
                          </a>
                        ) : (
                          <span className="text-[9px] md:text-[10px] font-black text-red-500/50 uppercase italic">Missing</span>
                        )}
                      </td>
                      <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                        <span className="font-black italic text-base md:text-lg text-white">
                          {formatIDR(order.expand?.calendar_id?.expand?.menu_item?.price || 0)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground italic">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
