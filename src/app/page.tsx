'use client';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, UserCheck, Video, Clock, CheckCircle2, FileSignature } from 'lucide-react';
import UserBadge from '@/components/UserBadge';

export default function Dashboard() {
  const { affiliates, logs, contentSubmissions } = useStore();

  const stats = {
    total: affiliates.length,
    byAzoz: affiliates.filter(a => a.onboardedBy === 'Azoz').length,
    byZuno: affiliates.filter(a => a.onboardedBy === 'Zuno').length,
    pending: affiliates.filter(a => a.status === 'Pending Content' || a.status === 'Content Under Review').length,
    active: affiliates.filter(a => a.status === 'Active').length,
    videos: contentSubmissions.filter(s => s.status === 'Approved').length
  };

  const statCards = [
    { title: 'Total Affiliates', value: stats.total, icon: Users, color: 'text-[#8B5CF6]' },
    { title: 'Onboarded by Azoz', value: stats.byAzoz, icon: UserCheck, color: 'text-[#A78BFA]' },
    { title: 'Onboarded by Zuno', value: stats.byZuno, icon: UserCheck, color: 'text-[#A78BFA]' },
    { title: 'Videos Submitted', value: stats.videos, icon: Video, color: 'text-[#F8F5FF]' },
    { title: 'Pending Approvals', value: stats.pending, icon: Clock, color: 'text-[#F59E0B]' },
    { title: 'Active Accounts', value: stats.active, icon: CheckCircle2, color: 'text-[#10B981]' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F8F5FF]">Dashboard</h1>
          <p className="text-[#C4B5FD] mt-1">Welcome to the Cobra Vault Affiliate Command Center.</p>
        </div>
        <Link href="/contract/new">
          <button className="relative group overflow-hidden rounded-xl px-8 py-4 bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center space-x-2">
            <FileSignature className="w-5 h-5 text-white relative z-10" />
            <span className="font-bold text-white relative z-10">Generate New Contract</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-[#161022] border border-[#2E1A4D] hover:border-[#7C3AED]/50 transition-colors shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#C4B5FD]">{stat.title}</p>
                <p className="text-3xl font-bold text-[#F8F5FF] mt-2">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl bg-[#1C1529] ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#161022] border border-[#2E1A4D] shadow-lg">
          <h2 className="text-xl font-bold text-[#F8F5FF] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start space-x-4 p-4 rounded-xl bg-[#1C1529] border border-[#2E1A4D]/50">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center shrink-0">
                  <span className="font-bold text-[#A78BFA]">{log.performedBy[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F8F5FF]">
                    <span className="text-[#A78BFA]">{log.performedBy}</span> {log.action}
                  </p>
                  <p className="text-xs text-[#C4B5FD] mt-1">{log.details}</p>
                  <p className="text-xs text-[#C4B5FD]/50 mt-2">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-[#C4B5FD] text-center py-8">No recent activity.</p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161022] to-[#1C1529] border border-[#2E1A4D] shadow-lg">
          <h2 className="text-xl font-bold text-[#F8F5FF] mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0614] border border-[#2E1A4D]/50">
              <span className="text-sm text-[#C4B5FD]">Database (Supabase)</span>
              <span className="flex items-center text-xs font-medium text-[#10B981]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] mr-2 animate-pulse" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B0614] border border-[#2E1A4D]/50">
              <span className="text-sm text-[#C4B5FD]">Vault Encryption</span>
              <span className="flex items-center text-xs font-medium text-[#10B981]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] mr-2" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
