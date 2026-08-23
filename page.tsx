'use client';
import { useStore } from '@/lib/store';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ShieldAlert, Video, RefreshCw, XCircle, FileText, Check, Link as LinkIcon, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Extracted outside to prevent unmounting on re-renders
const ContentItem = ({ type, label, showNotes = false, submissions, affiliateId, updateContentStatus, addLog }: { 
  type: 'youtubeReview' | 'reel1' | 'reel2', 
  label: string, 
  showNotes?: boolean,
  submissions: any[],
  affiliateId: string,
  updateContentStatus: any,
  addLog: any
}) => {
  const sub = submissions.find(s => s.type === type) || { status: 'Not Submitted', url: '', notes: '', dateSubmitted: '' };
  const [url, setUrl] = useState(sub.url || '');
  const [subNotes, setSubNotes] = useState(sub.notes || '');

  const handleUpdate = (newStatus: 'Not Submitted' | 'Submitted' | 'Approved' | 'Rejected') => {
    updateContentStatus(affiliateId, type, newStatus, url, subNotes);
    addLog('Content Updated', `${label} marked as ${newStatus}`);
    toast.success(`${label} status updated to ${newStatus}`);
  };

  return (
    <div className="p-6 rounded-xl border border-[#2E1A4D] bg-[#0B0614] space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-[#F8F5FF] font-bold">{label}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          sub.status === 'Approved' ? 'bg-[#10B981]/20 text-[#10B981]' :
          sub.status === 'Rejected' ? 'bg-red-500/20 text-red-500' :
          sub.status === 'Submitted' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {sub.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C4B5FD]" />
          <input 
            type="url" 
            placeholder="Paste video URL here..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-[#161022] border border-[#2E1A4D] rounded-lg pl-10 pr-4 py-2 text-sm text-[#F8F5FF] focus:border-[#7C3AED] focus:outline-none"
          />
        </div>

        {showNotes && (
          <textarea
            placeholder="Add review notes here..."
            value={subNotes}
            onChange={(e) => setSubNotes(e.target.value)}
            className="w-full h-20 bg-[#161022] border border-[#2E1A4D] rounded-lg p-3 text-sm text-[#F8F5FF] focus:border-[#7C3AED] focus:outline-none resize-none"
          />
        )}

        {sub.dateSubmitted && (
          <div className="flex items-center text-xs text-[#C4B5FD]">
            <Calendar className="w-3 h-3 mr-1" />
            Submitted on: {new Date(sub.dateSubmitted).toLocaleString()}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2E1A4D]">
          {sub.status === 'Not Submitted' && (
            <button onClick={() => handleUpdate('Submitted')} disabled={!url} className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#8B5CF6] disabled:opacity-50 transition-colors">
              Mark as Submitted
            </button>
          )}
          
          {sub.status !== 'Not Submitted' && (
            <>
              <button onClick={() => handleUpdate('Approved')} className="flex items-center px-4 py-2 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-lg text-sm font-medium hover:bg-[#10B981]/30 transition-colors">
                <Check className="w-4 h-4 mr-1" /> Approve
              </button>
              <button onClick={() => handleUpdate('Rejected')} className="flex items-center px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors">
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </button>
            </>
          )}
          {sub.status !== 'Not Submitted' && (
            <button onClick={() => handleUpdate('Not Submitted')} className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-500/30 transition-colors ml-auto">
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AffiliateDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const { affiliates, updateAffiliate, addLog, contentSubmissions, updateContentStatus } = useStore();
  const affiliate = affiliates.find(a => a.id === id);
  const submissions = contentSubmissions.filter(s => s.affiliateId === id);

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (affiliate) setNotes(affiliate.notes);
  }, [affiliate]);

  if (!affiliate) {
    return <div className="text-[#C4B5FD] text-center mt-20">Affiliate not found.</div>;
  }

  const handleStatusChange = (newStatus: 'Active' | 'Terminated' | 'Approved' | 'Content Under Review') => {
    updateAffiliate(id, { status: newStatus });
    addLog('Status Updated', `${affiliate.name} is now ${newStatus}`);
    toast.success(`Affiliate status updated to ${newStatus}`);
  };

  const saveNotes = () => {
    updateAffiliate(id, { notes });
    addLog('Notes Updated', `Updated notes for ${affiliate.name}`);
    toast.success('Notes saved successfully');
  };

  const handleResetCounter = (increment: number) => {
    const newVal = Math.max(0, Math.min(4, affiliate.resetsUsed + increment));
    updateAffiliate(id, { resetsUsed: newVal });
    addLog('Reset Adjusted', `${affiliate.name} resets: ${affiliate.resetsUsed} -> ${newVal}`);
    toast.success('Reset counter updated');
  };

  const totalVideos = affiliate.platforms.includes('YouTube') && affiliate.platforms.includes('Instagram') ? 3 : 
                      affiliate.platforms.includes('YouTube') ? 1 : 2;
  const videosSubmittedOrApproved = submissions.filter(s => s.status === 'Submitted' || s.status === 'Approved').length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <Link href="/affiliates" className="inline-flex items-center text-[#C4B5FD] hover:text-[#F8F5FF] transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Affiliates
      </Link>

      <div className="bg-[#161022] border border-[#2E1A4D] rounded-2xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C3AED]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center font-bold text-2xl text-white mr-4 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              {affiliate.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#F8F5FF]">{affiliate.name}</h1>
              <div className="flex items-center space-x-3 mt-1 text-sm text-[#C4B5FD]">
                <span>{affiliate.handle}</span>
                <span>•</span>
                <span>{affiliate.email}</span>
                <span>•</span>
                <span>{affiliate.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-4 py-2 rounded-xl border font-bold flex items-center shadow-lg ${
              affiliate.status === 'Active' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' :
              affiliate.status === 'Terminated' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
              'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
            }`}>
              {affiliate.status.toUpperCase()}
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#1C1529] border border-[#2E1A4D] font-bold text-[#A78BFA] shadow-lg">
              ${affiliate.accountSize.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#161022] border border-[#2E1A4D] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Video className="w-5 h-5 text-[#A78BFA] mr-2" />
                <h2 className="text-xl font-bold text-[#F8F5FF]">Content & Videos</h2>
              </div>
              <div className="bg-[#0B0614] border border-[#2E1A4D] px-4 py-1.5 rounded-full">
                <span className="text-sm font-bold text-[#F8F5FF]">Videos Submitted: <span className={videosSubmittedOrApproved === totalVideos ? 'text-[#10B981]' : 'text-[#A78BFA]'}>{videosSubmittedOrApproved} / {totalVideos}</span></span>
              </div>
            </div>
            
            <div className="space-y-6">
              {affiliate.platforms.includes('YouTube') && (
                <ContentItem type="youtubeReview" label="YouTube Review Video" showNotes={true} submissions={submissions} affiliateId={id} updateContentStatus={updateContentStatus} addLog={addLog} />
              )}
              {affiliate.platforms.includes('Instagram') && (
                <>
                  <ContentItem type="reel1" label="Instagram Reel (1)" submissions={submissions} affiliateId={id} updateContentStatus={updateContentStatus} addLog={addLog} />
                  <ContentItem type="reel2" label="Instagram Reel (2)" submissions={submissions} affiliateId={id} updateContentStatus={updateContentStatus} addLog={addLog} />
                </>
              )}
            </div>
          </div>

          <div className="bg-[#161022] border border-[#2E1A4D] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-6">
              <FileText className="w-5 h-5 text-[#A78BFA] mr-2" />
              <h2 className="text-xl font-bold text-[#F8F5FF]">Affiliate Notes</h2>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full h-32 bg-[#0B0614] border border-[#2E1A4D] rounded-xl p-4 text-[#F8F5FF] focus:outline-none focus:border-[#7C3AED] resize-none"
              placeholder="Add internal notes about this affiliate..."
            />
            <div className="flex justify-end mt-4">
              <button 
                onClick={saveNotes}
                disabled={notes === affiliate.notes}
                className="px-6 py-2 bg-[#7C3AED] text-white rounded-xl hover:bg-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#161022] border border-[#2E1A4D] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-6">
              <RefreshCw className="w-5 h-5 text-[#A78BFA] mr-2" />
              <h2 className="text-xl font-bold text-[#F8F5FF]">Reset Usage</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0B0614] rounded-xl border border-[#2E1A4D]">
              <div>
                <p className="text-[#C4B5FD] text-sm">Resets Used (Max 4)</p>
                <p className="text-2xl font-bold text-[#F8F5FF] mt-1">{affiliate.resetsUsed} / 4</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={() => handleResetCounter(1)}
                  disabled={affiliate.resetsUsed >= 4}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2E1A4D] text-[#F8F5FF] hover:bg-[#7C3AED] disabled:opacity-50 transition-colors"
                >
                  +
                </button>
                <button 
                  onClick={() => handleResetCounter(-1)}
                  disabled={affiliate.resetsUsed === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2E1A4D] text-[#F8F5FF] hover:bg-[#7C3AED] disabled:opacity-50 transition-colors"
                >
                  -
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#161022] border border-[#2E1A4D] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center mb-6">
              <ShieldAlert className="w-5 h-5 text-[#A78BFA] mr-2" />
              <h2 className="text-xl font-bold text-[#F8F5FF]">Status Actions</h2>
            </div>
            
            <div className="space-y-3">
              {affiliate.status === 'Pending Content' && (
                <button 
                  onClick={() => handleStatusChange('Content Under Review')}
                  className="w-full flex items-center justify-center py-3 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20 transition-all font-medium"
                >
                  Move to Under Review
                </button>
              )}

              {affiliate.status !== 'Active' && (
                <button 
                  onClick={() => {
                    if(confirm('Are you sure you want to fully activate this affiliate?')) {
                      handleStatusChange('Active');
                    }
                  }}
                  className="w-full flex items-center justify-center py-3 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/20 transition-all font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Activate
                </button>
              )}
              
              {affiliate.status !== 'Terminated' && (
                <button 
                  onClick={() => {
                    if(confirm('Are you sure you want to terminate this affiliate? This action permanently disables the account.')) {
                      handleStatusChange('Terminated');
                    }
                  }}
                  className="w-full flex items-center justify-center py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-all font-medium"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Terminate Contract
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
