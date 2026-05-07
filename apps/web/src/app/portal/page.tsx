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
  const [reviewingTicket, setReviewingTicket] = useState<any | null>(null);
  const [remoteTicket, setRemoteTicket] = useState<any | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [remoteId, setRemoteId] = useState('');
  const [remotePass, setRemotePass] = useState('');
  const [systemReview, setSystemReview] = useState('');
  const [systemRating, setSystemRating] = useState(5);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  async function fetchTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    // Fetch tickets with officer profiles and their highest rating from reviews
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        officer:profiles!officer_id(
          id, full_name, phone_number, avatar_url,
          reviews:reviews!officer_id(rating)
        ),
        offers:ticket_offers(
          *,
          officer:profiles(
            id, full_name, phone_number, avatar_url,
            reviews:reviews!officer_id(rating)
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error) {
      // Post-process to find the MAX rating for each officer
      const processed = data.map((ticket: any) => {
        const processOfficer = (off: any) => {
          if (!off) return null;
          const ratings = off.reviews?.map((r: any) => r.rating) || [];
          const topRating = ratings.length > 0 ? Math.max(...ratings) : 0;
          return { ...off, topRating };
        };

        return {
          ...ticket,
          officer: processOfficer(ticket.officer),
          offers: ticket.offers?.map((o: any) => ({ ...o, officer: processOfficer(o.officer) }))
        };
      });
      setTickets(processed);
    }
    setLoading(false);
  }

  const submitRemoteCredentials = async () => {
    if (!remoteTicket) return;

    const { error } = await supabase
      .from('tickets')
      .update({ 
        remote_access_id: remoteId,
        remote_access_password: remotePass
      })
      .eq('id', remoteTicket.id);

    if (!error) {
      showToast("AnyDesk details sent to your IT Officer!");
      setRemoteTicket(null);
      setRemoteId('');
      setRemotePass('');
      fetchTickets();
    }
  };

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

  const submitReview = async () => {
    if (!reviewingTicket) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Create the review
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert([{
        ticket_id: reviewingTicket.id,
        officer_id: reviewingTicket.officer_id,
        customer_id: user.id,
        rating: rating,
        comment: comment
      }]);

    if (reviewError) {
      showToast("Error saving review: " + reviewError.message);
      return;
    }

    // 2. Mark ticket as completed
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'COMPLETED' })
      .eq('id', reviewingTicket.id);

    if (!updateError) {
      showToast("Verification complete! Thank you for your feedback.");
      setReviewingTicket(null);
      setRating(5);
      setComment('');
      fetchTickets();
    }
  };

  const submitSystemReview = async () => {
    if (!systemReview.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('system_reviews')
      .insert([{
        user_id: user.id,
        content: systemReview,
        rating: systemRating
      }]);

    if (!error) {
      showToast("Thank you for your review! It is now live on our home page.");
      setIsReviewSubmitted(true);
      setShowReviewModal(false);
      setSystemReview('');
    } else {
      showToast("Error submitting review: " + error.message);
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

      {reviewingTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Rate Officer's Work</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>How would you rate the service provided by {reviewingTicket.officer?.full_name}?</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  style={{ background: 'none', border: 'none', fontSize: '2.5rem', cursor: 'pointer', color: star <= rating ? '#FBBF24' : 'rgba(255,255,255,0.1)', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea 
              placeholder="Leave a comment about the work (optional)..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.5rem', color: 'white', minHeight: '100px', marginBottom: '2rem', resize: 'none' }}
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setReviewingTicket(null)} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitReview} className="btn-primary" style={{ flex: 2, padding: '1rem' }}>Submit & Complete</button>
            </div>
          </div>
        </div>
      )}

      {remoteTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🖥️</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Remote Access Request</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Your technician {remoteTicket.officer?.full_name} has requested remote access via <strong>AnyDesk</strong> to troubleshoot your issue.
            </p>
            
            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>AnyDesk ID</label>
              <input 
                type="text" 
                placeholder="e.g. 123 456 789" 
                value={remoteId}
                onChange={(e) => setRemoteId(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white', marginBottom: '1rem' }}
              />
              
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Temporary Password (Optional)</label>
              <input 
                type="text" 
                placeholder="Password shown in AnyDesk" 
                value={remotePass}
                onChange={(e) => setRemotePass(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'white' }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--warning)', marginTop: '0.5rem' }}>⚠️ Never share your main computer password. Only share the AnyDesk code.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setRemoteTicket(null)} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Close</button>
              <button onClick={submitRemoteCredentials} className="btn-primary" style={{ flex: 2, padding: '1rem' }}>Share Access</button>
            </div>
          </div>
        </div>
      )}
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>My Support Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage your technical requests and connect with expert officers.</p>
          </div>
          <div>
            <button 
              onClick={() => setShowForm(true)} 
              className="btn-primary" 
              style={{ padding: '0.75rem 2rem' }}
            >
              Post New Ticket
            </button>
          </div>
        </header>

        {showReviewModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '3rem', position: 'relative', border: '1px solid var(--primary)' }}>
              <button 
                onClick={() => setShowReviewModal(false)}
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Share Your Experience</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>How are you enjoying ITSup? Your testimonial will appear on our homepage!</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setSystemRating(star)}
                    style={{ background: 'none', border: 'none', fontSize: '2.5rem', cursor: 'pointer', color: star <= systemRating ? '#FBBF24' : 'rgba(255,255,255,0.1)' }}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea 
                placeholder="Write your testimonial here..." 
                value={systemReview}
                onChange={(e) => setSystemReview(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '0.75rem', color: 'white', minHeight: '120px', resize: 'none', marginBottom: '2rem', fontSize: '1rem' }}
              />
              
              <button 
                onClick={submitSystemReview}
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem' }}
                disabled={!systemReview.trim()}
              >
                Submit Testimonial
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
              <button 
                onClick={() => setShowForm(false)}
                style={{ position: 'absolute', top: '-1rem', right: '-1rem', width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', zIndex: 1001 }}
              >
                ✕
              </button>
              <TicketForm 
                onSuccess={() => {
                  setShowForm(false);
                  fetchTickets();
                }} 
                onCancel={() => setShowForm(false)}
              />
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
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge badge-${ticket.status.toLowerCase()}`}>
                      {ticket.status === 'PENDING_PAYMENT' ? 'UNPUBLISHED DRAFT' : ticket.status.replace('_', ' ')}
                    </span>
                    {ticket.remote_access_requested && !ticket.remote_access_id && (
                      <button 
                        onClick={() => setRemoteTicket(ticket)}
                        style={{ background: 'var(--warning)', color: 'black', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', animation: 'pulse 2s infinite' }}
                      >
                        🖥️ ACTION REQUIRED
                      </button>
                    )}
                  </div>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{offer.officer?.full_name}</p>
                                {offer.officer?.topRating >= 3 && (
                                  <span style={{ fontSize: '0.65rem', background: 'var(--success)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 800 }}>VERIFIED</span>
                                )}
                              </div>
                              {offer.officer?.topRating > 0 && (
                                <p style={{ fontSize: '0.75rem', color: '#FBBF24' }}>★ {offer.officer.topRating.toFixed(1)} Rating</p>
                              )}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ticket.officer.full_name}</p>
                          {ticket.officer.topRating >= 3 && (
                            <span style={{ fontSize: '0.6rem', background: 'var(--success)', color: 'white', padding: '0.05rem 0.3rem', borderRadius: '1rem', fontWeight: 800 }}>VERIFIED</span>
                          )}
                        </div>
                        {ticket.officer.topRating > 0 && (
                          <p style={{ fontSize: '0.7rem', color: '#FBBF24' }}>★ {ticket.officer.topRating.toFixed(1)}</p>
                        )}
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
                          onClick={() => setReviewingTicket(ticket)}
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
                        supabase.auth.getUser().then(({data: {user}}: any) => {
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

        <div style={{ marginTop: '6rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Are you enjoying the ITSup experience?</p>
          <button onClick={() => setShowReviewModal(true)} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }}>
            {isReviewSubmitted ? '✓ Thank you for your feedback!' : 'Share Your Experience'}
          </button>
        </div>
      </div>
      <Footer />
    </main>
  );
}
