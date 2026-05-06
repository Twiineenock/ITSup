'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@itsup/database';
import TicketForm from '@/components/TicketForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UserPortal() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function fetchTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { data, error } = await supabase
      .from('tickets')
      .select('*, officer:profiles!officer_id(full_name, phone_number, avatar_url), offers:ticket_offers(*, officer:profiles(full_name, phone_number, avatar_url))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error) setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>My Support Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage your technical requests and connect with expert officers.</p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="btn-primary" 
            style={{ padding: '0.75rem 2rem' }}
          >
            + New Support Ticket
          </button>
        </header>

        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
              <button 
                onClick={() => setShowForm(false)}
                style={{ position: 'absolute', top: '-1rem', right: '-1rem', width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', zIndex: 1001 }}
              >
                ✕
              </button>
              <TicketForm onSuccess={() => {
                setShowForm(false);
                fetchTickets();
              }} />
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading your tickets...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {tickets.map(ticket => (
              <div key={ticket.id} className="glass-card" style={{ border: ticket.status === 'PENDING_PAYMENT' ? '1px dashed var(--warning)' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className={`badge badge-${ticket.status.toLowerCase()}`}>{ticket.status.replace('_', ' ')}</span>
                  <span style={{ fontWeight: 800 }}>{Number(ticket.budget).toLocaleString()} UGX</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{ticket.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', height: '3rem', overflow: 'hidden' }}>{ticket.description}</p>
                
                {ticket.status === 'OPEN' && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      Interested Officers ({ticket.offers?.length || 0})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {ticket.offers?.map((offer: any) => (
                        <div key={offer.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img 
                              src={offer.officer?.avatar_url || 'https://ui-avatars.com/api/?name=' + offer.officer?.full_name} 
                              alt="" 
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{offer.officer?.full_name}</p>
                              <a 
                                href={`https://wa.me/${offer.officer?.phone_number}?text=Hi, I am interested in your offer for my ticket: ${ticket.title}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '0.4rem',
                                  padding: '0.4rem 0.8rem',
                                  background: '#25D366',
                                  color: 'white',
                                  borderRadius: '0.4rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  marginTop: '0.5rem',
                                  textDecoration: 'none'
                                }}
                              >
                                Chat on WhatsApp
                              </a>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>{Number(offer.proposed_price).toLocaleString()} UGX</p>
                          </div>
                        </div>
                      ))}
                      {(!ticket.offers || ticket.offers.length === 0) && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '1rem', paddingBottom: '1rem' }}>Waiting for officers to respond...</p>
                      )}
                    </div>
                  </div>
                )}

                {ticket.officer && (
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                      src={ticket.officer?.avatar_url || 'https://ui-avatars.com/api/?name=' + ticket.officer?.full_name} 
                      alt="" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Officer</p>
                      <p style={{ fontWeight: 600 }}>{ticket.officer.full_name}</p>
                      <a href={`https://wa.me/${ticket.officer.phone_number}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>WhatsApp Chat</a>
                    </div>
                  </div>
                )}
                
                {ticket.status === 'PENDING_PAYMENT' && (
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem' }}>
                    <p style={{ color: 'var(--warning)', fontSize: '0.85rem', fontWeight: 600 }}>⚠️ Awaiting Listing Fee</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
