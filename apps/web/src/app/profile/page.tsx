'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@itsup/database';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUser(user);
      setEmail(user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setPhoneNumber(data.phone_number || '');
        setAvatarUrl(data.avatar_url || '');
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          avatar_url: avatarUrl,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const updates: any = {};
      if (email !== user.email) updates.email = email;
      if (password) updates.password = password;

      if (Object.keys(updates).length === 0) {
        setMessage({ type: 'info', text: 'No changes to credentials.' });
        setUpdating(false);
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Credentials updated! Check email if changed.' });
      setPassword(''); // Clear password field
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      
      <div className="container" style={{ padding: '4rem 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-1px' }}>
            Profile <span style={{ color: 'var(--primary)' }}>Settings</span>
          </h2>

          {message.text && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              marginBottom: '2rem', 
              background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
              color: message.type === 'success' ? '#4ade80' : '#f87171'
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {/* Personal Information */}
            <div className="glass-card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--primary)' }}>01.</span> Personal Information
              </h3>
              
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    background: 'var(--surface)', 
                    border: '2px solid var(--primary)',
                    flexShrink: 0
                  }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                        {fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Avatar Image URL</label>
                    <input 
                      type="text" 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem 1rem', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '0.5rem',
                        color: 'white'
                      }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem 1rem', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '0.5rem',
                        color: 'white'
                      }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone Number (Contact)</label>
                    <input 
                      type="text" 
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem 1rem', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '0.5rem',
                        color: 'white'
                      }} 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={updating}
                  className="btn-primary" 
                  style={{ padding: '0.8rem 2rem' }}
                >
                  {updating ? 'Updating...' : 'Save Personal Info'}
                </button>
              </form>
            </div>

            {/* Account Credentials */}
            <div className="glass-card" style={{ padding: '2.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--primary)' }}>02.</span> Account Credentials
              </h3>
              
              <form onSubmit={handleUpdateCredentials}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem 1rem', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '0.5rem',
                        color: 'white'
                      }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>New Password (Optional)</label>
                    <input 
                      type="password" 
                      placeholder="Leave blank to keep current"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem 1rem', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '0.5rem',
                        color: 'white'
                      }} 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={updating}
                  className="btn-primary" 
                  style={{ padding: '0.8rem 2rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                >
                  {updating ? 'Updating...' : 'Update Credentials'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
