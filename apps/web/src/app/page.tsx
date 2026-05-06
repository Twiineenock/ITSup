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
        padding: '12rem 0 8rem 0', 
        background: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.25), transparent 50%), radial-gradient(circle at 100% 50%, rgba(165, 180, 252, 0.08), transparent 40%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="badge badge-open animate-fade-in" style={{ marginBottom: '2.5rem', display: 'inline-block' }}>
            ✨ {user ? `Welcome back, ${profile?.full_name || 'Partner'}` : 'The Future of IT Support is Here'}
          </div>
          <h2 style={{ 
            fontSize: '5.5rem', 
            fontWeight: 900, 
            lineHeight: 1.1, 
            marginBottom: '3rem', 
            letterSpacing: '-4px',
            color: 'white'
          }}>
            {user ? 'Ready to solve your' : 'Elite IT Talent,'}<br />
            <span style={{ background: 'linear-gradient(to right, #6366f1, #a5b4fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user ? 'next technical hurdle?' : 'Secured by Escrow.'}
            </span>
          </h2>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '1.4rem', 
            maxWidth: '850px', 
            margin: '0 auto 5rem auto',
            lineHeight: 1.6 
          }}>
            {user 
              ? 'Access your dedicated workspace, track active tickets, and manage secure escrow payments. All in one professional environment.'
              : 'Connect with certified IT professionals for hardware repair, software setup, and network security. Payments are held in secure escrow and only released when the job is perfectly done.'}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href={user ? "/portal" : "/signup"} className="btn-primary" style={{ padding: '1.25rem 3.5rem', fontSize: '1.1rem' }}>
              {user ? 'Post New Ticket' : 'Create a Ticket'}
            </Link>
            <Link href={user ? (profile?.role === 'OFFICER' ? '/officer' : '/signup') : "/signup"} style={{ 
              padding: '1.25rem 3.5rem', 
              fontSize: '1.1rem', 
              borderRadius: '0.5rem', 
              border: '1px solid var(--primary)',
              background: 'transparent',
              color: 'var(--primary)',
              fontWeight: 600
            }}>
              {user ? 'Browse Available Tickets' : 'Work & Earn Money'}
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: '10rem 0', background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h3 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-1.5px' }}>Our Specialized Services</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
              Comprehensive technology solutions delivered by top-tier experts across the globe.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            {[
              { title: 'Hardware Repair', icon: '🛠️', desc: 'Expert diagnosis and repair for servers, workstations, and enterprise mobile fleets.' },
              { title: 'Software Installation', icon: '💿', desc: 'Seamless deployment of OS, productivity suites, and custom business applications.' },
              { title: 'System Updates', icon: '🔄', desc: 'Managed patch deployments and version upgrades with zero downtime priority.' },
              { title: 'Network Configuration', icon: '🌐', desc: 'Enterprise WiFi, routing, firewall setup, and secure VPN infrastructure.' },
              { title: 'IT Consultation', icon: '💡', desc: 'Strategic technology planning, infrastructure audits, and scaling advice.' },
              { title: 'Equipment Setup', icon: '🖨️', desc: 'Professional installation of printers, CCTV, POS systems, and server racks.' },
              { title: 'Cybersecurity Audit', icon: '🛡️', desc: 'Comprehensive vulnerability assessment and implementation of threat protection.' },
              { title: 'Data Recovery', icon: '💾', desc: 'Emergency data retrieval from damaged drives and corrupted partitions.' },
              { title: 'Cloud Migration', icon: '☁️', desc: 'Smooth transition of legacy workflows to modern Azure, AWS, or GCP environments.' },
              { title: 'Remote Support', icon: '🎧', desc: 'Instant troubleshooting via high-security encrypted screen sharing.' },
              { title: 'Expert Consultation', icon: '👨‍💼', desc: 'Professional advice on digital transformation, IT strategy, and infrastructure scaling.' }
            ].map((service, i) => (
              <div key={i} className="glass-card" style={{ padding: '3rem', transition: 'transform 0.3s' }}>
                <div style={{ fontSize: '3rem', marginBottom: '2rem' }}>{service.icon}</div>
                <h4 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontWeight: 700 }}>{service.title}</h4>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem' }}>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Flow Section */}
      <section id="how-it-works" style={{ padding: '10rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
            <h3 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '2rem' }}>The ITSup Trust Flow</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.3rem' }}>Built on transparency, security, and verified expertise.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3rem' }}>
            {[
              { step: '01', title: 'Ticket Posting', desc: 'Define your technical needs and set a fair market budget.' },
              { step: '02', title: 'Escrow Funding', desc: 'Securely deposit funds into ITSup Escrow to initiate the task.' },
              { step: '03', title: 'Expert Resolution', desc: 'A verified IT Officer delivers a high-quality solution.' },
              { step: '04', title: 'Fund Release', desc: 'Approve the work and release payment to the professional.' }
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '90px', 
                  height: '90px', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  borderRadius: '1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 2.5rem auto',
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                  {item.step}
                </div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High Conversion CTA Sections */}
      <section style={{ padding: '10rem 0', background: 'linear-gradient(to bottom, var(--surface), var(--bg))' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
            {/* Customer CTA */}
            <div className="glass-card" style={{ padding: '5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', fontSize: '0.8rem', background: 'var(--primary)', color: 'white', fontWeight: 700, borderRadius: '0 0 0 0.75rem' }}>CUSTOMER</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Need Technical Support?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '3.5rem', fontSize: '1.15rem', lineHeight: 1.6 }}>
                Access our network of verified IT professionals. Secure escrow payments guarantee you only pay for results.
              </p>
              <Link href="/signup" className="btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.1rem' }}>Create a Ticket Now</Link>
            </div>
            
            {/* Officer CTA */}
            <div className="glass-card" style={{ padding: '5rem', textAlign: 'center', border: '2px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', fontSize: '0.8rem', background: '#22c55e', color: 'white', fontWeight: 700, borderRadius: '0 0 0 0.75rem' }}>OFFICER</div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Want to Earn More?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '3.5rem', fontSize: '1.15rem', lineHeight: 1.6 }}>
                Join our elite community of IT Officers. Browse global tickets and get paid securely for your expertise.
              </p>
              <Link href="/signup" className="btn-primary" style={{ padding: '1.25rem 4rem', fontSize: '1.1rem', background: '#22c55e', border: 'none' }}>Start Earning Money</Link>
            </div>
          </div>
          
          <div style={{ marginTop: '5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Questions? Explore our <Link href="/#how-it-works" style={{ color: 'var(--primary)', fontWeight: 600 }}>Trust Flow</Link> or <Link href="/login" style={{ color: 'white', fontWeight: 600 }}>Sign In</Link> to your account.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
