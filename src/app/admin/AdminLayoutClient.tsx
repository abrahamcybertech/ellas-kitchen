'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { StaffUser } from '@/lib/types';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  UtensilsCrossed,
  Settings,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Change password state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // If we are on the login page, render children without sidebar
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update password');
      }

      setPasswordSuccess(data.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark-950 text-brand-gold-400">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest font-semibold text-brand-brown-300">
            Verifying Staff Credentials...
          </p>
        </div>
      </div>
    );
  }

  const role = currentUser?.role || 'order_manager';

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'order_manager', 'menu_manager'] },
    { label: 'Orders and Receipts', href: '/admin/orders', icon: ShoppingBag, roles: ['super_admin', 'order_manager'] },
    { label: 'Category Management', href: '/admin/categories', icon: Layers, roles: ['super_admin', 'menu_manager'] },
    { label: 'Product Management', href: '/admin/products', icon: UtensilsCrossed, roles: ['super_admin', 'menu_manager'] },
    { label: 'Business Settings', href: '/admin/settings', icon: Settings, roles: ['super_admin'] },
    { label: 'Staff and Roles', href: '/admin/staff', icon: Users, roles: ['super_admin'] },
    { label: 'Security Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck, roles: ['super_admin'] },
  ];

  const allowedNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-brand-dark-950 text-brand-cream-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-brand-dark-900 border-b border-brand-brown-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/ella.png" alt="Ella's Kitchen" className="h-8 w-auto object-contain" />
          <span className="text-xs font-bold text-brand-gold-400 uppercase tracking-widest">
            Admin Dashboard
          </span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-brand-cream-200"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileNavOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-brand-dark-900 border-r border-brand-brown-800 flex-shrink-0 flex flex-col justify-between p-4 sm:p-6 z-20`}
      >
        <div className="space-y-6">
          {/* Logo brand */}
          <div className="hidden md:block">
            <Link href="/" className="block">
              <img src="/ella.png" alt="Ella's Kitchen" className="h-12 w-auto object-contain mb-1" />
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold-400 block pl-1">
              Admin &amp; Operations
            </span>
          </div>

          {/* User profile capsule */}
          {currentUser && (
            <div className="p-3 rounded-xl bg-brand-dark-950 border border-brand-brown-800 space-y-1">
              <span className="text-xs font-bold text-brand-cream-50 block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-brand-brown-400 block truncate">
                {currentUser.email}
              </span>
              <div className="pt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-gold-500/15 text-brand-gold-400 border border-brand-gold-500/30">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetPasswordForm();
                  setPasswordModalOpen(true);
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-brand-gold-500/10 border border-brand-gold-500/30 text-[11px] font-bold text-brand-gold-400 hover:bg-brand-gold-500/20 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {allowedNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-brand-gold-500 text-brand-dark-950 font-bold shadow-gold-glow'
                      : 'text-brand-cream-200 hover:bg-brand-brown-800/60 hover:text-brand-gold-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-brand-brown-800/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-brand-brown-300 hover:text-brand-gold-400 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Customer Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-dark-950 border border-brand-gold-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-brown-800 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-brand-cream-50">
                  Change Password
                </h3>
                <p className="text-[11px] text-brand-brown-300 mt-1">
                  Update the password for {currentUser?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPasswordModalOpen(false);
                  resetPasswordForm();
                }}
                className="text-brand-brown-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-950/60 border border-green-800 text-green-200 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Current Password <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  New Password <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Confirm New Password <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-brown-800">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    resetPasswordForm();
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-brand-brown-300 hover:bg-brand-brown-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 disabled:opacity-50 text-brand-dark-950 font-bold text-xs"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
