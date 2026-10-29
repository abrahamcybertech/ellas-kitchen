'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  Eye,
  Calendar,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [rangeDays, setRangeDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/metrics?days=${rangeDays}`);
        const data = await res.json();
        if (data.success) {
          setMetrics(data.data);
        }
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, [rangeDays]);

  if (isLoading || !metrics) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-brand-brown-300">Computing live business metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-cream-50">
            Operations &amp; Performance Overview
          </h1>
          <p className="text-xs text-brand-brown-300 mt-1">
            Real time metrics computed from persistent order records and verified payments.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-brand-dark-900 border border-brand-brown-800 p-1 rounded-xl">
          <button
            onClick={() => setRangeDays(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              rangeDays === 1 ? 'bg-brand-gold-500 text-brand-dark-950' : 'text-brand-cream-300 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setRangeDays(7)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              rangeDays === 7 ? 'bg-brand-gold-500 text-brand-dark-950' : 'text-brand-cream-300 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRangeDays(30)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              rangeDays === 30 ? 'bg-brand-gold-500 text-brand-dark-950' : 'text-brand-cream-300 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Financial Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-brand-brown-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <DollarSign className="w-4 h-4 text-brand-gold-400" />
          </div>
          <div className="font-serif text-2xl font-extrabold text-brand-cream-50">
            ₦{metrics.grossSales.toLocaleString()}
          </div>
          <p className="text-[11px] text-brand-brown-400">Total active order volume</p>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-brand-brown-400">
            <span className="text-xs font-bold uppercase tracking-wider">Collected Revenue</span>
            <CreditCard className="w-4 h-4 text-green-400" />
          </div>
          <div className="font-serif text-2xl font-extrabold text-green-400">
            ₦{metrics.collectedPayments.toLocaleString()}
          </div>
          <p className="text-[11px] text-brand-brown-400">Verified &amp; paid funds</p>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-brand-brown-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Settlement</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="font-serif text-2xl font-extrabold text-yellow-400">
            ₦{metrics.pendingPayments.toLocaleString()}
          </div>
          <p className="text-[11px] text-brand-brown-400">Bank transfers or cash on pickup</p>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-brand-brown-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-brand-gold-400" />
          </div>
          <div className="font-serif text-2xl font-extrabold text-brand-gold-300">
            ₦{metrics.avgOrderValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-brand-brown-400">Per completed transaction</p>
        </div>
      </div>

      {/* Operational Order Pipeline Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-xl p-4 text-center">
          <span className="text-xs text-brand-brown-300 block">Total Orders</span>
          <span className="font-serif text-xl font-bold text-brand-cream-50">{metrics.totalOrders}</span>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-xl p-4 text-center">
          <span className="text-xs text-brand-brown-300 block">Today's Orders</span>
          <span className="font-serif text-xl font-bold text-brand-gold-400">{metrics.todayOrders}</span>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-xl p-4 text-center">
          <span className="text-xs text-brand-brown-300 block">Awaiting Review</span>
          <span className="font-serif text-xl font-bold text-yellow-400">{metrics.awaitingOrders}</span>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-xl p-4 text-center">
          <span className="text-xs text-brand-brown-300 block">Simmering</span>
          <span className="font-serif text-xl font-bold text-orange-400">{metrics.preparingOrders}</span>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-xl p-4 text-center">
          <span className="text-xs text-brand-brown-300 block">Completed</span>
          <span className="font-serif text-xl font-bold text-green-400">{metrics.completedOrders}</span>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-xl p-4 text-center">
          <span className="text-xs text-brand-brown-300 block">Cancelled</span>
          <span className="font-serif text-xl font-bold text-red-400">{metrics.cancelledOrders}</span>
        </div>
      </div>

      {/* Two Column: Best Sellers & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Best Selling Dishes */}
        <div className="lg:col-span-5 bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-brand-cream-50 border-b border-brand-brown-800 pb-3">
            Top Selling Dishes
          </h2>

          <div className="space-y-3">
            {metrics.topProducts?.length === 0 ? (
              <p className="text-xs text-brand-brown-400 py-6 text-center">No orders recorded yet</p>
            ) : (
              metrics.topProducts?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-brand-brown-800/40">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-brand-gold-500/10 text-brand-gold-400 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-brand-cream-100 block line-clamp-1">
                        {item.product_name}
                      </span>
                      <span className="text-brand-brown-400 text-[10px]">{item.total_qty} portions prepared</span>
                    </div>
                  </div>
                  <span className="font-bold text-brand-gold-400">
                    ₦{item.total_revenue.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-brown-800 pb-3">
            <h2 className="font-serif text-lg font-bold text-brand-cream-50">
              Recent Incoming Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-brand-gold-400 hover:text-brand-gold-300 font-bold flex items-center gap-1"
            >
              <span>Manage All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-brown-800/80 text-brand-brown-400">
                  <th className="py-2">Reference</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-brown-800/30">
                {metrics.recentOrders?.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-brand-brown-900/40 transition">
                    <td className="py-3 font-mono font-bold text-brand-gold-400">
                      {ord.reference}
                    </td>
                    <td className="py-3 text-brand-cream-100 font-medium">
                      {ord.customer_name}
                    </td>
                    <td className="py-3 font-semibold text-brand-cream-100">
                      ₦{ord.total_amount.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-brown-800 text-brand-cream-200">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders`}
                        className="p-1.5 rounded-lg bg-brand-dark-950 hover:bg-brand-gold-500 hover:text-brand-dark-950 text-brand-cream-200 inline-block transition"
                        title="View Order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
