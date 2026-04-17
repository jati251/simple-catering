"use client";

import React, { useState } from "react";
import { loginAdmin } from "@/lib/pb";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/utils";

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginAdmin(username, password);
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-32 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black italic tracking-tighter">
          {t.loginTitle}
        </h1>
        <p className="text-muted-foreground font-medium">{t.loginSub}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-[2.5rem] shadow-xl space-y-8"
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t.username}
            </label>
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="text"
                required
                placeholder={t.username}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              {t.password}
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center text-xs font-bold flex items-center justify-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            disabled={loading}
            className="btn-premium w-full h-16 flex items-center justify-center gap-2 text-lg shadow-xl"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {t.signin} <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
