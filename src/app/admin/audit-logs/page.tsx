'use client';

import React, { useState, useEffect } from 'react';
import { AuditLogItem } from '@/lib/types';
import { ShieldCheck, Search, Clock, User, Globe, AlertCircle } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch('/api/admin/audit-logs?limit=150');
        const data = await res.json();
        if (data.success) {
          setLogs(data.data);
        } else {
          setErrorMessage(data.error);
        }
      } catch {
        setErrorMessage('Failed to load audit logs');
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = filterAction
    ? logs.filter((l) => l.action.toLowerCase().includes(filterAction.toLowerCase()))
    : logs;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-cream-50">
          Security &amp; Operational Audit Trail
        </h1>
        <p className="text-xs text-brand-brown-300 mt-1">
          Immutable logging of staff logins, category alterations, product updates, and order status transitions.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            placeholder="Filter action (e.g. LOGIN, UPDATE_ORDER)..."
            className="w-72 bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-2 text-xs text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500"
          />
          {filterAction && (
            <button
              onClick={() => setFilterAction('')}
              className="text-xs text-brand-gold-400 hover:underline px-2"
            >
              Clear
            </button>
          )}
        </div>
        <span className="text-xs text-brand-brown-400">
          Showing {filteredLogs.length} logged events
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-brand-brown-950/80 border-b border-brand-brown-800 text-brand-brown-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-brown-800/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-brand-brown-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-brown-900/30 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-brand-brown-300 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-NG')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-brand-brown-950 text-brand-gold-400 border border-brand-gold-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-brand-cream-100">
                      {log.user_email || 'System'}
                      {log.ip_address && (
                        <span className="block text-[10px] text-brand-brown-400 font-mono">
                          IP: {log.ip_address}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-brand-brown-300 capitalize">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 10)})` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-brand-brown-400 font-mono max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : 'None'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
