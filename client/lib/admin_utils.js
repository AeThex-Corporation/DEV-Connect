import { supabase } from './customSupabaseClient';

export const logAdminAction = async (actionType, entityType, entityId, details = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('admin_audit_logs').insert({
      admin_id: user.id,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      details
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      const value = row[fieldName];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const getAuditLogs = async (filters = {}) => {
  // Using explicit foreign key syntax: alias:table!constraint_name
  let query = supabase
    .from('admin_audit_logs')
    .select(`
      *,
      admin:profiles!admin_audit_logs_admin_id_fkey (email, display_name)
    `)
    .order('created_at', { ascending: false });

  if (filters.adminId) query = query.eq('admin_id', filters.adminId);
  if (filters.entityType) query = query.eq('entity_type', filters.entityType);
  if (filters.actionType) query = query.eq('action_type', filters.actionType);
  
  const { data, error } = await query.limit(50);
  
  if (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
  return data;
};

export const addAdminNote = async (entityType, entityId, note) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('admin_notes').insert({
    admin_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    note
  });
  if (error) throw error;
};

export const getAdminNotes = async (entityType, entityId) => {
  // Using explicit foreign key syntax: alias:table!constraint_name
  const { data, error } = await supabase
    .from('admin_notes')
    .select(`
      *,
      admin:profiles!admin_notes_admin_id_fkey (email)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};