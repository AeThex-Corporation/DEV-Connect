import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Globe, MapPin, Plus, Briefcase, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const StudioDetailsPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [studio, setStudio] = useState(null);
  const [members, setMembers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudio = async () => {
      setLoading(true);
      // Fetch Studio Info
      const { data: studioData, error } = await supabase
        .from('studios')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Studio not found." });
        setLoading(false);
        return;
      }

      setStudio(studioData);

      // Fetch Members
      const { data: membersData } = await supabase
        .from('studio_members')
        .select('role, user:profiles(id, display_name, avatar_url, username)')
        .eq('studio_id', studioData.id);
      
      if (membersData) setMembers(membersData);

      // Fetch Jobs posted BY this studio
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('studio_id', studioData.id)
        .eq('status', 'open');

      if (jobsData) setJobs(jobsData);
      
      setLoading(false);
    };

    fetchStudio();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (!studio) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Studio not found</div>;

  const isOwner = user?.id === studio.owner_id;

  return (
    <div className="min-h-screen bg-black pb-20">
      <Helmet>
        <title>{studio.name} | Devconnect</title>
      </Helmet>

      {/* Hero Banner */}
      <div className="h-64 w-full bg-gradient-to-r from-purple-900 to-blue-900 relative">
         {studio.banner_url && <img src={studio.banner_url} className="w-full h-full object-cover opacity-60" alt="banner" />}
         <div className="absolute -bottom-16 left-0 right-0 px-4">
            <div className="max-w-7xl mx-auto flex items-end gap-6">
               <Avatar className="w-32 h-32 border-4 border-black bg-black">
                  <AvatarImage src={studio.avatar_url} />
                  <AvatarFallback className="text-4xl">{studio.name[0]}</AvatarFallback>
               </Avatar>
               <div className="mb-4 flex-grow">
                  <h1 className="text-4xl font-bold text-white mb-2">{studio.name}</h1>
                  <div className="flex items-center gap-4 text-gray-300 text-sm">
                     {studio.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {studio.location}</span>}
                     {studio.website_url && <span className="flex items-center gap-1"><Globe className="w-4 h-4"/> <a href={studio.website_url} target="_blank" rel="noreferrer" className="hover:underline">Website</a></span>}
                  </div>
               </div>
               {isOwner && (
                  <div className="mb-6 flex gap-2">
                     <Button asChild className="bg-blue-600 hover:bg-blue-500">
                        <Link to={`/post-a-job?studioId=${studio.id}`}>
                           <Plus className="w-4 h-4 mr-2" /> Post Job
                        </Link>
                     </Button>
                     <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                        Edit Studio
                     </Button>
                  </div>
               )}
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-24">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
               <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                     <h2 className="text-xl font-bold text-white mb-4">About Us</h2>
                     <p className="text-gray-300 whitespace-pre-wrap">{studio.description || "No description available."}</p>
                     <div className="mt-6 flex flex-wrap gap-2">
                        {studio.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                     </div>
                  </CardContent>
               </Card>

               <Tabs defaultValue="jobs">
                  <TabsList className="bg-gray-900 border-gray-800">
                     <TabsTrigger value="jobs">Active Jobs ({jobs.length})</TabsTrigger>
                     <TabsTrigger value="projects">Portfolio</TabsTrigger>
                  </TabsList>
                  <TabsContent value="jobs" className="space-y-4 mt-4">
                     {jobs.length > 0 ? (
                        jobs.map(job => (
                           <Card key={job.id} className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-colors">
                              <CardContent className="p-6 flex justify-between items-center">
                                 <div>
                                    <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                                    <p className="text-sm text-gray-400">{job.pay_type} • {job.budget}</p>
                                 </div>
                                 <Button variant="outline" asChild>
                                    <Link to={`/jobs/${job.id}`}>View Details</Link>
                                 </Button>
                              </CardContent>
                           </Card>
                        ))
                     ) : (
                        <div className="text-center py-8 text-gray-500">No active jobs at the moment.</div>
                     )}
                  </TabsContent>
                  <TabsContent value="projects">
                     <div className="text-center py-8 text-gray-500">Portfolio coming soon.</div>
                  </TabsContent>
               </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                     <CardTitle className="text-white text-lg">Members</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {members.map(member => (
                        <div key={member.user.id} className="flex items-center gap-3">
                           <Avatar>
                              <AvatarImage src={member.user.avatar_url} />
                              <AvatarFallback>{member.user.display_name[0]}</AvatarFallback>
                           </Avatar>
                           <div>
                              <div className="font-medium text-white">{member.user.display_name}</div>
                              <div className="text-xs text-gray-400">{member.role}</div>
                           </div>
                        </div>
                     ))}
                  </CardContent>
               </Card>
            </div>

         </div>
      </div>
    </div>
  );
};

export default StudioDetailsPage;