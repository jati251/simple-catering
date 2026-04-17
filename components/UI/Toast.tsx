'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="glass p-4 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto min-w-[280px] flex items-center gap-3"
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${
                t.type === 'success' ? 'bg-green-500/10 text-green-500' :
                t.type === 'error' ? 'bg-red-500/10 text-red-500' :
                'bg-primary/10 text-primary'
              }`}>
                {t.type === 'success' && <CheckCircle2 size={18} />}
                {t.type === 'error' && <AlertCircle size={18} />}
                {t.type === 'info' && <Info size={18} />}
              </div>
              <p className="text-xs font-bold flex-1">{t.message}</p>
              <button 
                onClick={() => removeToast(t.id)}
                className="p-1 hover:bg-white/5 rounded-lg transition-all text-muted-foreground"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
