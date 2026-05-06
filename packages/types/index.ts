export type Role = 'USER' | 'OFFICER' | 'ADMIN';

export type TicketCategory = 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'REMOTE' | 'CONSULTATION';

export type TicketStatus = 
  | 'OPEN' 
  | 'FUNDED' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'COMPLETED' 
  | 'DISPUTED';

export type EscrowStatus = 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';

export interface Profile {
  id: string;
  full_name: string;
  whatsapp_number: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  officer_id?: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  budget: number;
  created_at: string;
  updated_at: string;
}

export interface EscrowTransaction {
  id: string;
  ticket_id: string;
  amount: number;
  status: EscrowStatus;
  payment_reference?: string;
  created_at: string;
}
