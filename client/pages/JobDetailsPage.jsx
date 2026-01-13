import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, DollarSign, Calendar, Building2, User, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SmartMatching from '@/components/SmartMatching';

const JobDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [poster, setPoster] = useState(null); // Individual or Studio
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      const { data: jobData, error } = await supabase
        .from('jobs')
        .select(`
           *,
           studio:studios(id, name, avatar_url, slug),
           creator:profiles(id, display_name, avatar_url, username)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setJob(jobData);
      
      // Determine who to display as poster
      if (jobData.studio) {
         setPoster({
            name: jobData.studio.name,
            avatar: jobData.studio.avatar_url,
            link: `/studios/${jobData.studio.slug}`,
            type: 'Studio'
         });
      } else {
         setPoster({
            name: jobData.creator.display_name,
            avatar: jobData.creator.avatar_url,
            link: `/profile/${jobData.creator.username}`,
            type: 'Individual'
         });
      }

      // Check application status
      if (user) {
         const { data: appData } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', id)
            .eq('applicant_id', user.id)
            .maybeSingle();
         if (appData) setHasApplied(true);
      }

      setLoading(false);
    };

    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
       navigate('/login');
       return;
    }
    setApplying(true);
    const { error } = await supabase
      .from('applications')
      .insert([{
         job_id: job.id,
         applicant_id: user.id,
         status: 'pending',
         message: ''
      }]);

    if (error) {
       toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
       toast({ title: "Applied!", description: "Application sent successfully." });
       setHasApplied(true);
    }
    setApplying(false);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;
  if (!job) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Job not found</div>;

  const isOwner = user?.id === job.created_by;

  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-20">
      <Helmet>
         <title>{job.title} | Devconnect</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
         <Link to="/jobs" className="text-gray-500 hover:text-white flex items-center gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
         </Link>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
               <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                           <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Posted {new Date(job.created_at).toLocaleDateString()}</span>
                           <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-900/50">{job.role}</Badge>
                           {job.genre && <Badge variant="outline" className="border-gray-700">{job.genre}</Badge>}
                        </div>
                     </div>
                     {job.target_type === 'studio' && (
                        <Badge className="bg-purple-600 text-white">Hiring Team</Badge>
                     )}
                  </div>

                  <div className="prose prose-invert max-w-none mb-8">
                     <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                     <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
                  </div>

                  <div>
                     <h3 className="text-lg font-semibold text-white mb-3">Required Skills</h3>
                     <div className="flex flex-wrap gap-2">
                        {job.required_skills?.map(skill => (
                           <Badge key={skill} variant="outline" className="border-gray-600 text-gray-300">{skill}</Badge>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Smart Matching for Owners */}
               {isOwner && <SmartMatching job={job} />}
            </div>

            <div className="space-y-6">
               {/* Action Card */}
               <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
                     <Avatar className="w-12 h-12">
                        <AvatarImage src={poster.avatar} />
                        <AvatarFallback>{poster.name[0]}</AvatarFallback>
                     </Avatar>
                     <div>
                        <div className="text-sm text-gray-500">{poster.type}</div>
                        <Link to={poster.link} className="font-bold text-white hover:underline">{poster.name}</Link>
                     </div>
                  </div>

                  <div className="space-y-4 mb-6">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Budget</span>
                        <span className="text-white font-semibold">{job.budget}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Type</span>
                        <span className="text-white font-semibold">{job.pay_type}</span>
                     </div>
                  </div>

                  {!isOwner && (
                     <Button 
                        className="w-full bg-blue-600 hover:bg-blue-500" 
                        size="lg" 
                        onClick={handleApply}
                        disabled={hasApplied || applying}
                     >
                        {hasApplied ? "Applied" : (applying ? "Sending..." : "Apply Now")}
                     </Button>
                  )}
                  
                  {isOwner && (
                     <Button variant="outline" className="w-full border-gray-700 text-white">Edit Job</Button>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;