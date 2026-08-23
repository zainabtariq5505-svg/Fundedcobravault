'use client';
import { useStore } from '@/lib/store';
import { ScrollText, Search } from 'lucide-react';
import { useState } from 'react';

export default function AuditLogs() {
  const { logs } = useStore();
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.performedBy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8F5FF]">System Audit Logs</h1>
          <p className="text-[#C4B5FD] mt-1">Immutable record of all system actions and state changes.</p>
        </div>
      </div>

      <div className="bg-[#161022] border border-[#2E1A4D] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#2E1A4D] bg-[#1C1529]">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4B5FD]" />
            <input 
              type="text" 
              placeholder="Search logs by action, details, or user..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl pl-10 pr-4 py-2 text-sm text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0614] border-b border-[#2E1A4D]">
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E1A4D]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1C1529]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-[#C4B5FD]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ScrollText className="w-4 h-4 text-[#8B5CF6] mr-2" />
                      <span className="font-medium text-[#F8F5FF]">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#C4B5FD]">{log.details}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                      log.performedBy === 'Azoz' 
                        ? 'bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/30'
                        : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                    }`}>
                      {log.performedBy}
                    </span>
                  </td>
                </tr>
              ))}
              
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#C4B5FD]">
                    No audit logs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
