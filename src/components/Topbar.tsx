'use client';
import UserBadge from './UserBadge';
import { useStore } from '@/lib/store';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const { isLoggedIn, currentUser } = useStore();
  const pathname = usePathname();

  if (!isLoggedIn || !currentUser || pathname === '/login' || pathname === '/identity') return null;

  return (
    <div className="sticky top-0 z-40 w-full flex items-center justify-end px-8 py-4 bg-[#0B0614]/80 backdrop-blur-md border-b border-[#2E1A4D]">
      <UserBadge />
    </div>
  );
}
