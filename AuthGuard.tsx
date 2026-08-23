'use client';
import { useStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, currentUser, loadData, isLoaded } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData(); // Connects to Supabase on mount
  }, [loadData]);

  useEffect(() => {
    if (!mounted) return;

    if (!isLoggedIn && pathname !== '/login') {
      router.replace('/login');
    } else if (isLoggedIn && !currentUser && pathname !== '/identity') {
      router.replace('/identity');
    } else if (isLoggedIn && currentUser && (pathname === '/login' || pathname === '/identity')) {
      router.replace('/');
    }
  }, [mounted, isLoggedIn, currentUser, pathname, router]);

  if (!mounted) return null; // Prevent hydration mismatch

  // Only render children if authenticated (or on allowed unauthenticated routes)
  if (!isLoggedIn && pathname !== '/login') return null;
  if (isLoggedIn && !currentUser && pathname !== '/identity') return null;

  return <>{children}</>;
}
