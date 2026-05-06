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

  async function acceptOffer(ticketId: string, officerId: string, finalPrice: number) {
    const { error } = await supabase
      .from('tickets')
      .update({ 
        officer_id: officerId, 
        budget: finalPrice,
        status: 'FUNDED' 
      })
      .eq('id', ticketId);
    
    if (!error) {
      // Delete other offers for this ticket
      await supabase.from('ticket_offers').delete().eq('ticket_id', ticketId);
      fetchTickets();
    }
  }

  async function approveAndRelease(ticketId: string, officerId: string, amount: number) {
    // 1. Mark ticket as COMPLETED
    const { error: ticketError } = await supabase
      .from('tickets')
      .update({ status: 'COMPLETED' })
      .eq('id', ticketId);

    if (ticketError) return alert(ticketError.message);

    // 2. Record the Payout Settlement (The "Proof of Payment")
    const { error: payoutError } = await supabase
      .from('payouts')
      .insert([{
        ticket_id: ticketId,
        officer_id: officerId,
        amount: amount
      }]);

    if (payoutError) console.error("Payout recording error:", payoutError.message);

    fetchTickets();
    
    // Show a premium success message
    alert("💸 Payment Released Successfully! The funds have been moved to the Officer's account.");
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>My Support Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Securely manage your technical requests and payments.</p>
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
              <div key={ticket.id} className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className={`badge badge-${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                  <span style={{ fontWeight: 800 }}>{Number(ticket.budget).toLocaleString()} UGX</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{ticket.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{ticket.description}</p>
                
                {ticket.status === 'OPEN' && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      Interested Officers ({ticket.offers?.length || 0})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {ticket.offers?.map((offer: any) => (
                        <div key={offer.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img 
                              src={offer.officer?.avatar_url || 'https://ui-avatars.com/api/?name=' + offer.officer?.full_name} 
                              alt="" 
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{offer.officer?.full_name}</p>
                              <a href={`https://wa.me/${offer.officer?.phone_number}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                                Chat with Officer
                              </a>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>{Number(offer.proposed_price).toLocaleString()} UGX</p>
                          </div>
                          <button 
                            onClick={() => acceptOffer(ticket.id, offer.officer_id, offer.proposed_price)}
                            className="btn-primary" 
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                          >
                            Accept & Fund
                          </button>
                        </div>
                      ))}
                      {(!ticket.offers || ticket.offers.length === 0) && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '1rem', paddingBottom: '1rem' }}>Waiting for offers...</p>
                      )}
                    </div>
                  </div>
                )}

                {ticket.officer && (
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img 
                      src={ticket.officer?.avatar_url || 'https://ui-avatars.com/api/?name=' + ticket.officer?.full_name} 
                      alt="" 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Officer</p>
                      <p style={{ fontWeight: 600 }}>{ticket.officer.full_name}</p>
                      <a href={`https://wa.me/${ticket.officer.phone_number}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>Chat on WhatsApp</a>
                    </div>
                  </div>
                )}

                {ticket.status === 'RESOLVED' && (
                  <div style={{ 
                    marginTop: '1.5rem', 
                    padding: '1.5rem', 
                    background: 'rgba(16, 185, 129, 0.05)', 
                    borderRadius: '0.75rem', 
                    border: '1px solid var(--success)',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>
                      🌟 Officer marked work as DONE!
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        onClick={() => approveAndRelease(ticket.id, ticket.officer_id, ticket.budget)} 
                        className="btn-primary" 
                        style={{ flex: 2, background: 'var(--success)', border: 'none', padding: '0.8rem', fontWeight: 700 }}
                      >
                        Approve & Release Funds
                      </button>
                      <button 
                        onClick={() => supabase.from('tickets').update({ status: 'DISPUTED' }).eq('id', ticket.id).then(() => fetchTickets())}
                        style={{ flex: 1, border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '0.5rem', fontSize: '0.8rem', background: 'transparent' }}
                      >
                        Dispute
                      </button>
                    </div>
                  </div>
                )}
                
                {ticket.status === 'COMPLETED' && (
                  <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                    <p style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Work Accepted</p>
                  </div>
                )}
                
                {ticket.status === 'FUNDED' && (
                  <p style={{ color: 'var(--warning)', fontSize: '0.8rem', textAlign: 'center' }}>Searching for an Officer...</p>
                )}

                {ticket.status === 'ASSIGNED' && (
                  <p style={{ color: 'var(--primary)', fontSize: '0.8rem', textAlign: 'center' }}>Officer is working on this...</p>
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
