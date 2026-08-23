'use client';
import { useState } from 'react';
import { useStore, AccountSize, Affiliate } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Download, Send, FileSignature } from 'lucide-react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const ACCOUNT_SIZES: AccountSize[] = [500, 1250, 3500, 5000, 9000];

export default function NewContract() {
  const router = useRouter();
  const { currentUser, addAffiliate, addLog } = useStore();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountSize, setAccountSize] = useState<AccountSize | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    country: '',
    phone: '',
    email: '',
    platforms: [] as string[],
    youtubeUrl: '',
    instagramUrl: ''
  });

  const [generatedId, setGeneratedId] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  const togglePlatform = (p: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) 
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p]
    }));
  };

  const handleGenerate = () => {
    if (!currentUser || !accountSize) return;

    const id = `FC-${currentUser.toUpperCase()}-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const newAffiliate: Affiliate = {
      id,
      ...formData,
      accountSize,
      status: 'Pending Content',
      onboardedBy: currentUser,
      createdAt: new Date().toISOString(),
      resetsUsed: 0,
      notes: ''
    };

    addAffiliate(newAffiliate);
    addLog('Contract Generated', `Generated contract for ${formData.name} ($${accountSize})`);
    
    setGeneratedId(id);
    setStep(3);
    toast.success('Contract Generated Successfully!');
  };

  const handleDownloadPDF = async () => {
    // Add temporary print styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #contract-document, #contract-document * { visibility: visible; }
        #contract-document { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
      }
    `;
    document.head.appendChild(style);
    
    // Trigger native print dialog which allows 'Save as PDF'
    window.print();
    
    // Cleanup
    document.head.removeChild(style);
    addLog('Contract Downloaded', `Generated PDF via Print for ${formData.name}`);
    toast.success('Print dialog opened for PDF save');
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    toast.info('Sending email to affiliate...');
    try {
      const response = await fetch('/api/send-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          contractId: generatedId
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.mocked) {
          toast.success('Email simulated! (Add RESEND_API_KEY to send real emails)');
        } else {
          toast.success('Contract sent successfully via Resend!');
        }
        addLog('Email Sent', `Sent contract to ${formData.email}`);
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to send email. Check API key configuration.');
    } finally {
      setIsSending(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F8F5FF]">New Affiliate Contract</h1>
        <p className="text-[#C4B5FD] mt-1">Generate a legally binding agreement for new affiliates.</p>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
              step >= s ? 'bg-[#7C3AED] text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'bg-[#1C1529] text-[#C4B5FD]'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-1 ml-4 rounded transition-colors ${step > s ? 'bg-[#7C3AED]' : 'bg-[#1C1529]'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-[#F8F5FF]">Select Account Size</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ACCOUNT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setAccountSize(size)}
                  className={`p-6 rounded-2xl border transition-all duration-200 text-left relative overflow-hidden group ${
                    accountSize === size 
                      ? 'border-[#7C3AED] bg-[#7C3AED]/10 shadow-[0_0_15px_rgba(124,58,237,0.2)]' 
                      : 'border-[#2E1A4D] bg-[#161022] hover:border-[#7C3AED]/50 hover:bg-[#1C1529]'
                  }`}
                >
                  {accountSize === size && (
                    <div className="absolute top-4 right-4 text-[#7C3AED]">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <p className="text-[#C4B5FD] text-sm font-medium">Cobra Venom Instant</p>
                  <p className="text-3xl font-bold text-[#F8F5FF] mt-1">${size.toLocaleString()}</p>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                disabled={!accountSize}
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#7C3AED] text-white font-medium hover:bg-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[#161022] border border-[#2E1A4D] rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-[#F8F5FF] mb-6">Affiliate Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#C4B5FD] mb-1">Full Legal Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl px-4 py-2.5 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#C4B5FD] mb-1">Platform Handle</label>
                  <input type="text" value={formData.handle} onChange={e => setFormData({...formData, handle: e.target.value})} className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl px-4 py-2.5 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#C4B5FD] mb-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl px-4 py-2.5 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#C4B5FD] mb-1">Country</label>
                  <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl px-4 py-2.5 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#C4B5FD] mb-1">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl px-4 py-2.5 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#C4B5FD] mb-2">Platforms (Multi-select)</label>
                  <div className="flex space-x-4">
                    {['YouTube', 'Instagram'].map(p => (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          formData.platforms.includes(p) 
                            ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-[#F8F5FF]' 
                            : 'border-[#2E1A4D] bg-[#0B0614] text-[#C4B5FD] hover:bg-[#1C1529]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                
                {formData.platforms.includes('YouTube') && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-[#C4B5FD] mb-1">YouTube URL</label>
                    <input type="url" value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl px-4 py-2.5 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]" />
                  </motion.div>
                )}
                
                {formData.platforms.includes('Instagram') && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-[#C4B5FD] mb-1">Instagram URL</label>
                    <input type="url" value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} className="w-full bg-[#0B0614] border border-[#2E1A4D] rounded-xl px-4 py-2.5 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED]" />
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-[#2E1A4D] mt-8">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-[#2E1A4D] text-[#C4B5FD] font-medium hover:bg-[#1C1529] transition-all">
                Back
              </button>
              <button 
                onClick={handleGenerate}
                disabled={!formData.name || !formData.handle || !formData.email}
                className="flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white font-bold hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] disabled:opacity-50 transition-all"
              >
                <FileSignature className="w-5 h-5" />
                <span>Generate Contract</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex space-x-4 mb-6">
              <button onClick={handleDownloadPDF} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#1C1529] border border-[#2E1A4D] text-[#F8F5FF] hover:bg-[#2E1A4D] transition-colors">
                <Download className="w-4 h-4" /> <span>Download PDF</span>
              </button>
              <button onClick={handleSendEmail} disabled={isSending} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/50 text-[#A78BFA] hover:bg-[#7C3AED]/30 transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" /> <span>Send to Email</span>
              </button>
              <button onClick={() => {
                toast.success('Marked as sent and moved to tracking!');
                router.push('/affiliates');
              }} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] hover:bg-[#10B981]/30 transition-colors ml-auto">
                <CheckCircle2 className="w-4 h-4" /> <span>Done</span>
              </button>
            </div>
            
            <p className="text-xs text-[#C4B5FD] text-center mb-8 bg-[#1C1529] py-2 rounded-lg border border-[#2E1A4D]">
              Note: Email may take 1–2 minutes to arrive. Please advise the affiliate to check their spam folder.
            </p>

            <div id="contract-document" className="bg-white text-black p-12 rounded-lg font-serif">
              <div className="mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-wider text-center border-b-2 border-black pb-4 mb-8">AFFILIATE AGREEMENT – FUNDED COBRA</h1>
                <p>Generated on: {todayStr}</p>
                <p>Contract ID: {generatedId}</p>
              </div>

              <div className="space-y-6 text-sm leading-relaxed text-justify">
                <p>This Agreement is entered into as of the date above between:</p>
                <div className="ml-4">
                  <p><strong>Funded Cobra</strong></p>
                  <p>Represented by: {currentUser}</p>
                  <p>Title: Official Affiliate Partnerships Manager</p>
                  <p>(hereinafter referred to as the "Company")</p>
                </div>
                <p>and</p>
                <div className="ml-4">
                  <p><strong>Affiliate:</strong></p>
                  <p>Full Legal Name: {formData.name}</p>
                  <p>Platform Handle: {formData.handle}</p>
                  <p>Country: {formData.country}</p>
                  <p>Phone: {formData.phone}</p>
                  <p>Primary Platform(s): {formData.platforms.join(' / ')}</p>
                  <p>Platform URL(s): {[formData.youtubeUrl, formData.instagramUrl].filter(Boolean).join(', ')}</p>
                  <p>Assigned Account Size: Cobra Venom Instant – ${accountSize?.toLocaleString()}</p>
                  <p>(hereinafter referred to as the "Affiliate")</p>
                </div>

                <h3 className="text-lg font-bold mt-8 mb-2">1. Purpose of the Agreement</h3>
                <p>The Affiliate is granted access to a simulated funded trading account solely for the purpose of creating high-quality, conversion-focused promotional content that drives real paying customers to Funded Cobra. This is a performance-based partnership. Content that fails to meet quality standards or fails to generate measurable sales may result in immediate termination of this Agreement and the associated account.</p>

                <h3 className="text-lg font-bold mt-6 mb-2">2. Account Access and Reset Policy</h3>
                <p>2.1 The Affiliate will receive one (1) Cobra Venom Instant account of the size stated above.</p>
                <p>2.2 Reset Limit: The Affiliate is entitled to one (1) reset per calendar week, with a hard maximum of four (4) resets per calendar month.</p>
                <p>2.3 A reset restores the account to its original starting balance and original trading rules.</p>
                <p>2.4 Exceeding the allowed number of resets will result in immediate suspension of the account and permanent loss of all payout eligibility.</p>
                <p>2.5 The account remains fully subject to all standard Funded Cobra trading rules, including but not limited to: no hedging, minimum sixty (60) second trade duration, 1.5% open floating loss limit, 4% daily loss limit, 6% maximum loss limit, and 5% withdrawal target.</p>

                <h3 className="text-lg font-bold mt-6 mb-2">3. Mandatory Content Requirements</h3>
                <p>Before any payout request can be submitted, the Affiliate must produce and deliver the following premium content:</p>

                <p className="font-bold mt-4">3.1 YouTube (Primary Platform)</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Minimum of one (1) high-quality review video of Funded Cobra.</li>
                  <li>The video must clearly cover the Cobra Terminal, dashboard, trading rules, account sizes, and current pricing, with specific emphasis on the competitive pricing offered by Funded Cobra.</li>
                  <li>The video must be recorded with face camera and full screen recording (OBS or equivalent professional software).</li>
                  <li>The video must be publicly available.</li>
                  <li>The video must include the Affiliate's unique tracking link or discount code provided by Funded Cobra.</li>
                </ul>

                <p className="font-bold mt-4">3.2 Instagram</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Minimum of two (2) Reels before the first payout request is permitted.</li>
                  <li>Each Reel must be recorded with face camera and screen recording of the dashboard or terminal.</li>
                  <li>High production quality is mandatory. Faceless or low-effort content will be rejected without exception.</li>
                </ul>

                <p className="mt-4">3.3 All content must be original, professional, and created with the clear intention of converting viewers into paying customers. Funded Cobra reserves the sole and absolute right to approve or reject any content submitted under this Agreement.</p>

                <h3 className="text-lg font-bold mt-6 mb-2">4. Payout Eligibility and Restrictions</h3>
                <p>4.1 Content approval (YouTube review video plus two Instagram Reels) is mandatory for all account sizes before any payout request may be submitted.</p>
                <p>4.2 The account must also satisfy all standard Funded Cobra eligibility requirements (withdrawal target reached, no active breach, and compliance with all trading rules).</p>
                <p>4.3 Additional frequency restrictions by account size:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>For $500 and $1,250 accounts: No additional frequency cap applies beyond normal daily eligibility once content has been approved.</li>
                  <li>For $3,500, $5,000, and $9,000 accounts:
                    <ul className="list-[circle] pl-6 mt-1">
                      <li>The first payout request may only be submitted after fifteen (15) full days have elapsed from the account activation date.</li>
                      <li>A maximum of two (2) payouts is permitted per calendar month.</li>
                    </ul>
                  </li>
                </ul>
                <p>4.4 The profit split remains eighty percent (80%), subject to standard Funded Cobra terms and conditions.</p>

                <h3 className="text-lg font-bold mt-6 mb-2">5. Tracking and Performance</h3>
                <p>The Affiliate must use the unique tracking link or discount code provided by Funded Cobra in all promotional content. Sales performance generated through the Affiliate's content will be monitored and will directly influence the continuation or termination of this partnership.</p>

                <h3 className="text-lg font-bold mt-6 mb-2">6. Intellectual Property</h3>
                <p>The Affiliate hereby grants Funded Cobra a worldwide, perpetual, royalty-free, irrevocable, and transferable license to use, reproduce, edit, modify, repost, distribute, publicly display, and promote any content created under this Agreement for any commercial or marketing purpose without further consent or compensation.</p>

                <h3 className="text-lg font-bold mt-6 mb-2">7. Termination</h3>
                <p>Funded Cobra may terminate this Agreement and permanently disable the associated account at any time, with or without prior notice, if any of the following occur:</p>
                <p>7.1 Required content is not delivered or is determined to be of insufficient quality.</p>
                <p>7.2 Content fails to generate meaningful sales within a reasonable period.</p>
                <p>7.3 Reset limits are exceeded.</p>
                <p>7.4 Any Funded Cobra trading rules are breached.</p>
                <p>7.5 The Affiliate posts misleading, false, defamatory, or damaging content regarding Funded Cobra.</p>
                <p>7.6 Any other material breach of this Agreement occurs.</p>
                <p>Upon termination, all access, privileges, and payout eligibility shall immediately and permanently cease.</p>

                <h3 className="text-lg font-bold mt-6 mb-2">8. Independent Contractor Status</h3>
                <p>The Affiliate is and shall remain an independent contractor. Nothing in this Agreement shall be construed as creating an employment relationship, partnership, joint venture, or agency between the parties. The Affiliate shall have no authority to bind Funded Cobra in any manner.</p>

                <h3 className="text-lg font-bold mt-6 mb-2">9. Confidentiality</h3>
                <p>The Affiliate agrees to maintain strict confidentiality regarding all non-public information concerning Funded Cobra's systems, internal processes, trading rules, pricing, and the terms of this Agreement.</p>

                <h3 className="text-lg font-bold mt-6 mb-2">10. Governing Law and Dispute Resolution</h3>
                <p>This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction]. Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts located in [Location].</p>

                <h3 className="text-lg font-bold mt-6 mb-2">11. Entire Agreement</h3>
                <p>This document constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, warranties, and agreements, whether written or oral.</p>

                <p className="mt-8 mb-4">IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>

                <div className="grid grid-cols-2 gap-16 mt-8 pt-8">
                  <div>
                    <p className="mb-8 font-bold">For Funded Cobra</p>
                    <div className="border-b border-black w-full h-8 mb-2 flex items-end">
                      <span className="font-cursive text-xl text-gray-800 italic">{currentUser}</span>
                    </div>
                    <p>{currentUser}</p>
                    <p>Official Affiliate Partnerships Manager</p>
                    <p>Funded Cobra</p>
                    <p className="mt-4">Date: {todayStr}</p>
                  </div>
                  <div>
                    <p className="mb-8 font-bold">Affiliate</p>
                    <div className="border-b border-black w-full h-8 mb-2"></div>
                    <p>Full Name: {formData.name}</p>
                    <p className="mt-4">Signature: _______________________________</p>
                    <p className="mt-4">Date: ____________________</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
