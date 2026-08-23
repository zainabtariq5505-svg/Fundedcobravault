'use client';
import { useStore, UserIdentity } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function IdentitySelection() {
  const { setCurrentUser } = useStore();
  const router = useRouter();

  const handleSelect = (user: UserIdentity) => {
    setCurrentUser(user);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0614] p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED]/10 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 border rounded-2xl bg-[#161022]/90 backdrop-blur-xl border-[#2E1A4D] shadow-[0_0_30px_rgba(124,58,237,0.15)] relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#F8F5FF] mb-2">Cobra Vault</h1>
          <p className="text-[#C4B5FD]">Select Your Identity</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => handleSelect('Azoz')}
            className="w-full relative group overflow-hidden rounded-xl p-5 transition-all duration-300 border border-[#2E1A4D] bg-[#1C1529] hover:border-[#7C3AED] hover:shadow-[0_0_20px_rgba(124,58,237,0.25)] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/0 via-[#7C3AED]/10 to-[#7C3AED]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xl font-semibold text-[#F8F5FF] relative z-10">I am Azoz</span>
          </button>
          
          <button
            onClick={() => handleSelect('Zuno')}
            className="w-full relative group overflow-hidden rounded-xl p-5 transition-all duration-300 border border-[#2E1A4D] bg-[#1C1529] hover:border-[#7C3AED] hover:shadow-[0_0_20px_rgba(124,58,237,0.25)] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/0 via-[#7C3AED]/10 to-[#7C3AED]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xl font-semibold text-[#F8F5FF] relative z-10">I am Zuno</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
