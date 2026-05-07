'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@itsup/database';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OfficerDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [myActiveTickets, setMyActiveTickets] = useState<any[]>([]);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [myRating, setMyRating] = useState<number>(0);
  const [systemReview, setSystemReview] = useState('');
  const [systemRating, setSystemRating] = useState(5);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

  async function fetchInitialData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      const { data: ratingData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('officer_id', user.id);
      
      const ratings = ratingData?.map((r: any) => r.rating) || [];
      const top = ratings.length > 0 ? Math.max(...ratings) : 0;
      setMyRating(top);

      await Promise.all([
        fetchTickets(user.id),
        fetchMyOffers(user.id),
        fetchActiveTickets(user.id)
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
      .select(`
        *,
        customer:profiles!user_id(full_name, phone_number, avatar_url)
      `)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false });
    
    if (!error) setTickets(data);
    setLoading(false);
  }

  async function fetchActiveTickets(uid: string) {
    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:profiles!user_id(full_name, phone_number, avatar_url)
      `)
      .eq('officer_id', uid)
      .in('status', ['ASSIGNED', 'RESOLVED', 'COMPLETED'])
      .order('updated_at', { ascending: false });
    setMyActiveTickets(data || []);
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

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
      showToast("🚀 Interest expressed! The customer has been notified.");
      fetchInitialData();
    }
  }

  async function resolveTicket(e: React.FormEvent<HTMLFormElement>, ticketId: string) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message') as string;
    const file = (formData.get('image') as File);
    let resolved_image_url = null;

    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `resolutions/${ticketId}/${fileName}`;
      await supabase.storage.from('ticket-images').upload(filePath, file);
      const { data: { publicUrl } } = supabase.storage.from('ticket-images').getPublicUrl(filePath);
      resolved_image_url = publicUrl;
    }

    const { error } = await supabase
      .from('tickets')
      .update({ 
        status: 'RESOLVED',
        resolved_message: message,
        resolved_image_url: resolved_image_url
      })
      .eq('id', ticketId);

    if (!error) {
      showToast("Ticket marked as resolved! Awaiting customer verification.");
      fetchInitialData();
    }
  }

  async function requestRemoteAccess(ticketId: string) {
    const { error } = await supabase
      .from('tickets')
      .update({ remote_access_requested: true })
      .eq('id', ticketId);
    
    if (!error) {
      showToast("Remote access request sent to the customer.");
      fetchInitialData();
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--primary)', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 2000 }} className="animate-slide-up">
          {toast}
        </div>
      )}

      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Officer Command Center</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage your active work and browse new opportunities.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your Reputation</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '1.5rem', color: '#FBBF24', fontWeight: 800 }}>★ {myRating.toFixed(1)}</span>
              {myRating >= 3 && (
                <span style={{ background: 'var(--success)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 800 }}>VERIFIED PRO</span>
              )}
            </div>
          </div>
        </header>
        
        {!isReviewSubmitted && (
          <section className="glass-card" style={{ padding: '3rem', marginBottom: '4rem', background: 'rgba(34, 197, 94, 0.03)', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>How's Your Officer Experience?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Share your feedback about the ITSup platform. Your review will appear on our homepage!</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setSystemRating(star)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: star <= systemRating ? '#FBBF24' : 'rgba(255,255,255,0.1)' }}
                >
                  ★
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <textarea 
                placeholder="Write a testimonial about being an officer on ITSup..." 
                value={systemReview}
                onChange={(e) => setSystemReview(e.target.value)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.5rem', color: 'white', minHeight: '80px', resize: 'none' }}
              />
              <button 
                onClick={submitSystemReview}
                className="btn-primary" 
                style={{ padding: '0 2rem', background: '#22c55e', border: 'none' }}
                disabled={!systemReview.trim()}
              >
                Submit Testimonial
              </button>
            </div>
          </section>
        )}

        {loading ? (
          <p>Connecting to marketplace...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
            
            {/* My Active Work Section */}
            <section>
              <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', color: 'var(--primary)' }}>
                <span style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }}></span>
                My Active Tickets ({myActiveTickets.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                {myActiveTickets.map(ticket => (
                  <div key={ticket.id} className="glass-card" style={{ border: '1px solid var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <span className={`badge badge-${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {ticket.id.slice(0,8)}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <img src={ticket.customer?.avatar_url || 'https://ui-avatars.com/api/?name=' + ticket.customer?.full_name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600 }}>{ticket.customer?.full_name}</p>
                        <a href={`https://wa.me/${ticket.customer?.phone_number}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#25D366', textDecoration: 'none', fontWeight: 700 }}>Chat on WhatsApp</a>
                      </div>
                    </div>

                    <h4 style={{ marginBottom: '0.5rem' }}>{ticket.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{ticket.description}</p>

                    {ticket.status === 'ASSIGNED' && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {/* Remote Access Section */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🖥️ Remote Support
                          </p>
                          
                          {!ticket.remote_access_requested && (
                            <button 
                              onClick={() => requestRemoteAccess(ticket.id)}
                              style={{ width: '100%', padding: '0.5rem', background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '0.4rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Request AnyDesk Access
                            </button>
                          )}

                          {ticket.remote_access_requested && !ticket.remote_access_id && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--warning)', textAlign: 'center' }}>Waiting for customer to provide ID...</p>
                          )}

                          {ticket.remote_access_id && (
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '0.4rem', border: '1px solid var(--primary)' }}>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>AnyDesk Credentials:</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '1px' }}>{ticket.remote_access_id}</span>
                                <span style={{ fontSize: '0.6rem', background: 'var(--primary)', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>ID</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--success)' }}>{ticket.remote_access_password || 'No Password'}</span>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>PASS</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <form onSubmit={(e) => resolveTicket(e, ticket.id)}>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Resolution Note</label>
                          <textarea name="message" required placeholder="Describe what you fixed..." style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.4rem', color: 'white', fontSize: '0.9rem', marginBottom: '1rem', resize: 'none' }} />
                          
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Proof of Work (Optional Image)</label>
                          <input type="file" name="image" accept="image/*" capture="environment" style={{ fontSize: '0.8rem', marginBottom: '1rem', color: 'var(--text-muted)' }} />
                          
                          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Mark as Resolved</button>
                        </form>
                      </div>
                    )}

                    {ticket.status === 'RESOLVED' && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '0.4rem', textAlign: 'center', color: 'var(--success)', fontWeight: 700 }}>
                        Awaiting Customer Verification
                      </div>
                    )}

                    {ticket.status === 'COMPLETED' && (
                      <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.4rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 700 }}>
                        Completed & Verified 🏁
                      </div>
                    )}
                  </div>
                ))}
                {myActiveTickets.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '3rem', border: '1px dashed var(--border)', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No active tickets. Hire requests from customers will appear here!
                  </div>
                )}
              </div>
            </section>

            {/* Marketplace Section */}
            <section>
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
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6, height: '4.8rem', overflow: 'hidden' }}>{ticket.description}</p>
                      
                      {ticket.image_url && (
                        <div style={{ marginBottom: '1.5rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={ticket.image_url} alt="Issue evidence" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        </div>
                      )}
                      
                      {hasOffered ? (
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 700, border: '1px solid var(--primary)' }}>
                          ✅ Interest Expressed
                        </div>
                      ) : (
                        <button 
                          onClick={() => expressInterest(ticket.id, 0)} 
                          className="btn-primary" 
                          style={{ width: '100%', padding: '0.8rem' }}
                        >
                          Express Interest
                        </button>
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
            </section>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
