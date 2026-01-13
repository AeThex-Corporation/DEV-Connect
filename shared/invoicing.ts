// Invoicing Types - Phase 2

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string; // Invoice creator (freelancer)
  client_id: string; // Client being invoiced
  client_name: string;
  client_email: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  paid_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  notes?: string;
  payment_terms?: string;
  items: InvoiceItem[];
  payment_method?: string;
  stripe_payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  time_entry_ids?: string[]; // Link to time entries
}

export interface InvoiceCreate {
  client_id: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  tax_rate?: number;
  currency?: string;
  notes?: string;
  payment_terms?: string;
  items: Omit<InvoiceItem, 'id'>[];
  time_entry_ids?: string[]; // Auto-generate items from time entries
}

export interface InvoiceUpdate {
  client_name?: string;
  client_email?: string;
  issue_date?: string;
  due_date?: string;
  tax_rate?: number;
  notes?: string;
  payment_terms?: string;
  items?: Omit<InvoiceItem, 'id'>[];
  status?: Invoice['status'];
}

export interface InvoiceSearchRequest {
  status?: Invoice['status'];
  client_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface InvoiceSearchResponse {
  invoices: Invoice[];
  total: number;
  stats: {
    total_revenue: number;
    pending_amount: number;
    overdue_amount: number;
    paid_count: number;
    pending_count: number;
    overdue_count: number;
  };
}

export interface InvoicePaymentRequest {
  payment_method_id: string; // Stripe payment method
  save_payment_method?: boolean;
}
