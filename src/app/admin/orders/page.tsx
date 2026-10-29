'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, PaymentStatus } from '@/lib/types';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  X,
  CreditCard,
  Building,
  Truck,
  Store,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('payment_status', paymentFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setTotalCount(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note: statusNote || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
        setStatusNote('');
        fetchOrders();
      }
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const updatePayment = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
        fetchOrders();
      }
    } catch (err) {
      alert('Failed to update payment status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-cream-50">
            Order Operations &amp; Dispatch
          </h1>
          <p className="text-xs text-brand-brown-300 mt-1">
            Review incoming guest orders, confirm bank transfers, advance preparation, and print kitchen dockets.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-brand-gold-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, name, phone..."
            className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl pl-9 pr-4 py-2 text-xs text-brand-cream-100 placeholder-brand-brown-400 focus:outline-none focus:border-brand-gold-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-3 py-2 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
          >
            <option value="">All Fulfilment Statuses</option>
            <option value="pending_confirmation">Pending Confirmation</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing in Kitchen</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-3 py-2 text-xs text-brand-cream-100 focus:outline-none focus:border-brand-gold-500"
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid (Online / Card)</option>
            <option value="manually_verified">Verified Transfer</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {(statusFilter || paymentFilter || search) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setPaymentFilter('');
                setSearch('');
              }}
              className="text-xs text-brand-gold-400 hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-brand-brown-950/80 border-b border-brand-brown-800 text-brand-brown-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Fulfilment</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-brown-800/40">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-brown-400">
                    No orders match your current filter selection.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-brown-900/30 transition">
                    <td className="py-4 px-4 font-mono font-bold text-brand-gold-400">
                      {ord.reference}
                      <span className="block text-[10px] text-brand-brown-400 font-sans font-normal mt-0.5">
                        {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-brand-cream-50 block text-sm">
                        {ord.customer_name}
                      </span>
                      <span className="text-brand-brown-300 text-[11px] block">{ord.customer_phone}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="capitalize font-semibold text-brand-cream-100 flex items-center gap-1.5">
                        {ord.fulfilment_type === 'delivery' ? (
                          <Truck className="w-3.5 h-3.5 text-brand-gold-400" />
                        ) : (
                          <Store className="w-3.5 h-3.5 text-brand-gold-400" />
                        )}
                        <span>{ord.fulfilment_type}</span>
                      </span>
                      {ord.delivery_zone && (
                        <span className="text-[10px] text-brand-brown-400 block line-clamp-1">
                          {ord.delivery_zone}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-brand-cream-50 text-sm">
                      ₦{ord.total_amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                          ord.payment_status === 'paid' || ord.payment_status === 'manually_verified'
                            ? 'bg-green-950 text-green-300 border border-green-800'
                            : ord.payment_status === 'pending'
                            ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {ord.payment_status === 'manually_verified' ? 'Verified' : ord.payment_status}
                      </span>
                      <span className="block text-[10px] text-brand-brown-400 mt-0.5 capitalize">
                        {ord.payment_method.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-brown-900 border border-brand-brown-700 text-brand-cream-200 block w-max">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-dark-950 border border-brand-gold-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-brown-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-400 block">
                  Order Management Docket
                </span>
                <h3 className="font-serif text-2xl font-bold text-brand-cream-50 font-mono">
                  {selectedOrder.reference}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-brand-brown-900 border border-brand-brown-800 text-brand-cream-200 hover:text-brand-gold-400 transition"
                  title="Print Docket"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl bg-brand-brown-900 border border-brand-brown-800 text-brand-cream-200 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-brand-dark-900 p-4 rounded-2xl border border-brand-brown-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-brand-brown-400 block">Fulfilment Status</span>
                <span className="font-serif font-bold text-brand-cream-50 uppercase tracking-wide text-sm">
                  {selectedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-xs text-brand-brown-400 block">Payment Status</span>
                <span className="font-serif font-bold text-brand-gold-400 uppercase tracking-wide text-sm">
                  {selectedOrder.payment_status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-xs text-brand-brown-400 block">Order Total</span>
                <span className="font-serif text-lg font-bold text-brand-gold-300">
                  ₦{selectedOrder.total_amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-brand-dark-900 p-4 rounded-2xl border border-brand-brown-800">
              <div className="space-y-1">
                <span className="font-bold text-brand-cream-200 block">Customer Information:</span>
                <p className="text-brand-cream-100 font-semibold">{selectedOrder.customer_name}</p>
                <p className="text-brand-brown-300">{selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && <p className="text-brand-brown-400">{selectedOrder.customer_email}</p>}
                {selectedOrder.preferred_time && (
                  <p className="text-brand-gold-400 pt-1">Preferred Time: {selectedOrder.preferred_time}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-brand-cream-200 block">Fulfilment Address:</span>
                <p className="capitalize font-semibold text-brand-gold-400">{selectedOrder.fulfilment_type}</p>
                {selectedOrder.delivery_address && (
                  <p className="text-brand-cream-100">{selectedOrder.delivery_address}</p>
                )}
                {selectedOrder.delivery_zone && (
                  <p className="text-brand-brown-300">Zone: {selectedOrder.delivery_zone}</p>
                )}
                {selectedOrder.customer_notes && (
                  <p className="text-brand-brown-400 pt-1 italic">Notes: "{selectedOrder.customer_notes}"</p>
                )}
              </div>
            </div>

            {/* Immutable Items Snapshot */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-400 block">
                Ordered Meals &amp; Delicacies
              </span>
              <div className="space-y-2 border border-brand-brown-800 rounded-2xl p-4 bg-brand-dark-900">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs border-b border-brand-brown-800/40 pb-2">
                    <div>
                      <span className="font-bold text-brand-cream-100 text-sm block">
                        {it.quantity}x {it.product_name}
                      </span>
                      {it.variation_snapshot && (
                        <span className="text-brand-gold-400 block">
                          Portion: {it.variation_snapshot.name}
                        </span>
                      )}
                      {it.extras_snapshot && it.extras_snapshot.length > 0 && (
                        <span className="text-brand-brown-400 block">
                          Extras: {it.extras_snapshot.map((e) => `${e.name} (x${e.quantity})`).join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-brand-gold-300 text-sm">
                      ₦{it.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="pt-2 flex justify-between text-xs font-bold text-brand-gold-400">
                  <span>Grand Total</span>
                  <span>₦{selectedOrder.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Status Transition Buttons */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-400 block">
                Update Order Stage
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => updateStatus(selectedOrder.id, 'confirmed')}
                  className="px-3 py-1.5 rounded-lg bg-brand-brown-900 hover:bg-brand-gold-500 hover:text-brand-dark-950 border border-brand-brown-700 text-xs font-bold transition"
                >
                  Confirm Order
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => updateStatus(selectedOrder.id, 'preparing')}
                  className="px-3 py-1.5 rounded-lg bg-brand-brown-900 hover:bg-brand-gold-500 hover:text-brand-dark-950 border border-brand-brown-700 text-xs font-bold transition"
                >
                  Start Preparing
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => updateStatus(selectedOrder.id, selectedOrder.fulfilment_type === 'delivery' ? 'out_for_delivery' : 'ready_for_pickup')}
                  className="px-3 py-1.5 rounded-lg bg-brand-brown-900 hover:bg-brand-gold-500 hover:text-brand-dark-950 border border-brand-brown-700 text-xs font-bold transition"
                >
                  {selectedOrder.fulfilment_type === 'delivery' ? 'Dispatch for Delivery' : 'Ready for Pickup'}
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => updateStatus(selectedOrder.id, 'completed')}
                  className="px-3 py-1.5 rounded-lg bg-green-950 hover:bg-green-700 text-green-200 border border-green-800 text-xs font-bold transition"
                >
                  Mark Completed
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                  className="px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-800 text-red-200 border border-red-800 text-xs font-bold transition"
                >
                  Cancel Order
                </button>
              </div>
            </div>

            {/* Payment Verification Buttons */}
            <div className="space-y-3 pt-2 border-t border-brand-brown-800">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-400 block">
                Payment Verification
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => updatePayment(selectedOrder.id, 'manually_verified')}
                  className="px-3.5 py-1.5 rounded-lg bg-green-900/60 hover:bg-green-600 text-green-200 border border-green-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Bank Transfer as Paid</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => updatePayment(selectedOrder.id, 'refunded')}
                  className="px-3.5 py-1.5 rounded-lg bg-brand-brown-900 hover:bg-red-950 text-brand-brown-300 hover:text-red-300 border border-brand-brown-700 text-xs font-semibold transition"
                >
                  Record Refund
                </button>
              </div>
            </div>

            {/* Status History Audit Log */}
            {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-brand-brown-800">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-brown-400 block">
                  Status History Trail
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedOrder.status_history.map((h, i) => (
                    <div key={i} className="text-[11px] text-brand-brown-300 flex justify-between">
                      <span>
                        <strong className="text-brand-cream-100 capitalize">{h.status.replace(/_/g, ' ')}</strong> - {h.note} ({h.created_by})
                      </span>
                      <span className="text-brand-brown-400">{new Date(h.created_at).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
