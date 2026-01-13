import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Users, Building2, Loader2, Plus, FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const JobCard = ({ job }) => (
  <div className="flex items-start justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-colors">
    <div>
      <h3 className="font-semibold text-white text-lg">{job.title}</h3>
      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
         <Badge variant="outline" className="border-gray-700 text-gray-400">{job.status}</Badge>
         <span>•</span>
         <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
         <span>•</span>
         <span className="text-blue-400">{job.applications?.length || 0} Applicants</span>
      </div>
    </div>
    <div className="flex gap-2">
      <Button size="sm" variant="outline" asChild className="border-gray-700 hover:bg-gray-800">
        <Link to={`/jobs/${job.id}`}>View</Link>
      </Button>
      <Button size="sm" variant="secondary" asChild>
         <Link to={`/jobs/${job.id}`}>Manage</Link>
      </Button>
    </div>
  </div>
);

const BusinessDashboard = () => {
  const { user, profile } = useAuth();
  const [individualJobs, setIndividualJobs] = useState([]);
  const [studioJobs, setStudioJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return;
      
      // Fetch jobs created by me (either personal or via my studios)
      // This query gets all jobs created by the user.
      const { data, error } = await supabase
        .from('jobs')
        .select('*, applications(count)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setIndividualJobs(data.filter(j => j.target_type === 'individual' || !j.target_type));
        setStudioJobs(data.filter(j => j.target_type === 'studio'));
      }
      setLoading(false);
    };

    fetchJobs();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-20">
      <Helmet>
        <title>Business Center | Devconnect</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Business Center</h1>
            <p className="text-gray-400">Manage your hiring pipeline, active contracts, and company profile.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="border-gray-700 text-white">
               <Link to="/business/contractors"><Users className="w-4 h-4 mr-2"/> My Contractors</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-500">
               <Link to="/post-a-job"><Plus className="w-4 h-4 mr-2"/> Post New Job</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Main Content Area */}
           <div className="lg:col-span-2 space-y-8">
             
              {/* Job Management Tabs */}
              <Card className="bg-gray-950 border-gray-800">
                 <CardHeader>
                    <CardTitle className="text-white">Your Job Postings</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <Tabs defaultValue="individual">
                       <TabsList className="bg-gray-900 border border-gray-800 w-full justify-start mb-6">
                          <TabsTrigger value="individual" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                             <Users className="w-4 h-4 mr-2" /> For Individuals
                          </TabsTrigger>
                          <TabsTrigger value="studios" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                             <Building2 className="w-4 h-4 mr-2" /> For Studios/Teams
                          </TabsTrigger>
                       </TabsList>

                       <TabsContent value="individual" className="space-y-4">
                          {individualJobs.length > 0 ? (
                             individualJobs.map(job => <JobCard key={job.id} job={job} />)
                          ) : (
                             <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-lg">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No active job postings for individuals.</p>
                                <Button variant="link" asChild className="text-blue-500">
                                   <Link to="/post-a-job">Post a Job</Link>
                                </Button>
                             </div>
                          )}
                       </TabsContent>

                       <TabsContent value="studios" className="space-y-4">
                          {studioJobs.length > 0 ? (
                             studioJobs.map(job => <JobCard key={job.id} job={job} />)
                          ) : (
                             <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-lg">
                                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No active job postings for studios.</p>
                                <Button variant="link" asChild className="text-purple-500">
                                   <Link to="/post-a-job?target=studio">Hire a Team</Link>
                                </Button>
                             </div>
                          )}
                       </TabsContent>
                    </Tabs>
                 </CardContent>
              </Card>
           </div>

           {/* Sidebar */}
           <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-800">
                 <CardHeader>
                    <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-gray-400">Active Jobs</span>
                       <span className="text-white font-bold text-xl">{individualJobs.length + studioJobs.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-gray-400">Total Applications</span>
                       <span className="text-white font-bold text-xl">
                          {individualJobs.concat(studioJobs).reduce((acc, job) => acc + (job.applications?.length || 0), 0)}
                       </span>
                    </div>
                 </CardContent>
              </Card>

              <Card className="bg-blue-900/10 border-blue-900/30">
                 <CardHeader>
                    <CardTitle className="text-blue-400 text-lg">Enterprise Support</CardTitle>
                    <CardDescription className="text-blue-200/60">Need help managing a large team?</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <Button variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-900/20">
                       Contact Sales
                    </Button>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;