import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Link } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { PlusCircle, Layers } from 'lucide-react';

    const CollectiveCard = ({ collective }) => (
      <motion.div
        className="bg-glass p-6 rounded-lg border-glow flex flex-col"
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-indigo-600/50 rounded-lg flex items-center justify-center mr-4">
            <Layers className="text-indigo-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{collective.name}</h3>
            <Link to={`/profile/${collective.owner?.username}`} className="text-indigo-400 hover:underline">by {collective.owner?.display_name || 'A Creator'}</Link>
          </div>
        </div>
        <p className="text-gray-300 mb-4 flex-grow">{collective.description}</p>
        <Link to={`/collectives/${collective.slug}`} className="mt-auto w-full">
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">View Details</Button>
        </Link>
      </motion.div>
    );

    function CollectivesPage() {
      const [collectives, setCollectives] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      useEffect(() => {
        const fetchCollectives = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('studios')
            .select('*, owner:profiles(display_name, username)')
            .eq('type', 'collective')
            .order('created_at', { ascending: false });

          if (error) {
            toast({ variant: "destructive", title: "Error fetching collectives", description: error.message });
          } else {
            setCollectives(data);
          }
          setLoading(false);
        };
        fetchCollectives();
      }, [toast]);

      return (
        <>
          <Helmet>
            <title>Collectives | Devconnect</title>
            <meta name="description" content="Discover and join development teams and learning groups." />
          </Helmet>
          <div className="px-6 py-20 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">Discover Collectives</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-10">Find and join learning or development teams to grow your skills.</p>
              <Link to="/create-collective">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-3 glow-effect">
                  <PlusCircle className="mr-2 h-5 w-5" /> Create a Collective
                </Button>
              </Link>
            </motion.div>
          </div>
          <div className="max-w-7xl mx-auto px-6 py-16">
            {loading ? (
              <div className="text-center text-2xl">Loading...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collectives.map((c) => <CollectiveCard key={c.id} collective={c} />)}
              </div>
            )}
          </div>
        </>
      );
    }

    export default CollectivesPage;