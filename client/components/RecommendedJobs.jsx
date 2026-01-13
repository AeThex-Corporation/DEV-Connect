import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Link, useNavigate } from 'react-router-dom';
    import { Briefcase, DollarSign, Clock } from 'lucide-react';

    const JobCard = ({ job, onApply }) => (
      <motion.div
        className="bg-glass p-6 rounded-lg border-glow flex flex-col"
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-purple-600/50 rounded-lg flex items-center justify-center mr-4">
            <Briefcase className="text-purple-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{job.title}</h3>
            <p className="text-purple-400">{job.profiles?.display_name || 'AeThex'}</p>
          </div>
        </div>
        <div className="space-y-2 text-gray-300 mb-4">
          <div className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-green-400" /> {job.budget || 'Competitive'}</div>
          <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-yellow-400" /> {job.pay_type || 'Full-Time'}</div>
        </div>
        <Button onClick={() => onApply(job.id)} className="mt-auto w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Quick Apply</Button>
      </motion.div>
    );

    function RecommendedJobs() {
      const { user } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();
      const [featuredJobs, setFeaturedJobs] = useState([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchFeaturedJobs = async () => {
          setLoading(true);
          
          const { data: jobsData, error: jobsError } = await supabase
            .from('jobs')
            .select('*, profiles(display_name)')
            .eq('status', 'open')
            .limit(3)
            .order('created_at', { ascending: false });
          
          if (jobsError) {
            toast({ variant: 'destructive', title: 'Error fetching featured jobs' });
          } else {
            setFeaturedJobs(jobsData);
          }
          
          setLoading(false);
        };

        fetchFeaturedJobs();
      }, [toast]);

      const handleQuickApply = async (jobId) => {
        if (!user) {
          toast({ variant: "destructive", title: "Please sign in to apply." });
          navigate('/login');
          return;
        }

        const { error } = await supabase
          .from('applications')
          .insert({ job_id: jobId, applicant_id: user.id, status: 'pending', message: 'Quick application.' });

        if (error) {
          if (error.code === '23505') {
             toast({ variant: "destructive", title: "Already Applied", description: "You have already applied for this job." });
          } else {
            toast({ variant: "destructive", title: "Application Failed", description: error.message });
          }
        } else {
          toast({ title: "Application Sent!", description: "Your quick application was successful." });
        }
      };

      if (loading || featuredJobs.length === 0) {
        return null;
      }

      return (
        <div className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-7xl mx-auto px-6"
          >
            <h2 className="text-4xl font-bold text-center mb-10">Featured Opportunities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredJobs.map(job => (
                <JobCard key={job.id} job={job} onApply={handleQuickApply} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/jobs">
                <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white">
                  Browse All Careers
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      );
    }

    export default RecommendedJobs;