-- Create types
CREATE TYPE identity_type AS ENUM ('Azoz', 'Zuno');
CREATE TYPE affiliate_status AS ENUM ('Pending Content', 'Content Under Review', 'Approved', 'Active', 'Terminated');
CREATE TYPE content_status AS ENUM ('Pending', 'Approved', 'Rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  identity identity_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create affiliates table
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  platforms TEXT[] NOT NULL,
  youtube_url TEXT,
  instagram_url TEXT,
  account_size INTEGER NOT NULL,
  status affiliate_status NOT NULL DEFAULT 'Pending Content',
  onboarded_by identity_type NOT NULL,
  resets_used INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  generated_by identity_type NOT NULL,
  contract_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content submissions table
CREATE TABLE public.content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'youtubeReview', 'reel1', 'reel2'
  status content_status NOT NULL DEFAULT 'Pending',
  url TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(affiliate_id, type)
);

-- Create activity logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  performed_by identity_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Assuming authenticated users can do everything for internal tools)
CREATE POLICY "Allow authenticated full access" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON public.affiliates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON public.contracts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON public.content_submissions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access" ON public.activity_logs FOR ALL TO authenticated USING (true);
