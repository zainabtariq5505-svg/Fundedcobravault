'use client';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, MoreHorizontal, CheckCircle2, XCircle, Clock, Download } from 'lucide-react';

export default function AffiliatesTable() {
  const { affiliates, contentSubmissions } = useStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterOnboarder, setFilterOnboarder] = useState<string>('All');

  const filtered = affiliates.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.handle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    const matchesOnboarder = filterOnboarder === 'All' || a.onboardedBy === filterOnboarder;
    return matchesSearch && matchesStatus && matchesOnboarder;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30';
      case 'Pending Content':
      case 'Content Under Review': return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
      case 'Terminated': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Active': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'Pending Content':
      case 'Content Under Review': return <Clock className="w-3 h-3 mr-1" />;
      case 'Terminated': return <XCircle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Handle', 'Email', 'Account Size', 'Status', 'Onboarded By', 'Created At'];
    const rows = filtered.map(a => [
      a.id, a.name, a.handle, a.email, a.accountSize, a.status, a.onboardedBy, new Date(a.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Cobra_Vault_Affiliates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8F5FF]">Affiliates</h1>
          <p className="text-[#C4B5FD] mt-1">Manage and monitor all onboarded affiliates.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#1C1529] border border-[#2E1A4D] text-[#A78BFA] hover:bg-[#2E1A4D] hover:text-[#F8F5FF] transition-colors"
        >
          <Download className="w-4 h-4" /> <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-[#161022] border border-[#2E1A4D] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#2E1A4D] flex flex-col md:flex-row gap-4 items-center justify-between bg-[#1C1529]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4B5FD]" />
            <input 
              type="text" 
              placeholder="Search by name or handle..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl pl-10 pr-4 py-2 text-sm text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="flex items-center space-x-2 text-sm">
              <Filter className="w-4 h-4 text-[#C4B5FD]" />
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-[#0B0614] border border-[#2E1A4D] rounded-lg px-3 py-2 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Content">Pending Content</option>
                <option value="Content Under Review">Content Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Active">Active</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <select 
                value={filterOnboarder} 
                onChange={e => setFilterOnboarder(e.target.value)}
                className="bg-[#0B0614] border border-[#2E1A4D] rounded-lg px-3 py-2 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]"
              >
                <option value="All">All Onboarders</option>
                <option value="Azoz">Azoz</option>
                <option value="Zuno">Zuno</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B0614] border-b border-[#2E1A4D]">
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Affiliate</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Account Size</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Content Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Onboarded By</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E1A4D]">
              {filtered.map((affiliate) => {
                const subs = contentSubmissions.filter(s => s.affiliateId === affiliate.id && s.status === 'Approved');
                const videosDone = subs.length;
                const totalVideos = affiliate.platforms.includes('YouTube') && affiliate.platforms.includes('Instagram') ? 3 : 
                                    affiliate.platforms.includes('YouTube') ? 1 : 2;
                
                return (
                  <tr key={affiliate.id} className="hover:bg-[#1C1529]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center font-bold text-[#A78BFA] mr-3">
                          {affiliate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[#F8F5FF]">{affiliate.name}</p>
                          <p className="text-xs text-[#C4B5FD]">{affiliate.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#F8F5FF]">${affiliate.accountSize.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(affiliate.status)}`}>
                        {getStatusIcon(affiliate.status)}
                        {affiliate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-[#0B0614] rounded-full overflow-hidden mr-2 border border-[#2E1A4D]">
                          <div 
                            className="h-full bg-[#7C3AED] transition-all"
                            style={{ width: `${Math.min(100, (videosDone / totalVideos) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#C4B5FD]">{videosDone}/{totalVideos}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#1C1529] border ${
                        affiliate.onboardedBy === 'Azoz' ? 'text-[#7C3AED] border-[#7C3AED]/30' : 'text-[#A78BFA] border-[#A78BFA]/30'
                      }`}>
                        {affiliate.onboardedBy}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#C4B5FD]">
                        {new Date(affiliate.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/affiliates/${affiliate.id}`}>
                        <button className="p-2 text-[#C4B5FD] hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#C4B5FD]">
                    No affiliates found matching your criteria.
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
