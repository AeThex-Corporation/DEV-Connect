import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  Invoice,
  InvoiceCreate,
  InvoiceUpdate,
  InvoiceSearchRequest,
  InvoiceSearchResponse,
} from "@shared/invoicing";

// GET /api/invoices - Search invoices with filters
export const searchInvoices: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    status,
    client_id,
    start_date,
    end_date,
    min_amount,
    max_amount,
    search,
    limit = 50,
    offset = 0,
  } = req.query as Partial<InvoiceSearchRequest>;

  const supabase = getSupabase();
  let query = supabase
    .from("invoices")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) query = query.eq("status", status);
  if (client_id) query = query.eq("client_id", client_id);
  if (start_date) query = query.gte("issue_date", start_date);
  if (end_date) query = query.lte("issue_date", end_date);
  if (min_amount) query = query.gte("total", Number(min_amount));
  if (max_amount) query = query.lte("total", Number(max_amount));
  if (search) {
    query = query.or(
      `invoice_number.ilike.%${search}%,client_name.ilike.%${search}%`
    );
  }

  const { data: invoices, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Calculate stats
  const { data: allInvoices } = await supabase
    .from("invoices")
    .select("status, total")
    .eq("user_id", userId);

  const stats = {
    total_revenue: allInvoices?.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0) || 0,
    pending_amount: allInvoices?.filter((i) => i.status === "sent").reduce((sum, i) => sum + i.total, 0) || 0,
    overdue_amount: allInvoices?.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.total, 0) || 0,
    paid_count: allInvoices?.filter((i) => i.status === "paid").length || 0,
    pending_count: allInvoices?.filter((i) => i.status === "sent").length || 0,
    overdue_count: allInvoices?.filter((i) => i.status === "overdue").length || 0,
  };

  const response: InvoiceSearchResponse = {
    invoices: (invoices || []) as Invoice[],
    total: count || 0,
    stats,
  };

  res.json(response);
};

// GET /api/invoices/:id - Get single invoice
export const getInvoice: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  // Check ownership or if user is the client
  if (data.user_id !== userId && data.client_id !== userId) {
    return res.status(403).json({ error: "Not authorized to view this invoice" });
  }

  res.json(data as Invoice);
};

// POST /api/invoices - Create invoice
export const createInvoice: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const invoice: InvoiceCreate = req.body;
  const supabase = getSupabase();

  // Generate invoice number
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const invoice_number = `INV-${String(count || 0 + 1).padStart(5, "0")}`;

  // If time_entry_ids provided, fetch and create items
  let items = invoice.items;
  if (invoice.time_entry_ids && invoice.time_entry_ids.length > 0) {
    const { data: timeEntries } = await supabase
      .from("time_entries")
      .select("*")
      .in("id", invoice.time_entry_ids);

    if (timeEntries) {
      items = timeEntries.map((entry) => ({
        description: entry.description,
        quantity: (entry.duration_minutes || 0) / 60,
        unit_price: entry.hourly_rate || 0,
        amount: ((entry.duration_minutes || 0) / 60) * (entry.hourly_rate || 0),
        time_entry_ids: [entry.id],
      }));
    }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax_rate = invoice.tax_rate || 0;
  const tax_amount = subtotal * (tax_rate / 100);
  const total = subtotal + tax_amount;

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      invoice_number,
      user_id: userId,
      client_id: invoice.client_id,
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      status: "draft",
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      subtotal,
      tax_rate,
      tax_amount,
      total,
      currency: invoice.currency || "USD",
      notes: invoice.notes,
      payment_terms: invoice.payment_terms,
      items,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as Invoice);
};

// PUT /api/invoices/:id - Update invoice
export const updateInvoice: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const updates: InvoiceUpdate = req.body;
  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("invoices")
    .select("user_id, status")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return res.status(403).json({ error: "Not authorized to update this invoice" });
  }

  // Can't edit paid or cancelled invoices
  if (existing.status === "paid" || existing.status === "cancelled") {
    return res.status(400).json({ error: "Cannot edit paid or cancelled invoices" });
  }

  // Recalculate totals if items changed
  let updateData: any = { ...updates, updated_at: new Date().toISOString() };
  if (updates.items) {
    const subtotal = updates.items.reduce((sum, item) => sum + item.amount, 0);
    const tax_rate = updates.tax_rate ?? existing.status; // Keep existing if not provided
    const tax_amount = subtotal * (tax_rate / 100);
    const total = subtotal + tax_amount;
    updateData = { ...updateData, subtotal, tax_amount, total };
  }

  const { data, error } = await supabase
    .from("invoices")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as Invoice);
};

// POST /api/invoices/:id/send - Send invoice to client
export const sendInvoice: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  // Verify ownership
  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (!invoice || invoice.user_id !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  // Update status to sent
  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "sent",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // TODO: Send email notification to client
  // This would integrate with an email service (SendGrid, AWS SES, etc.)

  res.json(data as Invoice);
};

// DELETE /api/invoices/:id - Delete invoice (draft only)
export const deleteInvoice: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  // Verify ownership and status
  const { data: existing } = await supabase
    .from("invoices")
    .select("user_id, status")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  if (existing.status !== "draft") {
    return res.status(400).json({ error: "Can only delete draft invoices" });
  }

  const { error } = await supabase.from("invoices").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};

// POST /api/invoices/:id/mark-paid - Mark invoice as paid (manual)
export const markInvoicePaid: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { payment_method } = req.body;
  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("invoices")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const { data, error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_date: new Date().toISOString(),
      payment_method,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as Invoice);
};
