-- ITSup Database Schema
-- Inspired by TwiinePay Trust Flow

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('USER', 'OFFICER', 'ADMIN')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tickets Table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  officer_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('HARDWARE', 'SOFTWARE', 'NETWORK', 'REMOTE', 'CONSULTATION')),
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('PENDING_PAYMENT', 'OPEN', 'FUNDED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'COMPLETED', 'DISPUTED')),
  budget NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Escrow Transactions
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'HELD' CHECK (status IN ('HELD', 'RELEASED', 'REFUNDED', 'DISPUTED')),
  payment_reference TEXT, -- Stripe/Flutterwave ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Messages/Chat
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. System Reviews Table
CREATE TABLE system_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE escrow_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE system_reviews;

-- 7. RLS Policies (Row Level Security)
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tickets Policies
CREATE POLICY "Users can see own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id OR auth.uid() = officer_id);
CREATE POLICY "Admins can see all tickets" ON tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Users can insert own tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON tickets FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = officer_id);

-- Escrow Policies
CREATE POLICY "Users can see own transactions" ON escrow_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM tickets WHERE id = ticket_id AND (user_id = auth.uid() OR officer_id = auth.uid()))
);
CREATE POLICY "Admins can see all transactions" ON escrow_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- System Reviews Policies
CREATE POLICY "Anyone can view system reviews" ON system_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert system reviews" ON system_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
