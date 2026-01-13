import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Link } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { PlusCircle, GitBranch, ArrowRight } from 'lucide-react';

    const TeamUpCard = ({ teamUp }) => {
      return (
        <motion.div
          className="bg-glass p-6 rounded-lg border-glow flex flex-col"
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-600/50 rounded-lg flex items-center justify-center mr-4">
              <GitBranch className="text-green-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{teamUp.title}</h3>
              <Link to={`/profile/${teamUp.profiles?.username}`} className="text-green-400 hover:underline">by {teamUp.profiles?.display_name || 'A Creator'}</Link>
            </div>
          </div>
          <p className="text-gray-300 mb-4 flex-grow">{teamUp.description.substring(0, 120)}...</p>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Roles Needed:</h4>
            <div className="flex flex-wrap gap-2">
              {teamUp.roles_needed?.map(role => (
                <span key={role} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">{role}</span>
              ))}
            </div>
          </div>
          <Link to={`/team-ups/${teamUp.id}`} className="mt-auto">
            <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      );
    };

    function TeamUpsPage() {
      const [teamUps, setTeamUps] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      useEffect(() => {
        const fetchTeamUps = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('team_ups')
            .select('*, profiles ( display_name, username )')
            .order('created_at', { ascending: false });

          if (error) {
            toast({ variant: "destructive", title: "Error fetching team-ups", description: error.message });
          } else {
            setTeamUps(data);
          }
          setLoading(false);
        };

        fetchTeamUps();
      }, [toast]);

      return (
        <>
          <Helmet>
            <title>Team Ups | Devconnect</title>
            <meta name="description" content="Find passion projects and casual collaborations." />
          </Helmet>
          <div className="px-6 py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">Team Up Feed</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-10">Find non-paid passion projects and casual collaborations to build your portfolio.</p>
              <Link to="/post-team-up">
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold text-lg px-8 py-3 glow-effect">
                  <PlusCircle className="mr-2 h-5 w-5" /> Create a Team-Up Post
                </Button>
              </Link>
            </motion.div>
          </div>
          <div className="max-w-7xl mx-auto px-6 py-16">
            {loading ? (
              <div className="text-center text-2xl">Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamUps.map((teamUp) => (
                  <TeamUpCard key={teamUp.id} teamUp={teamUp} />
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    export default TeamUpsPage;