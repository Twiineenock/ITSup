'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@itsup/database';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    getAuth();
  }, []);

  const getDashboardLink = () => {
    if (!profile) return '/login';
    if (profile.role === 'ADMIN') return '/admin';
    if (profile.role === 'OFFICER') return '/officer';
    return '/portal';
  };

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{ 
        padding: '10rem 0 6rem 0', 
        background: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.2), transparent 50%), radial-gradient(circle at 100% 50%, rgba(165, 180, 252, 0.05), transparent 40%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="badge badge-open animate-fade-in" style={{ marginBottom: '2rem', display: 'inline-block' }}>
            ✨ {user ? `Welcome back, ${profile?.full_name || 'Partner'}` : 'Trusted by 500+ Businesses Worldwide'}
          </div>
          <h2 style={{ 
            fontSize: '5rem', 
            fontWeight: 900, 
            lineHeight: 1, 
            marginBottom: '2.5rem', 
            letterSpacing: '-3px',
            color: 'white'
          }}>
            {user ? 'Ready to solve your' : 'Expert IT Support,'}<br />
            <span style={{ background: 'linear-gradient(to right, #6366f1, #a5b4fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user ? 'next technical hurdle?' : 'Secured by Escrow.'}
            </span>
          </h2>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '1.5rem', 
            maxWidth: '800px', 
            margin: '0 auto 4rem auto',
            lineHeight: 1.5 
          }}>
            {user 
              ? 'Access your dedicated workspace, track your active tickets, and manage secure escrow payments all in one place.'
              : 'Connect with top-tier IT officers globally. Your payment is held securely in escrow and only released when you\'re 100% satisfied.'}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href={user ? getDashboardLink() : "/signup"} className="btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.1rem' }}>
              {user ? 'Go to My Dashboard' : 'Get Started Now'}
            </Link>
            {!user && (
              <Link href="#how-it-works" style={{ 
                padding: '1.25rem 3rem', 
                fontSize: '1.1rem', 
                borderRadius: '0.5rem', 
                border: '1px solid var(--border)',
                background: 'rgba(255, 255, 255, 0.05)',
                fontWeight: 600
              }}>
                Learn More
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: '8rem 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h3 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Our Premium Services</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Comprehensive IT solutions for every technical challenge.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
            {[
              { title: 'Hardware Repair', img: '/service-hardware.png', desc: 'Expert diagnosis and repair for servers, workstations, and mobile devices.' },
              { title: 'Software Support', img: '/service-software.png', desc: 'Seamless OS installation, bug fixes, and performance optimization.' },
              { title: 'Network Security', img: '/service-network.png', desc: 'Advanced firewall setup, VPN configuration, and threat mitigation.' }
            ].map((service, i) => (
              <div key={i} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={service.img} alt={service.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                <div style={{ padding: '2rem' }}>
                  <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{service.title}</h4>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" style={{ padding: '8rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h3 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>{user ? 'Your Streamlined Workflow' : 'The ITSup Trust Flow'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Ensuring quality work and payment security in every interaction.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', position: 'relative' }}>
            {[
              { step: '01', title: 'Post a Ticket', desc: 'Describe your IT issue and set your budget.' },
              { step: '02', title: 'Fund Escrow', desc: 'Payment is securely held by ITSup before work starts.' },
              { step: '03', title: 'Officer Resolves', desc: 'A certified professional solves your problem.' },
              { step: '04', title: 'Release Payment', desc: 'Confirm resolution and release funds to the officer.' }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'var(--surface-light)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 2rem auto',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  border: '1px solid var(--border)'
                }}>
                  {item.step}
                </div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Portals Section */}
      <section style={{ padding: '8rem 0', background: 'linear-gradient(to bottom, var(--surface), var(--bg))' }}>
        <div className="container">
          {user ? (
            <div className="glass-card" style={{ padding: '5rem', textAlign: 'center', border: '1px solid var(--primary)' }}>
              <h3 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Welcome Back to ITSup</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
                You are logged in as a <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{profile?.role}</span>. 
                Everything is ready for your next project.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                <Link href={getDashboardLink()} className="btn-primary" style={{ padding: '1.25rem 4rem' }}>Enter Dashboard</Link>
                <Link href="/portal" style={{ 
                  padding: '1.25rem 4rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  fontWeight: 600
                }}>
                  View My Tickets
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>For Customers</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                    Hire the best IT talent for your business or personal needs. No risk, high reward.
                  </p>
                  <Link href="/signup" className="btn-primary" style={{ padding: '1rem 3rem' }}>Register as Customer</Link>
                </div>
                
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', border: '1px solid var(--primary)' }}>
                  <h3 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>For IT Officers</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                    Earn money by solving technical issues globally. Access premium gigs daily.
                  </p>
                  <Link href="/signup" className="btn-primary" style={{ padding: '1rem 3rem', background: 'var(--bg)', border: '1px solid var(--primary)' }}>Apply as IT Officer</Link>
                </div>
              </div>
              
              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Already have an account? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</span>
                </Link>
                <span style={{ margin: '0 1rem', color: 'var(--border)' }}>|</span>
                <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Administrator Portal
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
