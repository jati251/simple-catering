'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoaderProps {
  isLoading: boolean;
  message?: string;
}

export function Loader({ isLoading, message }: LoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-[300] flex flex-col items-center justify-center gap-6"
        >
          <div className="relative w-20 h-20">
            {/* Main Spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
            />
            {/* Inner Glow Spinner */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-2 border-primary/10 border-b-primary rounded-full opacity-50"
            />
          </div>
          
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary text-sm font-black uppercase tracking-widest italic animate-pulse"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
