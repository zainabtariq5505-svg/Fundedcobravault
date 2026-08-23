import { create } from 'zustand';
import { supabase } from './supabase';

export type UserIdentity = 'Azoz' | 'Zuno' | null;
export type AffiliateStatus = 'Pending Content' | 'Content Under Review' | 'Approved' | 'Active' | 'Terminated';
export type AccountSize = 500 | 1250 | 3500 | 5000 | 9000;

export interface Affiliate {
  id: string;
  name: string;
  handle: string;
  country: string;
  phone: string;
  email: string;
  platforms: string[];
  youtubeUrl?: string;
  instagramUrl?: string;
  accountSize: AccountSize;
  status: AffiliateStatus;
  onboardedBy: 'Azoz' | 'Zuno';
  createdAt: string;
  resetsUsed: number;
  notes: string;
}

export interface ContentSubmission {
  id: string;
  affiliateId: string;
  type: 'youtubeReview' | 'reel1' | 'reel2';
  status: 'Not Submitted' | 'Submitted' | 'Approved' | 'Rejected';
  url?: string;
  notes?: string;
  dateSubmitted?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: 'Azoz' | 'Zuno';
  timestamp: string;
  details: string;
}

interface VaultState {
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  currentUser: UserIdentity;
  setCurrentUser: (user: UserIdentity) => void;
  
  isLoaded: boolean;
  loadData: () => Promise<void>;

  affiliates: Affiliate[];
  addAffiliate: (affiliate: Affiliate) => void;
  updateAffiliate: (id: string, updates: Partial<Affiliate>) => void;
  
  contentSubmissions: ContentSubmission[];
  updateContentStatus: (affiliateId: string, type: 'youtubeReview' | 'reel1' | 'reel2', status: 'Not Submitted' | 'Submitted' | 'Approved' | 'Rejected', url?: string, notes?: string) => void;

  logs: AuditLog[];
  addLog: (action: string, details: string) => void;
}

// Helpers for mapping DB (snake_case) to Frontend (camelCase)
const toAffiliate = (row: any): Affiliate => ({
  id: row.id, name: row.name, handle: row.handle, country: row.country, phone: row.phone, email: row.email || '',
  platforms: row.platforms || [], youtubeUrl: row.youtube_url || '', instagramUrl: row.instagram_url || '',
  accountSize: row.account_size, status: row.status, onboardedBy: row.onboarded_by, createdAt: row.created_at,
  resetsUsed: row.resets_used, notes: row.notes || ''
});

const toSubmission = (row: any): ContentSubmission => ({
  id: row.id, affiliateId: row.affiliate_id, type: row.type, status: row.status, url: row.url || '', notes: row.notes || '', dateSubmitted: row.date_submitted || undefined
});

const toLog = (row: any): AuditLog => ({
  id: row.id, action: row.action, details: row.details, performedBy: row.performed_by, timestamp: row.created_at
});

export const useStore = create<VaultState>((set, get) => ({
  isLoggedIn: false,
  setIsLoggedIn: (status) => {
    // For prototype simplicity, we also use localStorage for the session state so it survives refresh
    if (typeof window !== 'undefined') {
      if (status) localStorage.setItem('cv_session', 'true');
      else localStorage.removeItem('cv_session');
    }
    set({ isLoggedIn: status });
  },
  currentUser: null,
  setCurrentUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) localStorage.setItem('cv_user', user);
      else localStorage.removeItem('cv_user');
    }
    set({ currentUser: user });
    if (user) {
      get().addLog('Identity Switched', `Logged in as ${user}`);
    }
  },
  
  isLoaded: false,
  loadData: async () => {
    // Check local session
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('cv_session') === 'true';
      const savedUser = localStorage.getItem('cv_user') as UserIdentity;
      if (savedSession) set({ isLoggedIn: true });
      if (savedUser) set({ currentUser: savedUser });
    }

    try {
      const [affData, subData, logData] = await Promise.all([
        supabase.from('affiliates').select('*').order('created_at', { ascending: false }),
        supabase.from('content_submissions').select('*'),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false })
      ]);
      
      set({
        affiliates: (affData.data || []).map(toAffiliate),
        contentSubmissions: (subData.data || []).map(toSubmission),
        logs: (logData.data || []).map(toLog),
        isLoaded: true
      });
    } catch (e) {
      console.error('Failed to load Supabase data:', e);
    }
  },

  affiliates: [],
  addAffiliate: async (affiliate) => {
    // Optimistic UI update
    set(state => ({ affiliates: [affiliate, ...state.affiliates] }));
    // Push to DB
    await supabase.from('affiliates').insert([{
      id: affiliate.id, name: affiliate.name, handle: affiliate.handle, country: affiliate.country,
      phone: affiliate.phone, email: affiliate.email, platforms: affiliate.platforms, youtube_url: affiliate.youtubeUrl,
      instagram_url: affiliate.instagramUrl, account_size: affiliate.accountSize, status: affiliate.status,
      onboarded_by: affiliate.onboardedBy, resets_used: affiliate.resetsUsed, notes: affiliate.notes
    }]);
  },
  updateAffiliate: async (id, updates) => {
    // Optimistic UI update
    set(state => ({ affiliates: state.affiliates.map(a => a.id === id ? { ...a, ...updates } : a) }));
    // Build DB payload
    const payload: any = {};
    if (updates.status) payload.status = updates.status;
    if (updates.resetsUsed !== undefined) payload.resets_used = updates.resetsUsed;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    // Push to DB
    await supabase.from('affiliates').update(payload).eq('id', id);
  },
  
  contentSubmissions: [],
  updateContentStatus: async (affiliateId, type, status, url, notes) => {
    const state = get();
    const existing = state.contentSubmissions.find(s => s.affiliateId === affiliateId && s.type === type);
    const dateSubmitted = (status === 'Submitted' && existing?.status !== 'Submitted') ? new Date().toISOString() : existing?.dateSubmitted;
    
    const dbPayload = {
      affiliate_id: affiliateId,
      type: type,
      status: status,
      url: url ?? existing?.url,
      notes: notes ?? existing?.notes,
      date_submitted: dateSubmitted
    };

    // Optimistic UI
    if (existing) {
      set({ contentSubmissions: state.contentSubmissions.map(s => s.id === existing.id ? { ...s, status, url: dbPayload.url, notes: dbPayload.notes, dateSubmitted } : s) });
    } else {
      const newId = Math.random().toString();
      set({ contentSubmissions: [...state.contentSubmissions, { id: newId, affiliateId, type, status, url: dbPayload.url, notes: dbPayload.notes, dateSubmitted }] });
    }

    // Push to DB (upsert based on affiliate_id + type unique constraint)
    await supabase.from('content_submissions').upsert([dbPayload], { onConflict: 'affiliate_id,type' });
  },

  logs: [],
  addLog: async (action, details) => {
    const currentUser = get().currentUser;
    if (!currentUser) return; 
    
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      performedBy: currentUser,
      timestamp: new Date().toISOString(),
      details
    };
    
    // Optimistic UI
    set(state => ({ logs: [newLog, ...state.logs] }));

    // Push to DB
    await supabase.from('activity_logs').insert([{
      action, details, performed_by: currentUser
    }]);
  }
}));
