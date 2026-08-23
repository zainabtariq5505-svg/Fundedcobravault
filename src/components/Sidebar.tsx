'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileSignature, Users, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'New Contract', href: '/contract/new', icon: FileSignature },
  { name: 'Affiliates', href: '/affiliates', icon: Users },
  { name: 'Audit Logs', href: '/logs', icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/identity') return null;

  return (
    <aside className="w-64 border-r border-[#2E1A4D] bg-[#0B0614] hidden md:flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-[#2E1A4D]">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#F8F5FF] to-[#A78BFA]">
          Cobra Vault
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-[#7C3AED]/10 text-[#F8F5FF] border border-[#7C3AED]/30 shadow-[0_0_10px_rgba(124,58,237,0.1)]" 
                  : "text-[#C4B5FD] hover:bg-[#1C1529] hover:text-[#F8F5FF]"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-[#A78BFA]" : "text-[#8B5CF6]")} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-[#2E1A4D] text-xs text-[#C4B5FD]/50">
        Funded Cobra © 2026
      </div>
    </aside>
  );
}
