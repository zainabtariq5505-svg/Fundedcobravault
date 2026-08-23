'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Lock, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn } = useStore();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'rehanjaved550@gmail.com' && password === 'fundedcobra@148!') {
      setIsLoggedIn(true);
      toast.success('Authentication successful');
      router.push('/identity');
    } else {
      toast.error('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0614] relative overflow-hidden p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7C3AED]/20 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#161022]/80 backdrop-blur-xl p-8 rounded-2xl border border-[#2E1A4D] shadow-[0_0_40px_rgba(124,58,237,0.15)] relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F8F5FF] mb-2">Cobra Vault</h1>
          <p className="text-[#C4B5FD]">Secure Access Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#C4B5FD] ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C4B5FD]" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl pl-12 pr-4 py-3.5 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED] transition-colors"
                placeholder="admin@fundedcobra.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#C4B5FD] ml-1">Master Password</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C4B5FD]" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl pl-12 pr-4 py-3.5 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all mt-4"
          >
            <span>Authenticate</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
