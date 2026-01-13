import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { api } from '@/lib/db';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Building2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

const JobBoard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [contractorProfile, setContractorProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, matched

  // Application Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        setLoading(true);
        const [jobsData, contractorData] = await Promise.all([
          api.getJobs(),
          user ? api.getCurrentContractor(user.id) : null
        ]);
        
        setJobs(jobsData);
        setContractorProfile(contractorData);
      } catch (error) {
        console.error("Failed to load jobs", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load job postings."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [user, toast]);

  const handleApply = async () => {
    if (!selectedJob || !user) return;

    try {
      setIsSubmitting(true);
      await api.applyToJob(selectedJob.id, user.id, applicationMessage);
      
      toast({
        title: "Application Sent!",
        description: `You have successfully applied to ${selectedJob.title}.`
      });
      setSelectedJob(null);
      setApplicationMessage('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesType = true;
    if (filterType === 'matched' && contractorProfile) {
        // Simple matching logic: Check if user has at least one required skill
        if (job.required_skills && job.required_skills.length > 0 && contractorProfile.skills) {
            const hasSkill = job.required_skills.some(skill => contractorProfile.skills.includes(skill));
            matchesType = hasSkill;
        }
    }

    return matchesSearch && matchesType;
  });

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader /></div>;

  return (
    <>
      <Helmet>
        <title>Job Board | Devconnect</title>
      </Helmet>

      <div className="min-h-screen pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <Briefcase className="w-8 h-8 text-blue-500" />
                Open Opportunities
              </h1>
              <p className="text-gray-400">Find high-quality contracts vetted by the foundation.</p>
            </div>
            
            {contractorProfile && (
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Verified Contractor Status Active</span>
              </div>
            )}
          </div>

          {/* Search & Filter */}
          <div className="bg-glass rounded-xl p-4 mb-8 border border-white/10 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input 
                placeholder="Search by role, technology, or keyword..." 
                className="pl-10 bg-black/20 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
               <Button 
                 variant={filterType === 'all' ? 'secondary' : 'ghost'} 
                 onClick={() => setFilterType('all')}
                 className="text-gray-300 hover:text-white"
               >
                 All Jobs
               </Button>
               {contractorProfile && (
                 <Button 
                   variant={filterType === 'matched' ? 'secondary' : 'ghost'}
                   onClick={() => setFilterType('matched')}
                   className="text-gray-300 hover:text-white"
                 >
                   Matches for Me
                 </Button>
               )}
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-glass rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</h3>
                          {job.is_boosted && (
                             <Badge className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-500/50">Featured</Badge>
                          )}
                          <Badge variant="outline" className="text-gray-400 border-gray-700">{job.pay_type}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.genre || 'Engineering'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.scope || 'Remote'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-400 font-medium">
                            <DollarSign className="w-4 h-4" />
                            <span>{job.budget}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="text-gray-300 mb-4 line-clamp-2">{job.description}</p>

                        {job.required_skills && job.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.required_skills.map(skill => (
                              <span key={skill} className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/5">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full bg-white text-black hover:bg-gray-200"
                              onClick={() => setSelectedJob(job)}
                            >
                              Apply Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-800 text-white">
                            <DialogHeader>
                              <DialogTitle>Apply for {job.title}</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Introduce yourself and explain why you're a good fit for this role.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Textarea 
                                placeholder="Hi, I'm interested in this role because..."
                                value={applicationMessage}
                                onChange={(e) => setApplicationMessage(e.target.value)}
                                className="bg-black/30 border-white/10 min-h-[150px]"
                              />
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={handleApply} 
                                disabled={isSubmitting || !applicationMessage.trim()}
                                className="bg-blue-600 hover:bg-blue-500 text-white"
                              >
                                {isSubmitting ? "Sending..." : "Submit Application"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-gray-300">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">No jobs found</h3>
                  <p className="text-gray-400">Try adjusting your search or check back later.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </>
  );
};

export default JobBoard;