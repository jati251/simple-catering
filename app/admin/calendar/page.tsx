"use client";

import React, { useEffect, useState } from "react";
import { pb, getMenuItems, setFoodForDate, removeFoodFromDate } from "@/lib/pb";
import { MenuItem, CalendarItem } from "@/types/pocketbase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Utensils,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import {
  useTranslation,
  formatIDR,
  getWIBDate,
  getWIBDateString,
} from "@/lib/utils";
import { Modal } from "@/components/UI/Modal";
import { Loader } from "@/components/UI/Loader";
import { useToast } from "@/components/UI/Toast";

export default function CalendarConfig() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedDateStr, setSelectedDateStr] =
    useState<string>(getWIBDateString());
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");

  // Popup State
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<string | null>(
    null,
  );

  async function fetchData(silent = false) {
    if (!silent) setLoading(true);
    try {
      const [items, calRecords] = await Promise.all([
        getMenuItems(),
        pb
          .collection("calendar")
          .getFullList<CalendarItem>({
            sort: "date",
            expand: "menu_item",
            requestKey: null,
          }),
      ]);
      setMenuItems(items);
      setCalendarItems(calRecords);
    } catch (err) {
      toast("Failed to refresh schedule", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router]);

  const handleSave = async () => {
    if (!selectedDateStr || !selectedMenuItem) return;
    setSaving(true);
    try {
      await setFoodForDate(selectedDateStr, selectedMenuItem);
      await fetchData(true);
      setSelectedMenuItem("");
      toast("Menu added to schedule", "success");
    } catch (err) {
      toast("Failed to save schedule", "error");
    }
    setSaving(false);
  };

  const handleRemoveClick = (id: string) => {
    setAssignmentToRemove(id);
    setRemoveModalOpen(true);
  };

  const confirmRemove = async () => {
    if (!assignmentToRemove) return;
    setActionLoading(true);
    try {
      await removeFoodFromDate(assignmentToRemove);
      await fetchData(true);
      toast("Assignment removed", "success");
    } catch (err) {
      toast("Failed to remove assignment", "error");
    } finally {
      setActionLoading(false);
      setAssignmentToRemove(null);
    }
  };

  // --- CUSTOM CALENDAR LOGIC ---
  const generateCalendarDays = () => {
    const days = [];
    const today = getWIBDate();

    // We start from the beginning of current week (assume Sunday)
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    // Generate 35 days (5 weeks)
    for (let i = 0; i < 35; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const dateStr = getWIBDateString(d);
      const assignments = calendarItems.filter((item) =>
        item.date.startsWith(dateStr),
      );

      days.push({
        date: d,
        dateStr: dateStr,
        isToday: dateStr === getWIBDateString(),
        isSelected: dateStr === selectedDateStr,
        assignments: assignments,
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <>
      <Loader isLoading={loading} message="Loading Schedule..." />
      <Loader isLoading={actionLoading} message={t.deleting} />

      <Modal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onConfirm={confirmRemove}
        title={t.remove}
        message={t.removeConfirm}
        confirmText={t.remove}
        variant="danger"
      />

      <div className="max-w-6xl mx-auto px-6 py-12 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter leading-none">
                D'MBG
              </h1>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                {t.calendar}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />{" "}
            Live Schedule
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Custom Grid Calendar */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                  {t.kitchenSchedule}
                </h2>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mr-4">
                    <div className="w-3 h-3 rounded bg-primary" /> {t.assigned}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div className="grid grid-cols-7 gap-2 sm:gap-3 min-w-[600px] md:min-w-0">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] font-black uppercase text-muted-foreground mb-2"
                    >
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      onClick={() => setSelectedDateStr(day.dateStr)}
                      className={`h-20 sm:h-24 rounded-xl sm:rounded-2xl p-1 sm:p-2 flex flex-col justify-between border transition-all text-left relative group ${
                        day.isSelected
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "border-white/5 bg-white/3 hover:bg-white/5 hover:border-white/10"
                      } ${day.isToday ? "bg-primary/5" : ""}`}
                    >
                      <span
                        className={`text-[10px] sm:text-xs font-black ${day.isToday ? "text-primary underline" : "text-muted-foreground"}`}
                      >
                        {day.date.getDate()}
                      </span>

                      {day.assignments.length > 0 ? (
                        <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">
                          <div className="flex flex-wrap gap-0.5 sm:gap-1">
                            {day.assignments.map((a) => (
                              <div
                                key={a.id}
                                className="w-full h-0.5 sm:h-1 bg-primary rounded-full shadow-sm shadow-primary/40"
                              />
                            ))}
                          </div>
                          <div className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter text-primary truncate leading-tight">
                            {day.assignments.length} {t.menuItems}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[8px] font-bold text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.empty}
                        </div>
                      )}

                      {day.isSelected && (
                        <div className="absolute top-1 right-1 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Menu Assignment */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-8 rounded-[2.5rem] space-y-8 border border-white/5 shadow-2xl sticky top-24"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-black italic">{t.saveConfig}</h2>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 inline-flex items-center gap-2 text-xs font-bold text-primary">
                  <CalendarIcon size={14} />
                  {new Date(selectedDateStr).toLocaleDateString(
                    t.today === "Home" ? "id-ID" : "en-US",
                    { weekday: "long", month: "long", day: "numeric" },
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.currentAssignments}
                </label>
                <div className="space-y-2 mb-4">
                  {calendarDays
                    .find((d) => d.isSelected)
                    ?.assignments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20"
                      >
                        <span className="text-[10px] font-bold truncate italic">
                          {a.expand?.menu_item?.name}
                        </span>
                        <button
                          onClick={() => handleRemoveClick(a.id)}
                          className="text-[10px] font-black text-red-500 uppercase hover:underline"
                        >
                          {t.remove}
                        </button>
                      </div>
                    ))}
                  {calendarDays.find((d) => d.isSelected)?.assignments
                    .length === 0 && (
                    <p className="text-[10px] text-muted-foreground italic">
                      {t.noMenu}
                    </p>
                  )}
                </div>

                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  {t.menuItems}
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMenuItem(item.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left group ${
                        selectedMenuItem === item.id
                          ? "bg-primary border-primary text-black"
                          : "bg-white/3 border-white/5 hover:bg-white/5"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0">
                        <Utensils size={16} />
                      </div>
                      <div className="flex-1 pr-2 truncate">
                        <p className="text-sm font-black italic leading-tight truncate">
                          {item.name}
                        </p>
                        <p
                          className={`text-[10px] uppercase font-bold tracking-tight ${selectedMenuItem === item.id ? "text-black/60" : "text-primary"}`}
                        >
                          {formatIDR(item.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !selectedMenuItem}
                className={`btn-premium w-full h-16 flex items-center justify-center gap-3 disabled:opacity-50 ${saving ? "opacity-70" : ""}`}
              >
                {saving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    {t.saveConfig} <Save size={20} />
                  </>
                )}
              </button>

              <p className="text-[10px] text-muted-foreground italic text-center leading-relaxed">
                Data older than today is automatically deleted <br /> by the
                D'MBG System (WIB).
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
