"use client";

import React, { useEffect, useState } from "react";
import { pb, createOrder } from "@/lib/pb";
import { CalendarItem } from "@/types/pocketbase";

import {
  Calendar as CalendarIcon,
  User,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation, getWIBDateString } from "@/lib/utils";
import Image from "next/image";

export default function OrderPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [availableDates, setAvailableDates] = useState<CalendarItem[]>([]);
  const [selectedDateId, setSelectedDateId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      const url = URL.createObjectURL(file);
      setProofPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateId || !buyerName || !paymentProof) return;

    setSubmitting(true);
    setStatus("idle");
    try {
      const formData = new FormData();
      formData.append("buyer_name", buyerName);
      formData.append("calendar_id", selectedDateId);
      formData.append("payment_proof", paymentProof);

      await createOrder(formData);
      setStatus("success");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
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
        className="grid grid-cols-1 lg:grid-cols-12 gap-12"
      >
        {/* Selection & Name */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-8 rounded-[2.5rem] space-y-8 border border-white/5 shadow-2xl">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <User size={14} className="text-primary" /> {t.yourName}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Deni Sumargo"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-black italic text-lg"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>

            <div className="space-y-4 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <CalendarIcon size={14} className="text-primary" />{" "}
                {t.chooseDate}
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  [1, 2, 3].map((i) => (
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
                            className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isSelected ? "text-black/80" : "text-muted-foreground"}`}
                          >
                            {new Date(item.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm font-black leading-tight truncate">
                            {item.expand?.menu_item?.name}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={20} className="relative z-10" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-muted-foreground italic text-sm">
                    {t.noMenu}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* QRIS Card */}
            <div className="glass p-8 rounded-[3rem] border border-white/5 space-y-6 flex flex-col items-center">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black italic tracking-tight">
                  Payment via QRIS
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Scan using any payment app
                </p>
              </div>

              <div className="relative p-4 bg-white rounded-3xl shadow-2xl flex items-center justify-center group overflow-hidden">
                <Image
                  src="/qris.jpeg"
                  alt="QRIS Payment"
                  width={400}
                  height={500}
                  className="w-full max-w-[500px] aspect-square object-contain"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-black italic">
                    SAVE IMAGE
                  </span>
                </div>
              </div>

              <div className="w-full pt-4 border-t border-white/5 flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-primary uppercase">
                  D'MBG Kitchen
                </span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                  Instant Approval
                </span>
              </div>
            </div>

            {/* Upload Proof Card */}
            <div className="glass p-8 rounded-[3rem] border border-white/5 space-y-6 flex flex-col">
              <div className="space-y-2">
                <h3 className="text-xl font-black italic tracking-tight">
                  Upload Proof
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                  Capture and upload receipt
                </p>
              </div>

              <div className="flex-1 min-h-[220px] relative">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div
                  className={`absolute inset-0 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center ${proofPreview ? "border-primary bg-primary/5" : "border-white/10 bg-white/5 hover:border-primary/30"}`}
                >
                  {proofPreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={proofPreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/80 rounded-full text-[8px] font-black text-primary uppercase">
                        Replace Image
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                        <ShoppingBag size={24} />
                      </div>
                      <p className="text-xs font-black italic leading-tight mb-1">
                        Drop Receipt Here
                      </p>
                      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                        JPEG, PNG Max 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              <button
                disabled={
                  submitting ||
                  !selectedDateId ||
                  !buyerName ||
                  !paymentProof ||
                  status === "success"
                }
                className="w-full h-16 bg-primary hover:bg-opacity-90 disabled:opacity-50 text-black rounded-[1.5rem] font-black text-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 group italic tracking-tight"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : status === "success" ? (
                  t.confirmed
                ) : (
                  <>
                    {t.confirmOrder}{" "}
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </div>
          </div>

          {status === "error" && (
            <p className="text-red-500 text-center text-[10px] font-black uppercase mt-4">
              Something went wrong. Please check your connection.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
