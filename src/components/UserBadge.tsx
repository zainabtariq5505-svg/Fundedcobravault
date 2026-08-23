'use client';
import { useStore } from '@/lib/store';
import { Shield, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserBadge() {
  const { currentUser, setCurrentUser } = useStore();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted || !currentUser) return null;

  const handleSwitch = (newUser: 'Azoz' | 'Zuno') => {
    if (confirm(`Are you sure you want to switch identity to ${newUser}?`)) {
      setCurrentUser(newUser);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 bg-[#161022] border border-[#7C3AED]/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.15)] hover:bg-[#1C1529] transition-colors"
      >
        <Shield className="w-4 h-4 text-[#A78BFA]" />
        <span className="text-sm font-medium text-[#F8F5FF]">
          Logged in as <span className="text-[#A78BFA]">{currentUser}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-[#C4B5FD] ml-2" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-48 bg-[#161022] border border-[#2E1A4D] rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 space-y-1">
              <p className="px-3 py-1.5 text-xs text-[#C4B5FD] font-medium uppercase tracking-wider">Switch Identity</p>
              {['Azoz', 'Zuno'].filter(u => u !== currentUser).map(user => (
                <button
                  key={user}
                  onClick={() => handleSwitch(user as 'Azoz' | 'Zuno')}
                  className="w-full text-left px-3 py-2 text-sm text-[#F8F5FF] hover:bg-[#1C1529] hover:text-[#A78BFA] rounded-lg transition-colors"
                >
                  Switch to {user}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
