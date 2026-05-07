'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@itsup/database';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'users'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return (window.location.href = '/login');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      alert("Unauthorized access. Admin privileges required.");
      window.location.href = '/';
      return;
    }

    setIsAdmin(true);
    fetchData();
  }

  async function fetchData() {
    const [ticketsRes, usersRes] = await Promise.all([
      supabase.from('tickets').select('*, customer:profiles!user_id(full_name, email), officer:profiles!officer_id(full_name)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false })
    ]);

    if (!ticketsRes.error) setTickets(ticketsRes.data);
    if (!usersRes.error) setUsers(usersRes.data);
    setLoading(false);
  }

  const toggleSuspension = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_suspended: !currentStatus })
      .eq('id', userId);
    
    if (!error) fetchData();
  };

  const expelUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently expel this user? This cannot be undone.")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) fetchData();
  };

  if (loading || !isAdmin) return <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Verifying Admin Authority...</div>;

  const totalRevenue = tickets.filter(t => t.status !== 'PENDING_PAYMENT').length * 5000;
  const filteredUsers = users.filter(u => u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="container" style={{ flex: 1, padding: '4rem 2rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Master Admin Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Platform oversight, financial monitoring, and user governance.</p>
        </header>

        <nav style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <button onClick={() => setActiveTab('overview')} style={{ background: 'none', border: 'none', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem' }}>Financial Overview</button>
          <button onClick={() => setActiveTab('tickets')} style={{ background: 'none', border: 'none', color: activeTab === 'tickets' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem' }}>Ticket Registry</button>
          <button onClick={() => setActiveTab('users')} style={{ background: 'none', border: 'none', color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem' }}>User Directory</button>
        </nav>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>TOTAL PLATFORM REVENUE</p>
              <h2 style={{ fontSize: '3rem', color: 'var(--success)', fontWeight: 900 }}>UGX {totalRevenue.toLocaleString()}</h2>
              <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: 'var(--text-muted)' }}>From {tickets.filter(t => t.status !== 'PENDING_PAYMENT').length} listing fees</p>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>TOTAL REGISTERED USERS</p>
              <h2 style={{ fontSize: '3rem', fontWeight: 900 }}>{users.length}</h2>
              <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: 'var(--text-muted)' }}>Customers & IT Officers</p>
            </div>
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>ACTIVE TICKETS</p>
              <h2 style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: 900 }}>{tickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length}</h2>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                <tr>
                  <th style={{ padding: '1.5rem' }}>Title</th>
                  <th style={{ padding: '1.5rem' }}>Customer</th>
                  <th style={{ padding: '1.5rem' }}>Officer</th>
                  <th style={{ padding: '1.5rem' }}>Status</th>
                  <th style={{ padding: '1.5rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1.5rem' }}>{ticket.title}</td>
                    <td style={{ padding: '1.5rem' }}>{ticket.customer?.full_name}</td>
                    <td style={{ padding: '1.5rem' }}>{ticket.officer?.full_name || '-'}</td>
                    <td style={{ padding: '1.5rem' }}><span className={`badge badge-${ticket.status.toLowerCase()}`}>{ticket.status}</span></td>
                    <td style={{ padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(ticket.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white', marginBottom: '2rem' }}
            />
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <tr>
                    <th style={{ padding: '1.5rem' }}>User Info</th>
                    <th style={{ padding: '1.5rem' }}>Role</th>
                    <th style={{ padding: '1.5rem' }}>Status</th>
                    <th style={{ padding: '1.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', opacity: user.is_suspended ? 0.6 : 1 }}>
                      <td style={{ padding: '1.5rem' }}>
                        <p style={{ fontWeight: 700 }}>{user.full_name}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
                      </td>
                      <td style={{ padding: '1.5rem' }}>{user.role}</td>
                      <td style={{ padding: '1.5rem' }}>
                        {user.is_suspended ? <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 700 }}>SUSPENDED</span> : <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 700 }}>ACTIVE</span>}
                      </td>
                      <td style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => toggleSuspension(user.id, user.is_suspended)} style={{ padding: '0.5rem 1rem', background: user.is_suspended ? 'var(--success)' : 'var(--warning)', border: 'none', borderRadius: '0.4rem', color: 'black', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                            {user.is_suspended ? 'Restore' : 'Suspend'}
                          </button>
                          <button onClick={() => expelUser(user.id)} style={{ padding: '0.5rem 1rem', background: 'var(--danger)', border: 'none', borderRadius: '0.4rem', color: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                            Expel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
