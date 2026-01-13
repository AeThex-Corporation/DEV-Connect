import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Github, Linkedin, Globe, FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { logAdminAction, exportToCSV } from '@/lib/admin_utils';

const Verifications = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const { toast } = useToast();
  const [expandedApp, setExpandedApp] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contractors')
        .select(`
            id, status, bio, experience_years, hourly_rate, availability,
            github_url, linkedin_url, portfolio_url, skills, user_id, created_at,
            verification_responses (question_text, answer_text),
            profiles:user_id (display_name, email, username, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await supabase.from('contractors').update({ status: status }).eq('id', id);
      const app = applications.find(a => a.id === id);
      if(app) {
         await supabase.from('profiles')
            .update({ verification_status: status === 'approved' ? 'verified' : 'rejected' })
            .eq('id', app.user_id);
         await logAdminAction(`verification_${status}`, 'contractor', id, { user_id: app.user_id });
      }
      toast({ title: `Success`, description: `Application ${status}.` });
      fetchData(); 
      setSelectedApps(prev => prev.filter(appId => appId !== id));
    } catch (error) {
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminHeader 
         title="Verification Requests" 
         subtitle="Approve or reject contractor applications"
         onExport={() => exportToCSV(applications, 'verifications.csv')} 
      />

      {applications.length === 0 && !loading ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
            <CheckCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">All caught up!</h3>
            <p className="text-zinc-500">No pending verification requests.</p>
          </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="flex gap-4 items-start">
              <div className="pt-6">
                <Checkbox 
                   checked={selectedApps.includes(app.id)}
                   onCheckedChange={() => setSelectedApps(prev => prev.includes(app.id) ? prev.filter(x => x !== app.id) : [...prev, app.id])}
                />
              </div>
              <Collapsible 
                open={expandedApp === app.id}
                onOpenChange={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                className={`flex-1 bg-zinc-900/50 rounded-xl border transition-all ${
                    expandedApp === app.id ? 'border-indigo-500/30 shadow-lg shadow-indigo-900/10' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-zinc-700">
                      <AvatarImage src={app.profiles?.avatar_url} />
                      <AvatarFallback>{app.profiles?.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-white text-lg">{app.profiles?.display_name}</h3>
                      <p className="text-sm text-zinc-400">@{app.profiles?.username} • {app.experience_years} Exp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">{app.skills?.length || 0} Skills</Badge>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-zinc-400">
                        {expandedApp === app.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent className="border-t border-zinc-800 bg-zinc-950/30">
                  <div className="p-6 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Profile & Bio</h4>
                        <p className="text-zinc-300 text-sm leading-relaxed">{app.bio || "No bio."}</p>
                        <div className="flex gap-2">
                            {app.github_url && <a href={app.github_url} className="text-indigo-400 text-sm hover:underline flex items-center gap-1"><Github className="w-3 h-3"/> GitHub</a>}
                            {app.linkedin_url && <a href={app.linkedin_url} className="text-indigo-400 text-sm hover:underline flex items-center gap-1"><Linkedin className="w-3 h-3"/> LinkedIn</a>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Responses</h4>
                        <div className="space-y-3">
                            {app.verification_responses?.map((r, i) => (
                                <div key={i} className="bg-zinc-900 p-3 rounded border border-zinc-800">
                                    <p className="text-xs text-zinc-500 mb-1">{r.question_text}</p>
                                    <p className="text-sm text-zinc-300">{r.answer_text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => handleStatusUpdate(app.id, 'rejected')} className="text-red-400 hover:bg-red-950/30">Reject</Button>
                    <Button onClick={() => handleStatusUpdate(app.id, 'approved')} className="bg-indigo-600 hover:bg-indigo-500">Approve</Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))
        }</div>
      )}

      <BulkActionBar 
         selectedCount={selectedApps.length}
         entityName="applications"
         onClear={() => setSelectedApps([])}
         onApprove={() => {}} 
      />
    </div>
  );
};

export default Verifications;