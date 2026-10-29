'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="h-14 w-44 mx-auto mb-2 flex items-center justify-center">
            <img src="/ella.png" alt="Ella's Kitchen" className="h-full w-auto object-contain" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-brand-cream-50">
            Admin Login
          </h1>
          <p className="text-xs text-brand-brown-300">
            Authorized administration and order management access only.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-950/70 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-cream-200">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-brown-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ellaskitchen.ng"
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl pl-10 pr-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-cream-200">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-brown-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl pl-10 pr-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-gold-500 to-brand-gold-600 hover:from-brand-gold-400 hover:to-brand-gold-500 disabled:opacity-50 text-brand-dark-950 font-extrabold text-sm shadow-gold-glow flex items-center justify-center gap-2 transition active:scale-[0.99]"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign in to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="p-3 bg-brand-dark-950/80 rounded-xl border border-brand-brown-900 text-center text-[11px] text-brand-brown-400">
          Default Super Administrator: <span className="text-brand-gold-400 font-mono">admin@ellaskitchen.ng</span>
          <br />
          Initial Password: <span className="text-brand-gold-400 font-mono">AdminPassword2026!</span>
        </div>
      </div>
    </div>
  );
}
