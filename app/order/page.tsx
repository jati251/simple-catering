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

  const [step, setStep] = useState(1);
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

  const isStep1Valid = buyerName && selectedDateId;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-8 md:space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-tight">
          {t.placeOrder}
        </h1>
        <div className="flex items-center justify-center gap-4 py-2">
           <div className={`p-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${step === 1 ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground'}`}>01. Details</div>
           <div className="w-8 h-px bg-white/10" />
           <div className={`p-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${step === 2 ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground'}`}>02. Payment</div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto w-full"
      >
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Selection & Name */}
            <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] space-y-8 border border-white/5 shadow-2xl">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
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
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${
                            isSelected
                              ? "bg-primary border-primary text-black shadow-lg shadow-primary/20"
                              : "bg-white/5 border-white/5 hover:border-primary/30"
                          }`}
                        >
                          <div className="relative z-10 w-full pr-1">
                            <p
                              className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${isSelected ? "text-black/80" : "text-muted-foreground"}`}
                            >
                              {new Date(item.date).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-[11px] font-black leading-tight uppercase transition-colors">
                              {item.expand?.menu_item?.name}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 size={16} className="relative z-10" />
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
            </div>

            <button
               type="button"
               disabled={!isStep1Valid}
               onClick={() => setStep(2)}
               className="w-full h-16 bg-primary hover:bg-opacity-90 disabled:opacity-30 text-black rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 italic group"
            >
               Next to Payment <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-500">
            {/* Payment Section */}
            <div className="grid grid-cols-1 gap-6">
              {/* QRIS Card */}
              <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 space-y-6 flex flex-col items-center">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black italic tracking-tight uppercase">
                    Scan QRIS
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-tight">
                    Instant Approval via MSID Gateway
                  </p>
                </div>

                <div className="relative p-3 bg-white rounded-2xl shadow-2xl flex items-center justify-center group overflow-hidden max-w-[280px]">
                  <Image
                    src="/qris.jpeg"
                    alt="QRIS Payment"
                    width={400}
                    height={400}
                    className="w-full aspect-square object-contain"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-black italic">
                      D'MBG KITCHEN
                    </span>
                  </div>
                </div>

                <div className="w-full pt-4 border-t border-white/5 flex items-center justify-between px-2">
                  <span className="text-[9px] font-black text-primary uppercase">
                    Kitchen Verified
                  </span>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">
                    QRIS Standar
                  </span>
                </div>
              </div>

              {/* Upload Proof Card */}
              <div className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 space-y-6 flex flex-col">
                <div className="space-y-1">
                  <h3 className="text-xl font-black italic tracking-tight uppercase">
                    Upload receipt
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                    Screenshot of success payment
                  </p>
                </div>

                <div className="min-h-[160px] relative">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div
                    className={`absolute inset-0 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center ${proofPreview ? "border-primary bg-primary/5" : "border-white/10 bg-white/5 hover:border-primary/30"}`}
                  >
                    {proofPreview ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={proofPreview}
                          alt="Preview"
                          className="max-h-32 rounded-lg object-contain shadow-xl"
                        />
                        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-primary text-black rounded text-[8px] font-black uppercase">Change</div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary">
                          <ShoppingBag size={20} />
                        </div>
                        <p className="text-[10px] font-black italic leading-tight uppercase">Drop Image Proof</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-14 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-sm uppercase transition-all flex items-center justify-center gap-2"
                  >
                    Back
                  </button>
                  <button
                    disabled={
                      submitting ||
                      !paymentProof ||
                      status === "success"
                    }
                    className="h-14 bg-primary hover:bg-opacity-90 disabled:opacity-30 text-black rounded-xl font-black text-sm uppercase shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 italic"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : status === "success" ? (
                      "OK"
                    ) : (
                      <>
                        {t.confirmOrder} <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {status === "error" && (
              <p className="text-red-500 text-center text-[10px] font-black uppercase mt-4">
                Upload failed. Please try again.
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
