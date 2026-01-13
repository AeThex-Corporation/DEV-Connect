import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

let stripePromise;

const getStripe = async () => {
  if (!stripePromise) {
    const { data, error } = await supabase.functions.invoke('get-stripe-key');
    if (error) {
      console.error('Failed to fetch Stripe publishable key:', error);
      return null;
    }
    stripePromise = loadStripe(data.publishableKey);
  }
  return stripePromise;
};

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const redirectToCheckout = async (priceId) => {
    setLoading(true);

    try {
      const stripe = await getStripe();
      if (!stripe) {
        toast({
          variant: 'destructive',
          title: 'Stripe Error',
          description: 'Stripe is not configured correctly. Please contact support.',
        });
        setLoading(false);
        return;
      }

      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({ priceId }),
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: error.message || 'An unexpected error occurred.',
      });
      setLoading(false);
    }
  };

  return { redirectToCheckout, loading };
};