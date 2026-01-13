import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/db';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  
  const planId = searchParams.get('plan_id');

  useEffect(() => {
    const verify = async () => {
        if(!user || !planId) return;
        try {
            // Simulate verifying webhook and updating DB
            await api.updateSubscriptionStatus(user.id, planId, 'active');
            
            // Log transaction for demo
            await api.createPaymentTransaction({
                business_id: user.id,
                amount: planId === 'pro' ? 4900 : 19900,
                status: 'succeeded',
                description: `Upgrade to ${planId.toUpperCase()}`
            });

        } catch(e) {
            console.error("Verification failed", e);
        } finally {
            setVerifying(false);
        }
    };
    verify();
  }, [user, planId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-glass p-8 rounded-2xl border border-green-500/30 text-center max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.2)]">
            {verifying ? (
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
                    <h2 className="text-xl font-bold">Confirming Payment...</h2>
                </div>
            ) : (
                <>
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                    <p className="text-gray-300 mb-8">Your subscription has been upgraded. You now have access to all premium features.</p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => navigate('/business/dashboard')} className="w-full bg-green-600 hover:bg-green-500">Go to Dashboard</Button>
                        <Button variant="ghost" onClick={() => navigate('/business/billing')}>View Billing Receipt</Button>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default PaymentSuccess;