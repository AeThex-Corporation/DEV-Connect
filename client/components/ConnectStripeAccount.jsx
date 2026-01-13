import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { RefreshCw, Zap } from 'lucide-react';

const ConnectStripeAccount = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    toast({
      title: 'Connecting to Stripe...',
      description: 'Please wait while we set up your Stripe Connect account.',
    });

    try {
      // Step 1: Create a Stripe Connect account if it doesn't exist
      const { data: accountData, error: accountError } = await supabase.functions.invoke('create-connect-account', {
        body: { user },
      });

      if (accountError) throw new Error(`Failed to create Stripe account: ${accountError.message}`);
      
      const { accountId } = accountData;

      // Immediately refresh profile to get the new stripe_connect_id
      await refreshProfile();

      // Step 2: Create an account link for onboarding
      const { data: linkData, error: linkError } = await supabase.functions.invoke('create-account-link', {
        body: { accountId },
      });
      
      if (linkError) throw new Error(`Failed to create Stripe onboarding link: ${linkError.message}`);
      
      const { url } = linkData;
      
      // Step 3: Redirect user to Stripe onboarding
      window.location.href = url;

    } catch (error) {
      console.error('Stripe Connect Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error Connecting Stripe',
        description: error.message || 'An unexpected error occurred. Please try again.',
      });
      setLoading(false);
    }
  };

  return (
    <div className="bg-glass border-glow rounded-lg p-6 text-center">
      <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Enable Payments</h3>
      <p className="text-gray-300 mb-6">Connect your Stripe account to receive payments for jobs and services directly through Devconnect.</p>
      <Button onClick={handleConnect} disabled={loading || !!profile?.stripe_connect_id}>
        {loading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : profile?.stripe_connect_id ? (
          'Stripe Account Connected'
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Connect with Stripe
          </>
        )}
      </Button>
      {profile?.stripe_connect_id && (
          <p className="text-xs text-green-400 mt-2">Your account is ready to receive payments.</p>
      )}
    </div>
  );
};

export default ConnectStripeAccount;