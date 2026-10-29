'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X, Phone, Clock } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { totalCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Our Menu', href: '/menu' },
    { label: 'Catering and Events', href: '/catering' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-brand-dark-950 text-brand-gold-300 text-xs py-2 px-4 border-b border-brand-brown-900/60 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 text-brand-brown-300">
              <Clock className="w-3.5 h-3.5 text-brand-gold-400" />
              Open Daily: 9:00 AM to 8:00 PM
            </span>
            <span className="flex items-center gap-1.5 text-brand-brown-300">
              <Phone className="w-3.5 h-3.5 text-brand-gold-400" />
              Nyanya, Abuja: +234 808 005 8907
            </span>
          </div>
          <div className="text-brand-gold-400 font-medium">
            Fast doorstep food delivery across Abuja
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-brand-dark-950/95 backdrop-blur-md py-3 border-b border-brand-gold-500/20 shadow-lg'
            : 'bg-brand-dark-950 py-4 border-b border-brand-brown-900'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Brand Link */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-12 w-36 sm:h-14 sm:w-44 flex items-center">
              <img
                src="/ella.png"
                alt="Ella's Kitchen"
                className="h-full w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback if image fails
                  const target = e.currentTarget as HTMLElement;
                  target.style.display = 'none';
                  const fallback = document.getElementById('logo-text-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                id="logo-text-fallback"
                className="hidden flex-col justify-center leading-none"
              >
                <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wider text-brand-gold-400">
                  ELLA'S
                </span>
                <span className="text-[10px] tracking-[0.3em] font-sans font-bold text-brand-cream-200 uppercase">
                  Kitchen
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-brand-gold-400 ${
                    isActive ? 'text-brand-gold-400 font-semibold' : 'text-brand-cream-200'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs: Cart & Order Now */}
          <div className="flex items-center space-x-4">
            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-brand-brown-900 border border-brand-brown-800 text-brand-cream-100 hover:text-brand-gold-400 hover:border-brand-gold-500/40 transition"
              aria-label="Open food tray"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-gold-500 text-brand-dark-950 font-bold text-xs flex items-center justify-center animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Desktop Order Now Button */}
            <Link
              href="/menu"
              className="hidden sm:inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-gold-500 to-brand-gold-600 hover:from-brand-gold-400 hover:to-brand-gold-500 text-brand-dark-950 font-bold text-sm shadow-gold-glow transition active:scale-95"
            >
              Order Now
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-brand-cream-200 hover:text-brand-gold-400 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-brand-dark-950 border-b border-brand-brown-800 px-4 pt-3 pb-6 space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-base font-medium rounded-lg px-3 transition-colors ${
                    isActive
                      ? 'bg-brand-brown-900 text-brand-gold-400 font-semibold'
                      : 'text-brand-cream-100 hover:bg-brand-brown-900/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                href="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center block py-3 rounded-full bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-sm shadow-gold-glow transition"
              >
                Order Delicious Food Now
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
