'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@itsup/database';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OfficerDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchInitialData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      await Promise.all([
        fetchTickets(user.id),
        fetchMyOffers(user.id)
      ]);
    } else {
      setLoading(false);
    }
  }

  async function fetchMyOffers(uid: string) {
    const { data } = await supabase
      .from('ticket_offers')
      .select('ticket_id')
      .eq('officer_id', uid);
    setMyOffers(data || []);
  }

  async function fetchTickets(uid: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, customer:profiles!user_id(full_name, phone_number, avatar_url)')
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });
    
    if (!error) setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function expressInterest(ticketId: string, suggestedPrice: number) {
    if (!user) return;
    
    const { error } = await supabase
      .from('ticket_offers')
      .insert([{
        ticket_id: ticketId,
        officer_id: user.id,
        proposed_price: suggestedPrice
      }]);
    
    if (!error) {
      alert("🚀 Interest expressed! The customer has been notified and may contact you on WhatsApp.");
      fetchInitialData();
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <header style={{ marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Officer Opportunity Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Find active support tickets, propose your services, and connect via WhatsApp.</p>
        </header>

        {loading ? (
          <p>Connecting to marketplace...</p>
        ) : (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></span>
              Live Ticket Marketplace
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
              {tickets.map(ticket => {
                const hasOffered = myOffers.some(o => o.ticket_id === ticket.id);
                return (
                  <div key={ticket.id} className="glass-card animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <span className="badge badge-open">LIVE TICKET</span>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Est. {Number(ticket.budget).toLocaleString()} UGX</span>
                    </div>

                    {/* Customer Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <img 
                        src={ticket.customer?.avatar_url || 'https://ui-avatars.com/api/?name=' + ticket.customer?.full_name} 
                        alt="" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{ticket.customer?.full_name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: Remote/On-site</p>
                      </div>
                      <a 
                        href={`https://wa.me/${ticket.customer?.phone_number}?text=Hi ${ticket.customer?.full_name}, I saw your ticket "${ticket.title}" on ITSup and I am interested in helping you.`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          padding: '0.5rem 1rem', 
                          background: '#25D366', 
                          color: 'white', 
                          borderRadius: '0.5rem', 
                          fontSize: '0.8rem', 
                          textDecoration: 'none', 
                          fontWeight: 700 
                        }}
                      >
                        WhatsApp
                      </a>
                    </div>

                    <h4 style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{ticket.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6, height: '4.8rem', overflow: 'hidden' }}>{ticket.description}</p>
                    
                    {hasOffered ? (
                      <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 700, border: '1px solid var(--primary)' }}>
                        ✅ Interest Expressed
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Your Quote (UGX)</label>
                          <input 
                            id={`price-${ticket.id}`}
                            type="number" 
                            defaultValue={ticket.budget} 
                            style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '0.4rem', color: 'white' }}
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const price = (document.getElementById(`price-${ticket.id}`) as HTMLInputElement).value;
                            expressInterest(ticket.id, Number(price));
                          }} 
                          className="btn-primary" 
                          style={{ flex: 1, padding: '0.8rem', marginTop: '1.25rem' }}
                        >
                          Express Interest
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {tickets.length === 0 && (
                <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', borderStyle: 'dashed' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>The marketplace is currently quiet. New tickets will appear here once customers pay the listing fee!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
