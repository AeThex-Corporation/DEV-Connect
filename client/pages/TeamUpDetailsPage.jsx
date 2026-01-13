import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { GitBranch, Send, Check, X, User, Inbox } from 'lucide-react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Textarea } from '@/components/ui/textarea';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

    const ExpressInterestDialog = ({ open, onOpenChange, teamUpId, onInterestSent }) => {
      const { user } = useAuth();
      const { toast } = useToast();
      const [message, setMessage] = useState('');
      const [loading, setLoading] = useState(false);

      const handleSubmit = async () => {
        if (!user) {
          toast({ variant: 'destructive', title: 'Not logged in' });
          return;
        }
        setLoading(true);
        const { error } = await supabase.from('team_up_interests').insert({
          team_up_id: teamUpId,
          user_id: user.id,
          message: message,
        });

        if (error) {
          toast({ variant: 'destructive', title: 'Error', description: error.code === '23505' ? 'You have already expressed interest.' : error.message });
        } else {
          toast({ title: 'Success!', description: 'Your interest has been sent.' });
          onInterestSent();
          onOpenChange(false);
        }
        setLoading(false);
      };

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Express Interest</DialogTitle>
              <DialogDescription>Send a message to the project owner.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea placeholder="Tell them why you're a good fit..." value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send</>}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    const InterestedUsersTab = ({ teamUpId }) => {
        const [interests, setInterests] = useState([]);
        const [loading, setLoading] = useState(true);
        const { toast } = useToast();

        const fetchInterests = useCallback(async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('team_up_interests')
                .select('*, user:profiles(id, display_name, username, avatar_url)')
                .eq('team_up_id', teamUpId)
                .order('created_at', { ascending: false });
            
            if (error) {
                toast({ variant: "destructive", title: "Error fetching interests." });
            } else {
                setInterests(data);
            }
            setLoading(false);
        }, [teamUpId, toast]);

        useEffect(() => {
            fetchInterests();
        }, [fetchInterests]);

        const handleStatusChange = async (interestId, newStatus) => {
            const { error } = await supabase
                .from('team_up_interests')
                .update({ status: newStatus })
                .eq('id', interestId);
            
            if (error) {
                toast({ variant: "destructive", title: "Error updating status." });
            } else {
                toast({ title: "Status updated!" });
                fetchInterests();
            }
        };

        if (loading) return <p>Loading interested users...</p>;
        if (interests.length === 0) return <p className="text-center text-gray-400 py-8">No one has expressed interest yet.</p>;

        return (
            <div className="space-y-4">
                {interests.map(interest => (
                    <div key={interest.id} className="bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                            <Link to={`/profile/${interest.user.username}`} className="flex items-center gap-3">
                                <img alt="avatar" className="w-12 h-12 rounded-full object-cover" src={interest.user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${interest.user.username}`} />
                                <div>
                                    <p className="font-semibold text-lg">{interest.user.display_name}</p>
                                    <p className="text-sm text-cyan-400 hover:underline">@{interest.user.username}</p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-2">
                                {interest.status === 'pending' ? (
                                    <>
                                        <Button size="sm" className="bg-green-500/20 hover:bg-green-500/40" onClick={() => handleStatusChange(interest.id, 'accepted')}><Check className="h-4 w-4" /></Button>
                                        <Button size="sm" className="bg-red-500/20 hover:bg-red-500/40" onClick={() => handleStatusChange(interest.id, 'rejected')}><X className="h-4 w-4" /></Button>
                                    </>
                                ) : (
                                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${interest.status === 'accepted' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                        {interest.message && <p className="text-sm text-gray-300 mt-3 border-l-2 border-cyan-500 pl-3">{interest.message}</p>}
                    </div>
                ))}
            </div>
        );
    };

    function TeamUpDetailsPage() {
      const { id } = useParams();
      const { user } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();
      const [teamUp, setTeamUp] = useState(null);
      const [loading, setLoading] = useState(true);
      const [isOwnPost, setIsOwnPost] = useState(false);
      const [hasSentInterest, setHasSentInterest] = useState(false);
      const [isDialogOpen, setDialogOpen] = useState(false);

      const fetchData = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('team_ups')
          .select('*, profiles (id, display_name, username)')
          .eq('id', id)
          .single();

        if (error || !data) {
          toast({ variant: "destructive", title: "Not Found", description: "This team-up post could not be found." });
          navigate('/team-ups');
          return;
        }
        setTeamUp(data);

        if (user) {
          setIsOwnPost(user.id === data.created_by);
          const { data: interestData, error: interestError } = await supabase
            .from('team_up_interests')
            .select('id')
            .eq('team_up_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (interestError && interestError.code !== 'PGRST116') {
            toast({ variant: "destructive", title: "Error checking interest status." });
          }
          setHasSentInterest(!!interestData);
        }
        setLoading(false);
      }, [id, user, toast, navigate]);

      useEffect(() => {
        fetchData();
      }, [fetchData]);

      if (loading) return <div className="text-center py-20 text-2xl">Loading...</div>;
      if (!teamUp) return null;

      const pageTitle = `${teamUp.title} | Devconnect`;
      const pageDescription = teamUp.description ? teamUp.description.substring(0, 160) + '...' : `A team-up opportunity on Devconnect.`;
      const pageUrl = `https://dev-connect.com/team-ups/${teamUp.id}`;
      const imageUrl = "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3";

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
            <meta property="og:image" content={imageUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={pageUrl} />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
            <meta name="twitter:image" content={imageUrl} />
          </Helmet>
          <ExpressInterestDialog open={isDialogOpen} onOpenChange={setDialogOpen} teamUpId={teamUp.id} onInterestSent={fetchData} />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-glass p-8 rounded-lg border-glow">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-600/50 rounded-lg flex items-center justify-center">
                        <GitBranch className="text-green-300 w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{teamUp.title}</h1>
                        <Link to={`/profile/${teamUp.profiles.username}`} className="text-lg text-green-400 hover:underline">by {teamUp.profiles.display_name}</Link>
                    </div>
                </div>
                {!isOwnPost && (
                    <Button onClick={() => setDialogOpen(true)} disabled={hasSentInterest} className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
                        {hasSentInterest ? <><Check className="mr-2 h-4 w-4" /> Interest Sent</> : <><Send className="mr-2 h-4 w-4" /> Express Interest</>}
                    </Button>
                )}
              </div>
            </motion.div>

            <Tabs defaultValue="details" className="w-full mt-8">
                <TabsList className={`grid w-full ${isOwnPost ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <TabsTrigger value="details"><User className="mr-2 h-4 w-4" />Details</TabsTrigger>
                    {isOwnPost && <TabsTrigger value="interests"><Inbox className="mr-2 h-4 w-4" />Interested Users</TabsTrigger>}
                </TabsList>
                <TabsContent value="details" className="mt-6 bg-glass p-6 rounded-lg border-glow">
                    <h2 className="text-2xl font-bold mb-4">Project Details</h2>
                    <p className="text-lg text-gray-300 whitespace-pre-wrap mb-6">{teamUp.description}</p>
                    <h3 className="text-xl font-semibold mb-3">Roles Needed:</h3>
                    <div className="flex flex-wrap gap-2">
                        {teamUp.roles_needed?.map(role => (
                            <span key={role} className="bg-gray-700 text-gray-300 text-sm font-medium px-3 py-1.5 rounded-full">{role}</span>
                        ))}
                    </div>
                </TabsContent>
                {isOwnPost && (
                    <TabsContent value="interests" className="mt-6 bg-glass p-6 rounded-lg border-glow">
                        <InterestedUsersTab teamUpId={teamUp.id} />
                    </TabsContent>
                )}
            </Tabs>

            <div className="text-center mt-12">
              <Link to="/team-ups"><Button variant="outline" className="bg-transparent border-gray-600">Back to Team Ups</Button></Link>
            </div>
          </div>
        </>
      );
    }

    export default TeamUpDetailsPage;