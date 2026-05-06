-- Seed Data for ITSup
-- Run this in Supabase SQL Editor

-- 1. Create Mock Admin
INSERT INTO profiles (id, full_name, phone_number, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'ITSup Admin', '256000000000', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Mock Officer
INSERT INTO profiles (id, full_name, phone_number, role)
VALUES ('e2c4d5a6-7890-1234-5678-abcdef012345', 'Enock IT Expert', '256700123456', 'OFFICER')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Mock User
INSERT INTO profiles (id, full_name, phone_number, role)
VALUES ('d9b3a3c2-1234-4321-abcd-1234567890ab', 'Test Customer', '256700987654', 'USER')
ON CONFLICT (id) DO NOTHING;
