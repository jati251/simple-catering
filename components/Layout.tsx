'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, LayoutDashboard, Utensils, Home, User, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Order', href: '/order', icon: ShoppingBag },
  ];

  const isAdmin = pathname.startsWith('/admin');

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className={`glass-nav rounded-full px-8 h-16 flex items-center justify-between transition-all duration-500 shadow-2xl ${scrolled ? 'shadow-orange-500/10' : 'shadow-transparent'}`}>
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform">
                    <Utensils size={20} />
                </div>
                <span className="text-xl font-black italic tracking-tighter text-white">Catering<span className="text-orange-500">Go</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                    const active = pathname === link.href;
                    return (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all relative group ${active ? 'text-white' : 'text-muted-foreground hover:text-white'}`}
                        >
                            {active && (
                                <motion.div layoutId="nav-bg" className="absolute inset-0 bg-white/10 rounded-full" />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <link.icon size={16} className={active ? 'text-orange-500' : ''} />
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
                
                <div className="w-px h-6 bg-white/10 mx-4" />
                
                <Link 
                    href={isAdmin ? "/admin/dashboard" : "/login"}
                    className="flex items-center gap-2 pl-4 pr-1 py-1 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                >
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-white transition-colors">{isAdmin ? 'Dashboard' : 'Admin'}</span>
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg">
                        {isAdmin ? <LayoutDashboard size={14} /> : <User size={14} />}
                    </div>
                </Link>
            </div>

            {/* Mobile Toggle */}
            <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 rounded-full glass flex items-center justify-center text-white"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-6 right-6 mt-4 md:hidden"
            >
                <div className="glass p-6 rounded-[2rem] space-y-4 border border-white/10 shadow-3xl">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href} 
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-orange-500/10 transition-all font-bold group"
                        >
                            <span className="flex items-center gap-3">
                                <link.icon size={18} className="text-orange-500" />
                                {link.name}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                <Home size={14} />
                            </div>
                        </Link>
                    ))}
                    <Link 
                        href="/login" 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20"
                    >
                        Admin Portal
                        <User size={18} />
                    </Link>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="py-20 border-t border-white/5 mt-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <Utensils size={20} />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter text-white">Catering<span className="text-orange-500">Go</span></span>
                </Link>
                <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                    Crafting premium culinary experiences for your daily lunch and special events. Fresh, sustainable, and chef-curated.
                </p>
                <div className="flex gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground hover:bg-orange-500 hover:text-white transition-all cursor-pointer">
                            <span className="text-[10px] font-bold">SM</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="space-y-6">
                <h4 className="text-white font-black italic uppercase tracking-widest text-xs">Quick Links</h4>
                <div className="flex flex-col gap-4">
                    {['About Us', 'Our Menu', 'Order Now', 'Privacy Policy'].map(link => (
                        <Link key={link} href="#" className="text-sm font-bold text-muted-foreground hover:text-orange-500 transition-colors">{link}</Link>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <h4 className="text-white font-black italic uppercase tracking-widest text-xs">Support</h4>
                <div className="flex flex-col gap-4">
                    {['Help Center', 'Terms of Service', 'Contact Chef', 'Status'].map(link => (
                        <Link key={link} href="#" className="text-sm font-bold text-muted-foreground hover:text-orange-500 transition-colors">{link}</Link>
                    ))}
                </div>
            </div>
        </div>

        <div className="text-center pt-10 border-t border-white/5 text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
          <p>© {new Date().getFullYear()} CateringGo. Handcrafted for Gourmets.</p>
        </div>
      </div>
    </footer>
  );
}
