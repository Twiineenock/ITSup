'use client';

import React, { useState } from 'react';
import { supabase } from '@itsup/database';
import Link from 'next/link';

interface UserWidgetProps {
  user: any;
  profile: any;
}

export default function UserWidget({ user, profile }: UserWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const getPortalLink = () => {
    if (!profile) return '/login';
    if (profile.role === 'ADMIN') return '/admin';
    if (profile.role === 'OFFICER') return '/officer';
    return '/portal';
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem',
          borderRadius: '2rem',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--surface)',
          border: '1px solid var(--border)'
        }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
            </div>
          )}
        </div>
        <div className="profile-name">
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.full_name || 'User'}
          </p>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem', color: 'var(--text-muted)' }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.75rem)',
            right: 0,
            width: '200px',
            background: '#0f172a',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
            zIndex: 101,
            overflow: 'hidden',
            padding: '0.5rem'
          }}>
            <Link
              href={getPortalLink()}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                color: 'var(--text)',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
              className="nav-item-hover"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                color: 'var(--danger)',
                fontSize: '0.9rem',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              className="nav-item-hover"
            >
              Logout
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .nav-item-hover:hover {
          background: rgba(255,255,255,0.05);
        }
        @media (max-width: 768px) {
          .profile-name {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
