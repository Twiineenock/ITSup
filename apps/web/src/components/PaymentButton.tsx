'use client';

import React, { useState } from 'react';

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

interface PaymentButtonProps {
  ticketId: string;
  amount: number;
  email: string;
  name: string;
  onSuccess: () => void;
}

export default function PaymentButton({ ticketId, amount, email, name, onSuccess }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    
    window.FlutterwaveCheckout({
      public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "FLWPUBK_TEST-efddd3bb2150d48b7cda2154514e8d2f-X", // Fallback to working TwiinePay key
      tx_ref: `ITSUP-${ticketId}-${Date.now()}`,
      amount: amount,
      currency: "UGX", // Defaulting to UGX for East Africa
      payment_options: "card, mobilemoneyuganda, mobilemoneykenya",
      customer: {
        email: email,
        name: name,
      },
      customizations: {
        title: "ITSup Escrow",
        description: `Funding Support Ticket #${ticketId.slice(0,8)}`,
        logo: "https://itsup.app/logo.png",
      },
      callback: async (data: any) => {
        console.log("Payment callback data:", data);
        
        // Verify on backend
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/tickets/${ticketId}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_id: data.transaction_id })
          });
          
          if (response.ok) {
            onSuccess();
          } else {
            alert("Verification failed. Please contact support.");
          }
        } catch (err) {
          console.error("Verification error:", err);
        }
        setLoading(false);
      },
      onclose: () => {
        setLoading(false);
      }
    });
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className="btn-primary" 
      style={{ width: '100%', marginTop: '1rem' }}
    >
      {loading ? 'Processing...' : `Pay $${amount} into Escrow`}
    </button>
  );
}
