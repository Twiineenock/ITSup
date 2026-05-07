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
      budget: 0, // Set to 0 as it's no longer used
      user_id: user.id,
      status: 'PENDING_PAYMENT'
    };

    // 1. Create the ticket in PENDING_PAYMENT state
    const { data, error: insertError } = await supabase
      .from('tickets')
      .insert([ticketData])
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // 2. Trigger Flutterwave for 5000 UGX Listing Fee
    window.FlutterwaveCheckout({
      public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "FLWPUBK_TEST-efddd3bb2150d48b7cda2154514e8d2f-X",
      tx_ref: `TICKET-LISTING-${data.id}-${Date.now()}`,
      amount: 5000,
      currency: "UGX",
      payment_options: "mobilemoneyuganda, card",
      customer: {
        email: user.email || "",
        name: user.user_metadata?.full_name || "Customer",
      },
      customizations: {
        title: "ITSup Listing Fee",
        description: "Pay 5000 UGX to publish your support ticket.",
        logo: "https://itsup.app/logo.png",
      },
      callback: async (paymentData: any) => {
        console.log("Flutterwave Callback:", paymentData);
        if (paymentData.status === "successful" || paymentData.status === "completed") {
          // 3. Update status to OPEN on success
          const { error: updateError } = await supabase
            .from('tickets')
            .update({ status: 'OPEN' })
            .eq('id', data.id);

          if (!updateError) {
            console.log("Ticket activated successfully");
            setSuccess(true);
            // Wait a bit so the user sees the success message
            setTimeout(() => {
              window.location.href = '/portal';
            }, 1500);
          } else {
            console.error("Supabase Update Error:", updateError);
            setError(`Payment successful, but failed to activate ticket: ${updateError.message}`);
          }
        } else {
          setError("Payment was not successful. Status: " + paymentData.status);
        }
        setLoading(false);
      },
      onclose: () => {
        setLoading(false);
      }
    });
  }

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Create New Support Ticket</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        📢 <strong>Notice:</strong> A listing fee of <strong>5,000 UGX</strong> applies to all new tickets. This ensures only serious requests reach our expert IT Officers.
      </p>
      
      {success && (
        <div className="animate-slide-up" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid var(--success)', fontSize: '0.9rem' }}>
          ✨ Ticket published successfully! Redirecting...
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Category</label>
          <select name="category" required style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }}>
            <option value="HARDWARE">Hardware Repair</option>
            <option value="SOFTWARE">Software Install</option>
            <option value="NETWORK">Networking</option>
            <option value="REMOTE">Remote Troubleshooting</option>
            <option value="CONSULTATION">Consultation</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Description</label>
          <textarea name="description" required rows={4} placeholder="Describe the issue in detail..." style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white', resize: 'none' }} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
          {loading ? 'Processing...' : 'Pay 5,000 UGX & Publish Ticket'}
        </button>
      </form>
    </div>
  );
}
