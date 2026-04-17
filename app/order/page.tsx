"use client";

import React, { useEffect, useState } from "react";
import { pb, createOrder, getImageUrl } from "@/lib/pb";
import { CalendarItem } from "@/types/pocketbase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  User,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Utensils,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation, formatIDR, getWIBDateString } from "@/lib/utils";

export default function OrderPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [availableDates, setAvailableDates] = useState<CalendarItem[]>([]);
  const [selectedDateId, setSelectedDateId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    async function fetchDates() {
      try {
        const today = getWIBDateString();
        const records = await pb
          .collection("calendar")
          .getFullList<CalendarItem>({
            filter: `date >= "${today}"`,
            expand: "menu_item",
            sort: "date",
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
    setStatus("idle");
    try {
      await createOrder(buyerName, selectedDateId);
      setStatus("success");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDate = availableDates.find((d) => d.id === selectedDateId);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
          {t.placeOrder}
        </h1>
        <p className="text-muted-foreground font-medium max-w-sm mx-auto">
          {t.selectDate}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        {/* Input Side */}
        <div className="md:col-span-12 lg:col-span-7 space-y-8">
          <div className="glass p-10 rounded-[2.5rem] space-y-10 shadow-2xl border border-white/5">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <User size={14} className="text-primary" /> {t.yourName}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Deni Sumargo"
                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-black italic text-lg"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>

            <div className="space-y-4 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <CalendarIcon size={14} className="text-primary" />{" "}
                {t.chooseDate}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-white/5 animate-pulse rounded-2xl"
                    />
                  ))
                ) : availableDates.length > 0 ? (
                  availableDates.map((item) => {
                    const isSelected = selectedDateId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedDateId(item.id)}
                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                          isSelected
                            ? "bg-primary border-primary text-black shadow-lg shadow-primary/20"
                            : "bg-white/5 border-white/5 hover:border-primary/30"
                        }`}
                      >
                        <div className="relative z-10 w-full pr-1">
                          <p
                            className={`text-xs font-black uppercase tracking-widest leading-none mb-1 ${isSelected ? "text-black/80" : "text-muted-foreground"}`}
                          >
                            {new Date(item.date).toLocaleDateString(undefined, {
                              weekday: "short",
                            })}
                          </p>
                          <p className="text-lg font-black leading-tight mb-1">
                            {new Date(item.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p
                            className={`text-[10px] font-black italic truncate ${isSelected ? "text-black" : "text-primary"}`}
                          >
                            {item.expand?.menu_item?.name}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2
                            size={24}
                            className="relative z-10 hidden sm:block"
                          />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-10 text-center text-muted-foreground italic text-sm">
                    {t.noMenu}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button
                disabled={
                  submitting ||
                  !selectedDateId ||
                  !buyerName ||
                  status === "success"
                }
                className="w-full h-20 bg-primary hover:bg-opacity-90 disabled:opacity-50 text-black rounded-[1.5rem] font-black text-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 group italic tracking-tight"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : status === "success" ? (
                  t.confirmed
                ) : (
                  <>
                    {t.confirmOrder}{" "}
                    <ArrowRight
                      size={24}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
              {status === "error" && (
                <p className="text-red-500 text-center text-[10px] font-black uppercase mt-4">
                  Order failed. Please try again.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="hidden lg:block lg:col-span-12 xl:col-span-5">
          <AnimatePresence mode="wait">
            {selectedDate && selectedDate.expand?.menu_item ? (
              <motion.div
                key={selectedDate.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass p-8 rounded-[3rem] sticky top-24 border border-white/5 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShoppingBag size={120} />
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="h-64 w-full rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
                    {selectedDate.expand.menu_item.image ? (
                      <img
                        src={getImageUrl(selectedDate.expand.menu_item) || ""}
                        alt={selectedDate.expand.menu_item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/5">
                        <Utensils size={64} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-black italic tracking-tighter leading-none">
                      {selectedDate.expand.menu_item.name}
                    </h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                      {t.tomorrowMenu}
                    </p>
                  </div>

                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {selectedDate.expand.menu_item.description ||
                      "Savor the unique flavors prepared specially by D'MBG kitchen."}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-4xl font-black italic text-primary">
                      {formatIDR(selectedDate.expand.menu_item.price)}
                    </span>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase">
                      Kitchen Ready
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass p-8 rounded-[3rem] sticky top-24 border border-dashed border-white/10 h-96 flex flex-col items-center justify-center text-center opacity-50 grayscale">
                <ShoppingBag size={64} className="mb-4 text-white/10" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t.selectDate}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
