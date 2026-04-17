'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-6 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass max-w-sm w-full p-8 rounded-[2.5rem] border border-white/10 shadow-2xl pointer-events-auto space-y-6"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                  {variant === 'danger' ? <AlertTriangle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black italic tracking-tighter">{title}</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{message}</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 h-14 rounded-2xl bg-white/5 border border-white/5 font-bold hover:bg-white/10 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 h-14 rounded-2xl font-black transition-all shadow-lg active:scale-95 ${
                    variant === 'danger' 
                      ? 'bg-red-500 text-white shadow-red-500/20' 
                      : 'bg-primary text-black shadow-primary/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
