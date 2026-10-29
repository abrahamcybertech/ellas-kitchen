'use client';

import React, { useState, useEffect } from 'react';
import { StaffUser, Role } from '@/lib/types';
import { Users, Plus, ShieldCheck, UserCheck, UserX, X, AlertCircle } from 'lucide-react';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('order_manager');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data);
      } else {
        setErrorMessage(data.error);
      }
    } catch {
      setErrorMessage('Failed to load staff list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create staff member');
      }

      setSuccessMessage('New staff user created successfully');
      setModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchStaff();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (staff: StaffUser) => {
    try {
      const res = await fetch(`/api/admin/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !staff.is_active }),
      });
      const data = await res.json();
      if (data.success) fetchStaff();
    } catch {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-cream-50">
            Staff &amp; Role Based Access Control
          </h1>
          <p className="text-xs text-brand-brown-300 mt-1">
            Enforce least privilege access for kitchen order managers and menu coordinators.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs shadow-gold-glow flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Provision New Staff</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-green-950/60 border border-green-800 text-green-200 text-xs rounded-xl flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-green-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-brand-brown-950/80 border-b border-brand-brown-800 text-brand-brown-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Designated Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-brown-800/40">
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-brand-brown-900/30 transition">
                  <td className="py-4 px-4 font-bold text-brand-cream-50 text-sm">
                    {s.name}
                  </td>
                  <td className="py-4 px-4 font-mono text-brand-brown-300">
                    {s.email}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/30">
                      {s.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.is_active
                          ? 'bg-green-950/80 text-green-300 border border-green-800'
                          : 'bg-red-950/80 text-red-300 border border-red-800'
                      }`}
                    >
                      {s.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className="px-3 py-1 rounded-lg bg-brand-dark-950 border border-brand-brown-800 text-brand-cream-200 hover:text-brand-gold-400 hover:border-brand-gold-500 transition text-[11px]"
                    >
                      {s.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-dark-950 border border-brand-gold-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-brown-800 pb-4">
              <h3 className="font-serif text-xl font-bold text-brand-cream-50">
                Provision Staff Account
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-brand-brown-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Full Name <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Example: Tunde Adeleke"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Staff Email <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@ellaskitchen.ng"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Temporary Secure Password <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Access Level / Role <span className="text-brand-gold-400">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-brand-dark-900 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
                >
                  <option value="order_manager">Order Manager (Orders, receipts, status)</option>
                  <option value="menu_manager">Menu Manager (Categories, dishes, availability)</option>
                  <option value="super_admin">Super Administrator (Full unrestricted access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-brown-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-brand-brown-300 hover:bg-brand-brown-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
