import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionUsage,
  PaymentMethod,
  BillingHistory,
  SubscriptionChangeRequest,
  PaymentMethodCreate,
} from "@shared/subscriptions";

// GET /api/subscriptions/plans - List available subscription plans
export const listPlans: RequestHandler = async (_req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("price_monthly", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ plans: (data || []) as SubscriptionPlan[] });
};

// GET /api/subscriptions/current - Get user's current subscription
export const getCurrentSubscription: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return res.status(500).json({ error: error.message });
  }

  // If no subscription, return free tier default
  if (!data) {
    return res.json({
      subscription: {
        tier: "free",
        status: "active",
        billing_cycle: "monthly",
      } as Partial<UserSubscription>,
    });
  }

  res.json({ subscription: data as UserSubscription });
};

// POST /api/subscriptions/change - Change subscription plan
export const changeSubscription: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const request: SubscriptionChangeRequest = req.body;
  const supabase = getSupabase();

  // Get the plan details
  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", request.plan_id)
    .single();

  if (!plan) {
    return res.status(404).json({ error: "Plan not found" });
  }

  // Check if user already has a subscription
  const { data: existing } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(
    periodEnd.getMonth() + (request.billing_cycle === "yearly" ? 12 : 1)
  );

  if (existing) {
    // Update existing subscription
    const { data, error } = await supabase
      .from("user_subscriptions")
      .update({
        plan_id: request.plan_id,
        tier: plan.tier,
        billing_cycle: request.billing_cycle,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // TODO: Update Stripe subscription if stripe_subscription_id exists

    return res.json(data as UserSubscription);
  } else {
    // Create new subscription
    const { data, error } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        plan_id: request.plan_id,
        tier: plan.tier,
        status: "active",
        billing_cycle: request.billing_cycle,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // TODO: Create Stripe subscription

    return res.status(201).json(data as UserSubscription);
  }
};

// POST /api/subscriptions/cancel - Cancel subscription at period end
export const cancelSubscription: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // TODO: Cancel Stripe subscription at period end

  res.json(data as UserSubscription);
};

// POST /api/subscriptions/reactivate - Reactivate cancelled subscription
export const reactivateSubscription: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .update({
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // TODO: Reactivate Stripe subscription

  res.json(data as UserSubscription);
};

// GET /api/subscriptions/usage - Get current usage stats
export const getUsage: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();

  // Fetch various usage metrics
  const [projectsCount, clientsCount, invoicesThisMonth, teamMembersCount] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("type", "client"),
      supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte(
          "created_at",
          new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        ),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  const usage: SubscriptionUsage = {
    projects_count: projectsCount.count || 0,
    clients_count: clientsCount.count || 0,
    invoices_this_month: invoicesThisMonth.count || 0,
    team_members_count: teamMembersCount.count || 0,
    storage_used_gb: 0, // TODO: Calculate actual storage
    api_calls_today: 0, // TODO: Track API calls
  };

  res.json(usage);
};

// GET /api/subscriptions/payment-methods - List payment methods
export const listPaymentMethods: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ payment_methods: (data || []) as PaymentMethod[] });
};

// POST /api/subscriptions/payment-methods - Add payment method
export const addPaymentMethod: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const request: PaymentMethodCreate = req.body;
  const supabase = getSupabase();

  // TODO: Validate with Stripe and get card details
  // For now, mock the card details
  const cardDetails = {
    type: "card" as const,
    last4: "4242",
    brand: "visa",
    exp_month: 12,
    exp_year: 2025,
  };

  // If set as default, unset other defaults
  if (request.set_as_default) {
    await supabase
      .from("payment_methods")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      user_id: userId,
      stripe_payment_method_id: request.stripe_payment_method_id,
      ...cardDetails,
      is_default: request.set_as_default ?? false,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as PaymentMethod);
};

// DELETE /api/subscriptions/payment-methods/:id - Remove payment method
export const removePaymentMethod: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("payment_methods")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  // TODO: Remove from Stripe

  const { error } = await supabase.from("payment_methods").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};

// GET /api/subscriptions/billing-history - Get billing history
export const getBillingHistory: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { limit = 50, offset = 0 } = req.query;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("billing_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ history: (data || []) as BillingHistory[] });
};
