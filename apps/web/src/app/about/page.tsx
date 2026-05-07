'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container" style={{ flex: 1, padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: '5rem' }} className="animate-slide-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.5rem 1.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--primary)', borderRadius: '2rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Built for Trust
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '1.5rem' }}>About ITSup</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              ITSup is the premier technical support marketplace in Uganda, designed to bridge the gap between businesses and expert IT professionals with a secure, escrow-backed workflow.
            </p>
          </header>

          <section style={{ marginBottom: '5rem' }}>
            <div className="glass-card" style={{ padding: '3rem' }}>
              <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Our Mission</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                We believe that finding quality IT support shouldn't be a gamble. Our platform ensures that every customer request is handled by a verified professional, and every IT officer is compensated fairly for their expertise.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
                <div>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Secure Payments</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Integrated with Flutterwave to ensure your funds are protected until the job is verified.</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Expert Officers</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>A community of vetted IT professionals ready to handle hardware, software, and networking needs.</p>
                </div>
              </div>
            </div>
          </section>

          <section style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '3rem', fontSize: '2rem' }}>Get in Touch</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <a href="https://wa.me/256771250497" target="_blank" rel="noopener noreferrer" className="glass-card" style={{ textDecoration: 'none', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>💬</div>
                <p style={{ fontWeight: 700 }}>WhatsApp</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+256 771 250497</p>
              </a>
              
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="glass-card" style={{ textDecoration: 'none', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>🔗</div>
                <p style={{ fontWeight: 700 }}>LinkedIn</p>
              </a>

              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="glass-card" style={{ textDecoration: 'none', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>𝕏</div>
                <p style={{ fontWeight: 700 }}>X (Twitter)</p>
              </a>

              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="glass-card" style={{ textDecoration: 'none', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>📸</div>
                <p style={{ fontWeight: 700 }}>Instagram</p>
              </a>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
