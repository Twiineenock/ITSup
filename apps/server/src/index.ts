import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { supabase } from '@itsup/database';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'ITSup API is running' });
});

// Ticket Endpoints
app.get('/api/tickets', async (req, res) => {
  const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json(error);
  res.json(data);
});

// --- FLUTTERWAVE VERIFICATION ---
app.post('/api/tickets/:id/verify', async (req, res) => {
    const { id } = req.params;
    const { transaction_id } = req.body;

    if (!transaction_id) return res.status(400).json({ error: 'Missing Flutterwave transaction_id' });

    try {
        console.log(`🔍 Verifying Flutterwave TX: ${transaction_id} for Ticket ID: ${id}`);
        
        // 1. Verify with Flutterwave
        const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
            }
        });

        const flwData = response.data.data;

        if (flwData.status === "successful") {
            console.log(`✅ Payment confirmed for Ticket ${id}. Updating status to FUNDED...`);
            
            // 2. Update Ticket Status
            const { data: ticket, error: ticketError } = await supabase
                .from('tickets')
                .update({ status: 'FUNDED', updated_at: new Date() })
                .eq('id', id)
                .select()
                .single();

            if (ticketError) throw ticketError;

            // 3. Log Escrow Transaction
            const { error: escrowError } = await supabase
                .from('escrow_transactions')
                .insert({
                    ticket_id: id,
                    amount: ticket.budget,
                    status: 'HELD',
                    payment_reference: transaction_id
                });

            if (escrowError) console.error("❌ Escrow Log Error:", escrowError.message);

            res.json({ success: true, ticket });
        } else {
            res.status(400).json({ error: 'Payment failed at Flutterwave', flw_status: flwData.status });
        }
    } catch (err: any) {
        console.error('❌ Verification Error:', err.message);
        res.status(500).json({ error: 'Internal verification failure' });
    }
});

app.listen(port, () => {
  console.log(`ITSup Server running at http://localhost:${port}`);
});
