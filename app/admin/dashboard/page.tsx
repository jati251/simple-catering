"use client";

import React, { useEffect, useState } from "react";
import { pb } from "@/lib/pb";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  UtensilsCrossed,
  LogOut,
  ChevronRight,
  PieChart,
  ShoppingBag,
} from "lucide-react";
import { useTranslation } from "@/lib/utils";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [stats, setStats] = useState({ menuItems: 0, futureOrders: 0 });

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push("/login");
      return;
    }

    async function fetchStats() {
      try {
        const menuItems = await pb.collection("menu_items").getList(1, 1);
        const futureOrders = await pb.collection("orders").getList(1, 1);
        setStats({
          menuItems: menuItems.totalItems,
          futureOrders: futureOrders.totalItems,
        });
      } catch (err) {}
    }
    fetchStats();
  }, [router]);

  const handleLogout = () => {
    pb.authStore.clear();
    router.push("/");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">
            {t.adminDashboard}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            {t.dashboardSub}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm font-bold"
        >
          <LogOut size={16} /> {t.signout}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Menu Management Link */}
        <Link href="/admin/menu" className="group">
          <motion.div
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-[2.5rem] border border-primary/10 hover:border-primary/30 transition-all h-full flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UtensilsCrossed size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold italic tracking-tight">
                  {t.menuItems}
                </h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  {t.addFood} {stats.menuItems} {t.totalItems}.
                </p>
              </div>
            </div>
            <div className="pt-6 flex items-center gap-2 text-primary font-bold text-sm">
              {t.manageMenu} <ChevronRight size={16} />
            </div>
          </motion.div>
        </Link>

        {/* Orders Management Link */}
        <Link href="/admin/orders" className="group">
          <motion.div
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-[2.5rem] border border-primary/10 hover:border-primary/30 transition-all h-full flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold italic tracking-tight">
                  {t.orders}
                </h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  {t.manageOrders}
                </p>
              </div>
            </div>
            <div className="pt-6 flex items-center gap-2 text-primary font-bold text-sm">
              {t.viewOrders} <ChevronRight size={16} />
            </div>
          </motion.div>
        </Link>

        {/* Calendar Config Link */}
        <Link href="/admin/calendar" className="group">
          <motion.div
            whileHover={{ y: -5 }}
            className="glass p-8 rounded-[2.5rem] border border-primary/10 hover:border-primary/30 transition-all h-full flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold italic tracking-tight">
                  {t.calendar}
                </h2>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                  {t.setSchedule}
                </p>
              </div>
            </div>
            <div className="pt-6 flex items-center gap-2 text-primary font-bold text-sm">
              {t.saveConfig} <ChevronRight size={16} />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Basic Stats Bar */}
      <div className="flex flex-wrap gap-4 pt-10">
        <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
          <PieChart size={18} className="text-muted-foreground" />
          <span className="text-sm font-bold text-muted-foreground">
            {t.systemActive}
          </span>
        </div>
      </div>
    </div>
  );
}
