export async function apiGet<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiPost<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export interface Job {
  id: number; title: string; role: string; comp: string; genre?: string; scope?: string; description?: string; created_by?: string; created_at: string;
}

export interface Application { id: number; job_id: number; applicant_stack_user_id: string; message?: string; status: string; created_at: string; }

export interface Message { id: number; thread_id: string; sender_stack_user_id: string; recipient_stack_user_id: string; body: string; created_at: string; }
