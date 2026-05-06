'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@itsup/database';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, user:profiles!user_id(full_name), officer:profiles!officer_id(full_name)')
        .order('created_at', { ascending: false });
      
      if (!error) setTickets(data);
      setLoading(false);
    }
    fetchTickets();
  }, []);

  const stats = [
    { label: "Active Tickets", value: tickets.length, trend: "+12%" },
    { label: "Escrow Balance", value: `${tickets.reduce((acc, t) => acc + (t.status === 'FUNDED' ? t.budget : 0), 0).toLocaleString()} UGX`, trend: "+5M UGX" },
    { label: "Total Officers", value: "45", trend: "+3" },
    { label: "Open Disputes", value: tickets.filter(t => t.status === 'DISPUTED').length, trend: "-2" },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '2rem' }}>
      <div className="container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Command Center</h1>
            <p style={{ color: 'var(--text-muted)' }}>Overview of ITSup network operations.</p>
          </div>
          <button className="btn-primary" onClick={() => window.location.reload()}>Refresh System</button>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{stat.value}</h3>
              <p style={{ fontSize: '0.8rem', color: stat.trend.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>{stat.trend} this week</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Live Support Tickets</h3>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <p>Loading database...</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Ticket</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>User</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Officer</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Category</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Budget</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{ticket.title}</td>
                      <td style={{ padding: '1rem' }}>{ticket.user?.full_name || 'Guest User'}</td>
                      <td style={{ padding: '1rem' }}>{ticket.officer?.full_name || 'Pending'}</td>
                      <td style={{ padding: '1rem' }}>{ticket.category}</td>
                      <td style={{ padding: '1rem' }}>{Number(ticket.budget).toLocaleString()} UGX</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge badge-${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
