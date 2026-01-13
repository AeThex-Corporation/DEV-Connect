import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/db';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, CreditCard, Calendar, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const BillingDashboard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if(!user) return;
      try {
        const [subData, historyData] = await Promise.all([
            api.getBusinessSubscription(user.id),
            api.getPaymentHistory(user.id)
        ]);
        setSubscription(subData);
        setHistory(historyData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if(loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>;

  const planName = subscription?.subscription_plans?.name || 'Free Tier';
  const status = subscription?.status || 'active';
  const nextBilling = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A';

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
        <Helmet><title>Billing & Subscription | Devconnect</title></Helmet>
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <Card className="bg-glass border-glow">
                    <CardHeader>
                        <CardTitle className="text-lg flex justify-between items-center">
                            Current Plan
                            <Badge variant={status === 'active' ? 'default' : 'destructive'}>{status.toUpperCase()}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold text-white">{planName}</div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>Renews on {nextBilling}</span>
                        </div>
                        <div className="pt-4 flex gap-4">
                            <Button variant="outline" asChild>
                                <Link to="/business/upgrade">Change Plan</Link>
                            </Button>
                            {status === 'active' && planName !== 'Free Tier' && (
                                <Button variant="destructive" className="opacity-80 hover:opacity-100">Cancel Subscription</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-glass border-glow">
                    <CardHeader>
                        <CardTitle className="text-lg">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center h-full min-h-[160px]">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/10 p-3 rounded">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold">•••• •••• •••• 4242</p>
                                <p className="text-xs text-gray-400">Expires 12/25</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="sm" className="self-start text-blue-400 hover:text-blue-300 pl-0">Update Payment Method</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-glass rounded-xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold text-lg">Payment History</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {history.length > 0 ? history.map(tx => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div>
                                <p className="font-medium text-white">{tx.description || 'Subscription Charge'}</p>
                                <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-bold">${tx.amount / 100}</span>
                                <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10">{tx.status}</Badge>
                                <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-gray-500">No payment history found.</div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default BillingDashboard;