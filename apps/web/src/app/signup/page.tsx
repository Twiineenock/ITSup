'use client';

import React, { useState } from 'react';
import { supabase } from '@itsup/database';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as 'USER' | 'OFFICER',
  });
  const [image, setImage] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pwd.length > 6) score++;
    if (pwd.length > 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score < 2) return { score, label: 'Weak', color: '#ef4444' };
    if (score < 4) return { score, label: 'Medium', color: '#f59e0b' };
    return { score, label: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // 1. Sign up user
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (data.user) {
        let avatarUrl = null;

        // 2. Upload image if provided
        if (image) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${data.user.id}-${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, image);

          if (uploadError) throw uploadError;

          const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = publicUrl.publicUrl;
        }

        // 3. Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: formData.fullName,
            phone_number: formData.phone,
            role: formData.role,
            avatar_url: avatarUrl,
          });

        if (profileError) throw profileError;
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the database. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Success!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Your account has been created successfully. Welcome to ITSup!
            </p>
            <Link href="/login" className="btn-primary">Go to Login</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '700px', padding: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Join the Future of IT Support</h2>
            <p style={{ color: 'var(--text-muted)' }}>Get expert help or earn by solving IT issues</p>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '0.5rem', color: 'var(--danger)', marginBottom: '1.5rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="Jane Doe" style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="jane.doe@example.com" style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Contact (Phone Number)</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+256 771 250497" style={inputStyle} />
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="••••••••" 
                  style={inputStyle} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {formData.password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${(strength.score / 5) * 100}%`, height: '100%', background: strength.color, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 600 }}>{strength.label} Password</span>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="••••••••" 
                  style={inputStyle} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>I am a...</label>
              <select name="role" value={formData.role} onChange={handleInputChange} style={inputStyle}>
                <option value="USER">Customer</option>
                <option value="OFFICER">IT Officer</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Profile Image (Optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: '0.6rem' }} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ gridColumn: 'span 2', padding: '1.25rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.85rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'white',
  outline: 'none'
};
