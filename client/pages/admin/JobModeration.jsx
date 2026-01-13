import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, ExternalLink, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { logAdminAction } from '@/lib/admin_utils';

const JobModeration = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const { toast } = useToast();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Fetch jobs that might need review. Assuming 'status' could be pending.
      // For this demo, fetching all 'active' or 'pending' to moderate content.
      const { data, error } = await supabase
        .from('jobs')
        .select('*, created_by_profile:created_by(display_name, email)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load jobs." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAction = async (id, action) => {
    // Mock action - update status in DB
    const newStatus = action === 'approve' ? 'active' : 'closed';
    try {
      const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      
      await logAdminAction(`job_${action}`, 'job', id);
      
      toast({ title: `Job ${action}d`, description: `Job ID ${id} has been updated.` });
      fetchJobs();
      setSelectedJobs(prev => prev.filter(x => x !== id));
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const handleBulkAction = async (action) => {
      // Implementation for bulk
      toast({ title: "Bulk action queued", description: `Processing ${selectedJobs.length} items...` });
      setSelectedJobs([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminHeader 
        title="Job Moderation" 
        subtitle="Review and manage job postings"
        searchPlaceholder="Search jobs..."
        onSearch={() => {}}
      />

      <div className="grid gap-4">
        {loading ? (
           <p className="text-zinc-500 text-center py-12">Loading moderation queue...</p>
        ) : jobs.length === 0 ? (
           <div className="text-center py-12 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
              <CheckCircle className="w-12 h-12 text-green-500/20 mx-auto mb-4" />
              <p className="text-zinc-400">No jobs pending review.</p>
           </div>
        ) : (
           jobs.map(job => (
             <Card key={job.id} className="bg-zinc-900/50 border-zinc-800 p-6 transition-all hover:border-zinc-700 group">
               <div className="flex items-start gap-4">
                 <Checkbox 
                   checked={selectedJobs.includes(job.id)}
                   onCheckedChange={(checked) => {
                      setSelectedJobs(prev => checked ? [...prev, job.id] : prev.filter(id => id !== job.id));
                   }}
                   className="mt-1"
                 />
                 <div className="flex-1">
                   <div className="flex items-start justify-between mb-2">
                     <div>
                       <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                         {job.title}
                       </h3>
                       <p className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
                         posted by <span className="text-zinc-300">{job.created_by_profile?.display_name}</span>
                         <span className="text-zinc-700">•</span>
                         <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                       </p>
                     </div>
                     <Badge variant="outline" className={`capitalize ${
                        job.status === 'active' ? 'text-green-400 border-green-900 bg-green-900/10' : 
                        job.status === 'closed' ? 'text-red-400 border-red-900 bg-red-900/10' :
                        'text-yellow-400 border-yellow-900 bg-yellow-900/10'
                     }`}>
                        {job.status || 'Unknown'}
                     </Badge>
                   </div>
                   
                   <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{job.description}</p>
                   
                   <div className="flex flex-wrap gap-2 mb-4">
                      {job.required_skills?.slice(0,4).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="bg-zinc-800 text-zinc-400">{skill}</Badge>
                      ))}
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                         <span>Budget: <span className="text-zinc-300 font-medium">{job.budget || 'N/A'}</span></span>
                         <span>Type: <span className="text-zinc-300 font-medium">{job.role}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="sm" asChild>
                            <a href={`/jobs/${job.id}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">
                               <ExternalLink className="w-4 h-4 mr-2" /> View Live
                            </a>
                         </Button>
                         <Button size="sm" variant="outline" className="border-zinc-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900" onClick={() => handleAction(job.id, 'reject')}>
                            <XCircle className="w-4 h-4 mr-2" /> Flag / Close
                         </Button>
                         <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => handleAction(job.id, 'approve')}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Verify Safe
                         </Button>
                      </div>
                   </div>
                 </div>
               </div>
             </Card>
           ))
        )}
      </div>

      <BulkActionBar 
         selectedCount={selectedJobs.length}
         entityName="jobs"
         onClear={() => setSelectedJobs([])}
         onApprove={() => handleBulkAction('approve')}
         onDelete={() => handleBulkAction('delete')}
      />
    </div>
  );
};

export default JobModeration;