import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Link } from 'react-router-dom';
    import { Briefcase, DollarSign, Clock, MapPin, Rocket, ArrowRight } from 'lucide-react';
    import { supabase } from '@/lib/customSupabaseClient';

    const JobCard = ({ job }) => {
      return (
        <motion.div
          className={`bg-glass p-6 rounded-lg border-glow flex flex-col relative overflow-hidden ${job.is_boosted ? 'border-yellow-400' : ''}`}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {job.is_boosted && (
            <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 text-xs font-bold flex items-center gap-1 rounded-bl-lg">
              <Rocket className="w-3 h-3" /> BOOSTED
            </div>
          )}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-600/50 rounded-lg flex items-center justify-center mr-4">
              <Briefcase className="text-purple-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{job.title}</h3>
              <Link to={`/profile/${job.profiles?.username}`} className="text-purple-400 hover:underline">{job.profiles?.display_name || 'A Studio'}</Link>
            </div>
          </div>
          <div className="space-y-2 text-gray-300 mb-4 flex-grow">
            <div className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-green-400" /> {job.budget || 'Not specified'}</div>
            <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-yellow-400" /> {job.pay_type || 'Not specified'}</div>
            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-blue-400" /> Remote</div>
          </div>
          <Link to={`/jobs/${job.id}`} className="mt-auto">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      );
    };

    function JobsPage() {
      const pageTitle = "Find Work | Devconnect";
      const pageDescription = "Explore job opportunities in the Roblox ecosystem. Find your next full-time, part-time, or contract role as a developer, artist, or designer.";
      const [jobs, setJobs] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();
      const siteUrl = "https://dev-connect.com/jobs";
      const imageUrl = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3";

      useEffect(() => {
        const fetchJobs = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('jobs')
            .select(`
              *,
              profiles ( display_name, username )
            `)
            .eq('status', 'open')
            .order('is_boosted', { ascending: false })
            .order('created_at', { ascending: false });

          if (error) {
            toast({
              variant: "destructive",
              title: "Error fetching jobs",
              description: error.message,
            });
          } else {
            setJobs(data);
          }
          setLoading(false);
        };

        fetchJobs();
      }, [toast]);

      return (
        <>
          <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <link rel="canonical" href={siteUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
            <meta property="og:image" content={imageUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={siteUrl} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={imageUrl} />
          </Helmet>

          <div className="px-6 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-wider">
                Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 text-glow">Next Opportunity</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed">
                Browse the latest job openings from top Roblox studios and creators.
              </p>
            </motion.div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {loading ? (
              <div className="text-center text-2xl">Loading jobs...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
          
          <div className="text-center px-6 py-20">
             <Link to="/">
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300"
                >
                  Back to Home
                </Button>
              </Link>
          </div>
        </>
      );
    }

    export default JobsPage;