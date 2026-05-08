-- Create audits table
CREATE TABLE audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  total_monthly_savings DECIMAL(10, 2) NOT NULL
);

-- Create leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  audit_id UUID REFERENCES audits(id),
  company_name TEXT
);

-- Row Level Security (RLS) policies
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert audits
CREATE POLICY "Enable insert for anonymous users" ON audits
  FOR INSERT WITH CHECK (true);

-- Allow anonymous users to view audits (needed for shareable URLs)
CREATE POLICY "Enable read access for all users" ON audits
  FOR SELECT USING (true);

-- Allow anonymous users to insert leads
CREATE POLICY "Enable insert for anonymous users" ON leads
  FOR INSERT WITH CHECK (true);
