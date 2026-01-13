// Subscription & Billing Types - Phase 2

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  limits: {
    max_projects?: number;
    max_clients?: number;
    max_invoices_per_month?: number;
    max_team_members?: number;
    storage_gb?: number;
    api_calls_per_day?: number;
  };
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionUsage {
  projects_count: number;
  clients_count: number;
  invoices_this_month: number;
  team_members_count: number;
  storage_used_gb: number;
  api_calls_today: number;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string; // For cards
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  created_at: string;
}

export interface BillingHistory {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  description: string;
  invoice_url?: string;
  stripe_invoice_id?: string;
  paid_at?: string;
  created_at: string;
}

export interface SubscriptionChangeRequest {
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
}

export interface PaymentMethodCreate {
  stripe_payment_method_id: string;
  set_as_default?: boolean;
}
