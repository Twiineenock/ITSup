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
  const [toast, setToast] = useState<string | null>(null);

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

  const hireOfficer = async (ticketId: string, officerId: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ 
        status: 'ASSIGNED',
        officer_id: officerId 
      })
      .eq('id', ticketId);

    if (!error) {
      showToast("Officer hired successfully! They will begin work shortly.");
      fetchTickets();
    }
  };

  const verifyTicket = async (ticketId: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ status: 'COMPLETED' })
      .eq('id', ticketId);

    if (!error) {
      showToast("Ticket verified and completed! Thank you.");
      fetchTickets();
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 2000 }} className="animate-slide-up">
          {toast}
        </div>
      )}
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
                  <span className={`badge badge-${ticket.status.toLowerCase()}`}>
                    {ticket.status === 'PENDING_PAYMENT' ? 'UNPUBLISHED DRAFT' : ticket.status.replace('_', ' ')}
                  </span>
                  {ticket.status === 'OPEN' && <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>✅ PUBLISHED</span>}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{ticket.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', height: '3rem', overflow: 'hidden' }}>{ticket.description}</p>
                
                {ticket.image_url && (
                  <div style={{ marginBottom: '1.5rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={ticket.image_url} alt="Issue" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                  </div>
                )}
                
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
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                                  Chat
                                </a>
                                <button 
                                  onClick={() => hireOfficer(ticket.id, offer.officer_id)}
                                  className="btn-primary"
                                  style={{ 
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.75rem',
                                    marginTop: '0.5rem'
                                  }}
                                >
                                  Hire
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!ticket.offers || ticket.offers.length === 0) && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '1rem', paddingBottom: '1rem' }}>Waiting for officers to respond...</p>
                      )}
                    </div>
                  </div>
                )}

                {(ticket.status === 'ASSIGNED' || ticket.status === 'RESOLVED' || ticket.status === 'COMPLETED') && ticket.officer && (
                  <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(99, 102, 241, 0.2)', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <img 
                        src={ticket.officer?.avatar_url || 'https://ui-avatars.com/api/?name=' + ticket.officer?.full_name} 
                        alt="" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hired Officer</p>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ticket.officer.full_name}</p>
                      </div>
                      <a href={`https://wa.me/${ticket.officer.phone_number}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 0.8rem', background: '#25D366', color: 'white', borderRadius: '0.4rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}>WhatsApp</a>
                    </div>

                    {ticket.status === 'RESOLVED' && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>✅ Work Completed</p>
                        {ticket.resolved_message && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>"{ticket.resolved_message}"</p>}
                        {ticket.resolved_image_url && (
                          <div style={{ marginBottom: '1rem', borderRadius: '0.4rem', overflow: 'hidden' }}>
                            <img src={ticket.resolved_image_url} alt="Resolution" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                          </div>
                        )}
                        <button 
                          onClick={() => verifyTicket(ticket.id)}
                          className="btn-primary" 
                          style={{ width: '100%', padding: '0.6rem' }}
                        >
                          Verify & Mark as Complete
                        </button>
                      </div>
                    )}

                    {ticket.status === 'COMPLETED' && (
                      <p style={{ color: 'var(--success)', fontWeight: 800, textAlign: 'center', fontSize: '0.9rem' }}>🏁 Job Successfully Completed</p>
                    )}
                  </div>
                )}
                
                {ticket.status === 'PENDING_PAYMENT' && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <p style={{ color: 'var(--warning)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Awaiting 5,000 UGX Listing Fee</p>
                    <button 
                      onClick={() => {
                        // Re-trigger payment for this specific ticket
                        const user = supabase.auth.getUser().then(({data: {user}}) => {
                          if (!user) return;
                          window.FlutterwaveCheckout({
                            public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "FLWPUBK_TEST-efddd3bb2150d48b7cda2154514e8d2f-X",
                            tx_ref: `TICKET-RETRY-${ticket.id}-${Date.now()}`,
                            amount: 5000,
                            currency: "UGX",
                            payment_options: "mobilemoneyuganda, card",
                            customer: {
                              email: user.email || "",
                              name: user.user_metadata?.full_name || "Customer",
                            },
                            callback: async (paymentData: any) => {
                              if (paymentData.status === "successful" || paymentData.status === "completed") {
                                await supabase.from('tickets').update({ status: 'OPEN' }).eq('id', ticket.id);
                                window.location.reload();
                              }
                            }
                          });
                        });
                      }}
                      className="btn-primary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', width: '100%' }}
                    >
                      Pay & Publish Now
                    </button>
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
