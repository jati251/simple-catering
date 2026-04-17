'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Utensils, Home, User, Menu, X, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/utils';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { language, setLanguage, t } = useTranslation();

  const navLinks = [
    { name: t.today || 'Home', href: '/', icon: Home },
    { name: t.placeOrder || 'Order', href: '/order', icon: ShoppingBag },
  ];

  const isAdmin = pathname.startsWith('/admin');

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  return (
    <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
                <Utensils className="text-primary" size={24} />
                <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tighter leading-none">D'MBG</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Dapur Kesayangan</span>
                </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => {
                    const active = pathname === link.href;
                    return (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            className={`text-sm font-bold transition-all ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {link.name}
                        </Link>
                    );
                })}
                
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Globe size={12} className="text-primary" />
                  {language}
                </button>

                <Link 
                    href={isAdmin ? "/admin/dashboard" : "/login"}
                    className="text-sm font-bold px-4 py-2 rounded-lg bg-primary text-black hover:bg-opacity-90 transition-all font-sans"
                >
                    {isAdmin ? 'Dashboard' : t.signin}
                </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="flex items-center gap-4 md:hidden">
              <button 
                onClick={toggleLanguage}
                className="p-2 rounded-lg bg-white/5"
              >
                <Globe size={18} className="text-primary" />
              </button>
              <button 
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="p-2 text-foreground"
              >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-6 space-y-6 shadow-xl animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
                <Link 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setMobileOpen(false)}
                    className="block text-xl font-bold"
                >
                    {link.name}
                </Link>
            ))}
            <Link 
                href="/login" 
                onClick={() => setMobileOpen(false)}
                className="block text-xl font-bold text-primary"
            >
                {t.adminPortal}
            </Link>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return null;
}
