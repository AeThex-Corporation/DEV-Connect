import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Users, Layers, Edit, UserPlus, UserMinus, FileText } from 'lucide-react';
    import EditCollectiveDialog from '@/components/EditCollectiveDialog';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

    function CollectiveDetailsPage() {
      const { slug } = useParams();
      const { user } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();
      const [collective, setCollective] = useState(null);
      const [members, setMembers] = useState([]);
      const [isMember, setIsMember] = useState(false);
      const [isOwner, setIsOwner] = useState(false);
      const [loading, setLoading] = useState(true);
      const [isEditOpen, setEditOpen] = useState(false);

      const fetchData = useCallback(async () => {
        if (!slug) return;
        setLoading(true);

        const { data: collectiveData, error: collectiveError } = await supabase
          .from('studios').select('*, owner:profiles!studios_owner_id_fkey(id, display_name, username), studio:studios!studios_associated_studio_id_fkey(name, slug)').eq('slug', slug).eq('type', 'collective').maybeSingle();
        
        if (collectiveError || !collectiveData) {
          toast({ variant: "destructive", title: "Not Found", description: "This collective could not be found." });
          navigate('/collectives');
          return;
        }
        setCollective(collectiveData);

        const { data: membersData, error: membersError } = await supabase
          .from('studio_members').select('*, profile:profiles(id, display_name, username, avatar_url, role)').eq('studio_id', collectiveData.id);
        if (membersError) toast({ variant: "destructive", title: "Error", description: "Could not fetch members." });
        else setMembers(membersData);

        if (user) {
          setIsMember(membersData?.some(m => m.user_id === user.id) || false);
          setIsOwner(collectiveData.owner_id === user.id);
        }
        setLoading(false);
      }, [slug, toast, user, navigate]);

      useEffect(() => {
        fetchData();
      }, [fetchData]);
      
      const handleJoinLeave = async () => {
        if (!user) {
          navigate('/login');
          return;
        }
        setLoading(true);
        if (isMember) {
            const { error } = await supabase.from('studio_members').delete().match({ studio_id: collective.id, user_id: user.id });
            if (error) toast({ variant: "destructive", title: "Error leaving collective" });
            else {
              toast({ title: "You've left the collective." });
              fetchData();
            }
        } else {
            const { error } = await supabase.from('studio_members').insert({ studio_id: collective.id, user_id: user.id, role: 'Member' });
            if (error) toast({ variant: "destructive", title: "Error joining collective" });
            else {
                toast({ title: "Welcome to the collective!" });
                fetchData();
            }
        }
        setLoading(false);
      };

      if (loading) return <div className="text-center py-20 text-2xl">Loading Collective...</div>;
      if (!collective) return null;

      const pageTitle = `${collective.name} | Devconnect`;
      const pageDescription = collective.description ? collective.description.substring(0, 160) + '...' : `Learn more about the ${collective.name} collective on Devconnect.`;
      const pageUrl = `https://dev-connect.com/collectives/${collective.slug}`;

      return (
        <>
          <Helmet>
            <title>{pageTitle}</title>
            <meta name="description" content={pageDescription} />
            <link rel="canonical" href={pageUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={pageUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={pageDescription} />
          </Helmet>
          {isOwner && <EditCollectiveDialog open={isEditOpen} onOpenChange={setEditOpen} collective={collective} onCollectiveUpdate={fetchData} />}

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-glass p-8 rounded-lg border-glow">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-4xl font-bold">{collective.name}</h1>
                    <p className="text-xl text-indigo-400 mt-1">
                        Owned by <Link to={`/profile/${collective.owner.username}`} className="hover:underline">{collective.owner.display_name}</Link>
                    </p>
                    {collective.studio && (
                        <p className="text-md text-cyan-400 mt-2">
                            Part of <Link to={`/studios/${collective.studio.slug}`} className="hover:underline font-semibold">{collective.studio.name}</Link>
                        </p>
                    )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {isOwner && (
                        <Button onClick={() => setEditOpen(true)} variant="secondary" className="w-full sm:w-auto"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                    )}
                    {user && !isOwner && (
                        <Button onClick={handleJoinLeave} disabled={loading} className="w-full sm:w-auto">
                            {isMember ? <><UserMinus className="mr-2 h-4 w-4" /> Leave</> : <><UserPlus className="mr-2 h-4 w-4" /> Join</>}
                        </Button>
                    )}
                </div>
              </div>
            </motion.div>

            <Tabs defaultValue="about" className="w-full mt-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about"><FileText className="mr-2 h-4 w-4" />About</TabsTrigger>
                <TabsTrigger value="members"><Users className="mr-2 h-4 w-4" />Members ({members.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6 bg-glass p-6 rounded-lg border-glow">
                <h2 className="text-2xl font-bold mb-4">About {collective.name}</h2>
                <p className="text-lg text-gray-300 whitespace-pre-wrap">{collective.description}</p>
              </TabsContent>
              <TabsContent value="members" className="mt-6 bg-glass p-6 rounded-lg border-glow">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map(m => (
                    <Link to={`/profile/${m.profile.username}`} key={m.user_id} className="bg-gray-800/50 p-3 rounded-lg hover:bg-gray-700/70 transition-colors flex items-center gap-3">
                      <img alt={`${m.profile.display_name}'s avatar`} className="w-10 h-10 rounded-full object-cover" src={m.profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.profile.username}`} />
                      <div>
                        <p className="font-semibold">{m.profile.display_name}</p>
                        <p className="text-sm text-gray-400">{m.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="text-center mt-12">
              <Link to="/collectives"><Button variant="outline" className="bg-transparent border-gray-600">Back to Collectives</Button></Link>
            </div>
          </div>
        </>
      );
    }

    export default CollectiveDetailsPage;