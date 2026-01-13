import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/db';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, Check, Star, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const SubscriptionPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansData, subData] = await Promise.all([
          api.getSubscriptionPlans(),
          user ? api.getBusinessSubscription(user.id) : Promise.resolve(null)
        ]);
        setPlans(plansData || []);
        setCurrentPlanId(subData?.plan_id || 'free');
      } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Error loading plans" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, toast]);

  const handleUpgrade = async (plan) => {
    if (!user) {
        navigate('/login');
        return;
    }
    setProcessing(plan.id);
    try {
        const { url } = await api.createCheckoutSession(user.id, plan.plan_id);
        // Normally we would redirect to Stripe URL
        // window.location.href = url;
        
        // For this mock environment, we redirect to our success handler manually
        navigate(url);
    } catch (e) {
        console.error(e);
        toast({ variant: "destructive", title: "Checkout failed", description: e.message });
    } finally {
        setProcessing(null);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <Helmet><title>Upgrade Plan | Devconnect</title></Helmet>
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Business Plan</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Scale your hiring with powerful tools and unlimited access to top talent.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map(plan => {
            const isCurrent = currentPlanId === plan.plan_id;
            const isPro = plan.plan_id === 'pro';
            const isEnt = plan.plan_id === 'enterprise';
            
            return (
                <Card key={plan.id} className={`bg-glass flex flex-col relative overflow-hidden ${isPro ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-white/10'}`}>
                    {isPro && <div className="absolute top-0 inset-x-0 h-1 bg-blue-500"></div>}
                    <CardHeader>
                        <CardTitle className="text-2xl flex justify-between items-center">
                            {plan.name}
                            {isPro && <Star className="w-5 h-5 text-yellow-400 fill-current" />}
                            {isEnt && <Shield className="w-5 h-5 text-purple-400" />}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {plan.price === 0 ? 'Free forever' : (
                                <span className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white">${plan.price / 100}</span>
                                    <span className="text-gray-400">/mo</span>
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <ul className="space-y-3">
                            {plan.features_json?.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                            <li className="flex items-start gap-3 text-sm text-gray-300">
                                <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Up to {plan.max_job_postings} Active Job Postings</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className={`w-full ${isPro ? 'bg-blue-600 hover:bg-blue-500' : isEnt ? 'bg-purple-600 hover:bg-purple-500' : 'bg-white/10 hover:bg-white/20'}`}
                            variant={isCurrent ? "outline" : "default"}
                            disabled={isCurrent || processing === plan.id}
                            onClick={() => handleUpgrade(plan)}
                        >
                            {processing === plan.id ? <Loader2 className="animate-spin w-4 h-4" /> : 
                             isCurrent ? "Current Plan" : "Upgrade Now"}
                        </Button>
                    </CardFooter>
                </Card>
            );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;