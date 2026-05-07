'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@itsup/database';
import Link from 'next/link';
import UserWidget from './UserWidget';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function getAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    }
    getAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getHomeLink = () => {
    if (!profile) return '/';
    if (profile.role === 'ADMIN') return '/admin';
    if (profile.role === 'OFFICER') return '/officer';
    return '/portal';
  };

  return (
    <nav style={{ 
      padding: '1.5rem 0', 
      borderBottom: '1px solid var(--border)', 
      background: 'rgba(2, 6, 23, 0.8)', 
      backdropFilter: 'blur(12px)',
      position: 'sticky', 
      top: 0, 
      zIndex: 100 
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-1.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>S</div>
          <span>IT<span style={{ color: 'var(--primary)' }}>Sup</span></span>
        </Link>
        
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <Link href="/#services" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Services</Link>
          <Link href="/#how-it-works" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>How it Works</Link>
          
          {user ? (
            <UserWidget user={user} profile={profile} />
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href="/login" style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500 }}>Sign In</Link>
              <Link href="/signup" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                Join ITSup
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
