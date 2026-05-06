import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ 
      padding: '5rem 0', 
      background: 'var(--bg)', 
      borderTop: '1px solid var(--border)',
      color: 'var(--text-muted)'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem', marginBottom: '4rem' }}>
          <div>
            <h3 style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              IT<span style={{ color: 'var(--primary)' }}>Sup</span>
            </h3>
            <p style={{ maxWidth: '300px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              The premium marketplace for expert IT support, secured by escrow payments. Trusted by businesses worldwide.
            </p>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link href="/#services">Services</Link></li>
              <li><Link href="/#marketplace">Marketplace</Link></li>
              <li><Link href="/signup">Join as Officer</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'var(--text)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div style={{ pt: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
          <p>© 2024 ITSup. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Twitter</span>
            <span>LinkedIn</span>
            <span>GitHub</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
