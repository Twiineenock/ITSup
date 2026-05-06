'use client';

import React, { useState } from 'react';
import { supabase } from '@itsup/database';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Fetch role for redirection
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      // Verify role match
      if (profile.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`Account found, but it is not registered as a ${role === 'USER' ? 'Customer' : role === 'OFFICER' ? 'IT Officer' : 'Administrator'}.`);
      }

      // Redirect based on role
      if (profile.role === 'ADMIN') window.location.href = '/admin';
      else if (profile.role === 'OFFICER') window.location.href = '/officer';
      else window.location.href = '/portal';

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-muted)' }}>Login to access your ITSup dashboard</p>
          </div>

          {error && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid var(--danger)', 
              borderRadius: '0.5rem', 
              color: 'var(--danger)', 
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '0.5rem', 
                  color: 'white',
                  outline: 'none'
                }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Login as</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  background: 'var(--surface)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '0.5rem', 
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="USER">Customer</option>
                <option value="OFFICER">IT Officer</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ 
                    width: '100%', 
                    padding: '0.85rem', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '0.5rem', 
                    color: 'white',
                    outline: 'none'
                  }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ padding: '1rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link href="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link>
          </div>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            <p>Admin Login: admin@itsup.com / ITSupAdmin2024</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
