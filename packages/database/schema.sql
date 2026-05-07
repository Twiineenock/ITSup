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

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE escrow_transactions;
