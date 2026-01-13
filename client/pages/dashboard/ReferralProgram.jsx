import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/db';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, Copy, Users, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ReferralProgram = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState({ count: 0, referrals: [] });
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    const init = async () => {
        if(!user) return;
        try {
            // Get or create gamification profile/referral code logic if implicitly needed
            // Assuming profile.referral_code exists or we construct link with User ID for simplicity in this demo
            const code = profile?.referral_code || user.id;
            setReferralLink(`${window.location.origin}/signup?ref=${code}`);
            
            const data = await api.getReferralData(user.id);
            setReferralData(data);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [user, profile]);

  const copyLink = () => {
      navigator.clipboard.writeText(referralLink);
      toast({ title: "Link Copied!" });
  };

  if(loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <Helmet><title>Referral Program | Devconnect</title></Helmet>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Referral Program</h1>
            <p className="text-gray-400">Invite friends and earn 50 XP for every verified sign up.</p>
        </div>

        <Card className="bg-glass border-glow mb-10">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-bold text-white mb-2">Your Unique Referral Link</h3>
                    <p className="text-sm text-gray-400 mb-4">Share this link on social media, blogs, or directly with friends.</p>
                    <div className="flex gap-2 max-w-md mx-auto md:mx-0">
                        <Input value={referralLink} readOnly className="bg-black/30 border-white/10" />
                        <Button onClick={copyLink} className="bg-blue-600 hover:bg-blue-500">
                            <Copy className="w-4 h-4 mr-2" /> Copy
                        </Button>
                    </div>
                </div>
                <div className="flex-shrink-0 bg-blue-500/10 p-6 rounded-full border border-blue-500/30">
                    <Gift className="w-12 h-12 text-blue-400" />
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
             <Card className="bg-glass border-glow">
                 <CardHeader><CardTitle className="text-lg">Total Referrals</CardTitle></CardHeader>
                 <CardContent><div className="text-3xl font-bold">{referralData.count}</div></CardContent>
             </Card>
             <Card className="bg-glass border-glow">
                 <CardHeader><CardTitle className="text-lg">Pending</CardTitle></CardHeader>
                 <CardContent><div className="text-3xl font-bold text-yellow-400">0</div></CardContent>
             </Card>
             <Card className="bg-glass border-glow">
                 <CardHeader><CardTitle className="text-lg">Total Earned</CardTitle></CardHeader>
                 <CardContent><div className="text-3xl font-bold text-green-400">{referralData.count * 50} XP</div></CardContent>
             </Card>
        </div>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-purple-400" /> Referred Users</h2>
        <div className="bg-glass rounded-xl border border-white/10 overflow-hidden">
            {referralData.referrals.length > 0 ? (
                <div className="divide-y divide-white/5">
                    {referralData.referrals.map(ref => (
                        <div key={ref.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={ref.referred?.avatar_url} />
                                    <AvatarFallback>{ref.referred?.display_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-white">{ref.referred?.display_name || 'User'}</p>
                                    <p className="text-xs text-gray-400">Joined {new Date(ref.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-green-400 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                Completed
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-gray-500">
                    No referrals yet. Share your link to get started!
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;