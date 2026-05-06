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
      .or(`status.eq.OPEN,status.eq.FUNDED,officer_id.eq.${uid}`)
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
    
    if (!error) fetchInitialData();
  }

  async function resolveTicket(id: string) {
    if (!user) return;

    const { error } = await supabase
      .from('tickets')
      .update({ status: 'RESOLVED' })
      .eq('id', id);
    
    if (!error) fetchTickets(user.id);
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <header style={{ marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Officer Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Find opportunities, claim tickets, and manage your active tasks.</p>
        </header>

        {loading ? (
          <p>Connecting to secure network...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
            {/* Marketplace */}
            <div>
              <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
                <span style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></span>
                Ticket Marketplace
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {tickets.filter(t => (t.status === 'OPEN' || t.status === 'FUNDED') && !t.officer_id).map(ticket => {
                  const hasOffered = myOffers.some(o => o.ticket_id === ticket.id);
                  return (
                    <div key={ticket.id} className="glass-card animate-fade-in">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <span className={`badge badge-${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{Number(ticket.budget).toLocaleString()} UGX</span>
                      </div>

                      {/* Customer Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                        <img 
                          src={ticket.customer?.avatar_url || 'https://ui-avatars.com/api/?name=' + ticket.customer?.full_name} 
                          alt="" 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ticket.customer?.full_name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.customer?.phone_number}</p>
                        </div>
                        <a href={`https://wa.me/${ticket.customer?.phone_number}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 0.8rem', background: '#25D366', color: 'white', borderRadius: '0.4rem', fontSize: '0.7rem', textDecoration: 'none', fontWeight: 600 }}>
                          WhatsApp
                        </a>
                      </div>

                      <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{ticket.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{ticket.description}</p>
                      
                      {hasOffered ? (
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>
                          ⏱️ Interest Expressed
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <input 
                            id={`price-${ticket.id}`}
                            type="number" 
                            defaultValue={ticket.budget} 
                            style={{ width: '120px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'white' }}
                          />
                          <button 
                            onClick={() => {
                              const price = (document.getElementById(`price-${ticket.id}`) as HTMLInputElement).value;
                              expressInterest(ticket.id, Number(price));
                            }} 
                            className="btn-primary" 
                            style={{ flex: 1, padding: '0.6rem' }}
                          >
                            Propose Price
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {tickets.filter(t => t.status === 'FUNDED' && !t.officer_id).length === 0 && (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                    <p style={{ color: 'var(--text-muted)' }}>The marketplace is currently empty. Check back soon for new gigs!</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Active Tasks */}
            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '4rem' }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>My Active Assignments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {tickets.filter(t => t.officer_id === user?.id).map(ticket => (
                  <div key={ticket.id} className="glass-card animate-slide-up" style={{ borderLeft: `4px solid ${ticket.status === 'RESOLVED' ? 'var(--success)' : 'var(--primary)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span className={`badge badge-${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ID: {ticket.id.slice(0,8)}</span>
                    </div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{ticket.title}</h4>
                    
                    {/* Customer Info (For Active Job) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <img 
                        src={ticket.customer?.avatar_url || 'https://ui-avatars.com/api/?name=' + ticket.customer?.full_name} 
                        alt="" 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{ticket.customer?.full_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.customer?.phone_number}</p>
                      </div>
                      <a href={`https://wa.me/${ticket.customer?.phone_number}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 0.8rem', background: '#25D366', color: 'white', borderRadius: '0.4rem', fontSize: '0.7rem', textDecoration: 'none', fontWeight: 600 }}>
                        WhatsApp
                      </a>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Budget: {Number(ticket.budget).toLocaleString()} UGX</p>
                    
                    {ticket.status === 'ASSIGNED' && (
                      <button 
                        onClick={() => resolveTicket(ticket.id)} 
                        className="btn-primary" 
                        style={{ 
                          width: '100%', 
                          background: 'linear-gradient(to right, var(--primary), #818cf8)', 
                          border: 'none',
                          padding: '1rem',
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                        }}
                      >
                        ✅ Mark Task as Completed
                      </button>
                    )}
                    {ticket.status === 'RESOLVED' && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>✅ Awaiting Client Approval</p>
                      </div>
                    )}
                    {ticket.status === 'COMPLETED' && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 700 }}>💰 Payment Released</p>
                      </div>
                    )}
                  </div>
                ))}
                {tickets.filter(t => t.officer_id === user?.id).length === 0 && (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't claimed any tickets yet. Claim one from the marketplace!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
