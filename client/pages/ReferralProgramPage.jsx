import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Copy, Gift, Users, Star } from 'lucide-react';
    import { Link, useNavigate } from 'react-router-dom';

    const ReferralProgramPage = () => {
      const { user, profile, loading: authLoading, refreshProfile } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();
      const [referralCount, setReferralCount] = useState(0);
      const [loading, setLoading] = useState(true);
      const [localProfile, setLocalProfile] = useState(profile);

      const referralLink = localProfile?.referral_code ? `${window.location.origin}/signup?ref=${localProfile.referral_code}` : '';

      const ensureReferralCode = useCallback(async () => {
        if (user && localProfile && !localProfile.referral_code) {
          setLoading(true);
          try {
            const { data: newCodeData, error: codeError } = await supabase.rpc('generate_referral_code');
            if (codeError) throw codeError;

            const newCode = newCodeData;
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({ referral_code: newCode })
              .eq('id', user.id)
              .select()
              .single();

            if (updateError) throw updateError;
            
            setLocalProfile(updatedProfile);
            await refreshProfile(); // Sync with global context
            toast({ title: "Referral Code Generated!", description: "Your new referral code is ready." });
          } catch (error) {
            console.error("Error generating referral code:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not generate your referral code." });
          } finally {
            setLoading(false);
          }
        }
      }, [user, localProfile, refreshProfile, toast]);

      useEffect(() => {
        if (profile) {
          setLocalProfile(profile);
        }
      }, [profile]);

      useEffect(() => {
        if (authLoading) return;
        if (!user) {
          navigate('/login');
          return;
        }
        
        if (localProfile) {
            ensureReferralCode();
        }

        const fetchReferralCount = async () => {
          if (!localProfile?.id) return;
          setLoading(true);
          const { count, error } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', localProfile.id);
          
          if (!error) {
            setReferralCount(count || 0);
          }
          setLoading(false);
        };

        if (localProfile?.id) {
            fetchReferralCount();
        } else if (!authLoading) {
            setLoading(false);
        }

        if (localProfile?.id) {
            const channel = supabase.channel(`referrals:${localProfile.id}`)
              .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'referrals', filter: `referrer_id=eq.${localProfile.id}` },
                () => fetchReferralCount()
              ).subscribe();
            return () => supabase.removeChannel(channel);
        }
      }, [user, localProfile, authLoading, navigate, ensureReferralCode]);

      const copyToClipboard = () => {
        if (!referralLink) {
            toast({ variant: "destructive", title: "No link to copy", description: "Your referral link is being generated." });
            return;
        }
        navigator.clipboard.writeText(referralLink);
        toast({ title: "Copied!", description: "Referral link copied to clipboard." });
      };

      if (authLoading || loading || !localProfile) {
        return <div className="text-center py-20">Loading Referral Program...</div>;
      }

      return (
        <>
          <Helmet>
            <title>Referral Program | Devconnect</title>
            <meta name="description" content="Invite friends to Devconnect and earn rewards!" />
          </Helmet>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <Gift className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
              <h1 className="text-5xl font-bold tracking-tighter mb-4">Devconnect Referral Program</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Invite your friends to join the ultimate platform for Roblox creators and earn reputation for every successful referral.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-glass border-glow rounded-lg p-8 mt-12"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Your Unique Referral Link</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Input type="text" readOnly value={referralLink || 'Generating your link...'} className="bg-gray-900/70 text-lg text-center sm:text-left" />
                <Button onClick={copyToClipboard} size="lg" className="w-full sm:w-auto" disabled={!referralLink}>
                  <Copy className="mr-2 h-5 w-5" /> Copy Link
                </Button>
              </div>
              <p className="text-center text-gray-400 mt-4">Share this link anywhere to start earning!</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-glass border-glow rounded-lg p-8 text-center"
              >
                <Users className="mx-auto h-12 w-12 text-cyan-400 mb-4" />
                <div className="text-6xl font-bold text-cyan-400">{referralCount}</div>
                <p className="text-xl text-gray-300 mt-2">Successful Referrals</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-glass border-glow rounded-lg p-8 text-center"
              >
                <Star className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                <div className="text-6xl font-bold text-yellow-400">+{referralCount * 50}</div>
                <p className="text-xl text-gray-300 mt-2">Reputation Earned</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12"
            >
              <h2 className="text-3xl font-bold text-center mb-6">How It Works</h2>
              <div className="max-w-2xl mx-auto space-y-4 text-lg text-gray-300">
                <p>
                  <span className="font-bold text-white">1. Share your link:</span> Copy your personal referral link and share it with friends, on social media, or in your communities.
                </p>
                <p>
                  <span className="font-bold text-white">2. They sign up:</span> When someone clicks your link and successfully creates a Devconnect account, they count as your referral.
                </p>
                <p>
                  <span className="font-bold text-white">3. You get rewarded:</span> For every single successful referral, you instantly receive <span className="font-bold text-yellow-400">50 Reputation points</span> to boost your standing in the community.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      );
    };

    export default ReferralProgramPage;