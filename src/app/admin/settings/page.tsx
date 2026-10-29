'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSettings } from '@/lib/types';
import { Settings, Save, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch {
        setErrorMessage('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSettings(data.data);
      setSuccessMessage('Business settings updated successfully and active immediately');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addDeliveryZone = () => {
    if (!settings) return;
    const newZone = {
      id: 'zone_' + Date.now(),
      name: 'New Abuja Zone',
      fee: 2500,
      estimated_minutes: '45 to 60 mins',
    };
    setSettings({
      ...settings,
      delivery_zones: [...settings.delivery_zones, newZone],
    });
  };

  const removeDeliveryZone = (index: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      delivery_zones: settings.delivery_zones.filter((_, i) => i !== index),
    });
  };

  if (isLoading || !settings) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-brand-brown-300">Loading business configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-cream-50">
          Business &amp; Operations Configuration
        </h1>
        <p className="text-xs text-brand-brown-300 mt-1">
          Control contact information, delivery zones, fees, payment toggles, and operating hours in the database without code deployments.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-green-950/60 border border-green-800 text-green-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* General Business Identity */}
        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="font-serif text-xl font-bold text-brand-cream-50 border-b border-brand-brown-800 pb-3">
            Restaurant Details &amp; Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">Business Name</label>
              <input
                type="text"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">Tagline / Motto</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">Phone Order Number</label>
              <input
                type="text"
                value={settings.phone_number}
                onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">WhatsApp Order Line</label>
              <input
                type="text"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-cream-200">Kitchen Address in Abuja</label>
            <input
              type="text"
              value={settings.business_address}
              onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
              className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">Opening Hours</label>
              <input
                type="text"
                value={settings.opening_hours}
                onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">Minimum Order Value (₦)</label>
              <input
                type="number"
                value={settings.min_order_amount}
                onChange={(e) => setSettings({ ...settings, min_order_amount: Number(e.target.value) })}
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Abuja Delivery Zones & Fees */}
        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-brown-800 pb-3">
            <h2 className="font-serif text-xl font-bold text-brand-cream-50">
              Abuja Delivery Zones &amp; Tariffs
            </h2>
            <button
              type="button"
              onClick={addDeliveryZone}
              className="text-xs text-brand-gold-400 hover:text-white font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Zone</span>
            </button>
          </div>

          <div className="space-y-3">
            {settings.delivery_zones.map((zone, idx) => (
              <div key={zone.id || idx} className="flex flex-col sm:flex-row items-center gap-3 bg-brand-dark-950 p-3 rounded-xl border border-brand-brown-800">
                <input
                  type="text"
                  placeholder="Zone Name (e.g. Nyanya)"
                  value={zone.name}
                  onChange={(e) => {
                    const copy = [...settings.delivery_zones];
                    copy[idx].name = e.target.value;
                    setSettings({ ...settings, delivery_zones: copy });
                  }}
                  className="flex-1 bg-brand-dark-900 border border-brand-brown-800 rounded-lg px-3 py-1.5 text-xs text-brand-cream-100"
                />

                <input
                  type="number"
                  placeholder="Fee (₦)"
                  value={zone.fee}
                  onChange={(e) => {
                    const copy = [...settings.delivery_zones];
                    copy[idx].fee = Number(e.target.value);
                    setSettings({ ...settings, delivery_zones: copy });
                  }}
                  className="w-28 bg-brand-dark-900 border border-brand-brown-800 rounded-lg px-3 py-1.5 text-xs text-brand-cream-100 font-bold"
                />

                <input
                  type="text"
                  placeholder="Timing (e.g. 35 to 45 mins)"
                  value={zone.estimated_minutes}
                  onChange={(e) => {
                    const copy = [...settings.delivery_zones];
                    copy[idx].estimated_minutes = e.target.value;
                    setSettings({ ...settings, delivery_zones: copy });
                  }}
                  className="w-36 bg-brand-dark-900 border border-brand-brown-800 rounded-lg px-3 py-1.5 text-xs text-brand-cream-100"
                />

                <button
                  type="button"
                  onClick={() => removeDeliveryZone(idx)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="font-serif text-xl font-bold text-brand-cream-50 border-b border-brand-brown-800 pb-3">
            Bank Transfer Settlement Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">Bank Name</label>
              <input
                type="text"
                value={settings.bank_details.bank_name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bank_details: { ...settings.bank_details, bank_name: e.target.value },
                  })
                }
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">Account Number</label>
              <input
                type="text"
                value={settings.bank_details.account_number}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bank_details: { ...settings.bank_details, account_number: e.target.value },
                  })
                }
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 font-mono font-bold focus:outline-none focus:border-brand-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">Account Name</label>
              <input
                type="text"
                value={settings.bank_details.account_name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    bank_details: { ...settings.bank_details, account_name: e.target.value },
                  })
                }
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2.5 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Channels Activation Toggles */}
        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="font-serif text-xl font-bold text-brand-cream-50 border-b border-brand-brown-800 pb-3">
            Enabled Payment Methods
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-brand-dark-950 rounded-xl border border-brand-brown-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.paystack_enabled}
                onChange={(e) => setSettings({ ...settings, paystack_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-brand-gold-500 focus:ring-brand-gold-500"
              />
              <span className="text-xs font-bold text-brand-cream-100">Paystack Online Payment Gateway</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-brand-dark-950 rounded-xl border border-brand-brown-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.bank_transfer_enabled}
                onChange={(e) => setSettings({ ...settings, bank_transfer_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-brand-gold-500 focus:ring-brand-gold-500"
              />
              <span className="text-xs font-bold text-brand-cream-100">Direct Bank Transfer Orders</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-brand-dark-950 rounded-xl border border-brand-brown-800 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cash_on_pickup_enabled}
                onChange={(e) => setSettings({ ...settings, cash_on_pickup_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-brand-gold-500 focus:ring-brand-gold-500"
              />
              <span className="text-xs font-bold text-brand-cream-100">Cash on Kitchen Pickup</span>
            </label>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-sm shadow-gold-glow flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Configurations...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
