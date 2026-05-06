'use client';

import React, { useState } from 'react';
import { supabase } from '@itsup/database';

interface TicketFormProps {
  onSuccess?: () => void;
}

export default function TicketForm({ onSuccess }: TicketFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError('You must be logged in to create a ticket.');
      setLoading(false);
      return;
    }

    const ticketData = {
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      budget: Number(formData.get('budget')),
      user_id: user.id,
    };

    const { error: insertError } = await supabase.from('tickets').insert([ticketData]);

    setLoading(false);
    if (!insertError) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      if (onSuccess) setTimeout(onSuccess, 1500);
    } else {
      setError(insertError.message);
    }
  }

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Create New Support Ticket</h2>
      
      {success && (
        <div className="animate-slide-up" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid var(--success)', fontSize: '0.9rem' }}>
          ✨ Ticket created successfully! Refreshing...
        </div>
      )}

      {error && (
        <div className="animate-shake" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid var(--danger)', fontSize: '0.9rem' }}>
          🚫 {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Problem Title</label>
          <input name="title" required placeholder="e.g. My Laptop won't start" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Category</label>
            <select name="category" required style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }}>
              <option value="HARDWARE">Hardware Repair</option>
              <option value="SOFTWARE">Software Install</option>
              <option value="NETWORK">Networking</option>
              <option value="REMOTE">Remote Troubleshooting</option>
              <option value="CONSULTATION">Consultation</option>
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Budget (UGX)</label>
            <input name="budget" type="number" required placeholder="200,000" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Description</label>
          <textarea name="description" required rows={4} placeholder="Describe the issue in detail..." style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white', resize: 'none' }} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
          {loading ? 'Creating...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}
