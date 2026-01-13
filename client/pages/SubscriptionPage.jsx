import React from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { CheckCircle, Zap, BarChart, Star, Users, Briefcase, DollarSign, Crown, Rocket, Gem, Building, Globe } from 'lucide-react';
    import { useStripeCheckout } from '@/hooks/useStripeCheckout';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    const Feature = ({ icon: Icon, text }) => (
      <div className="flex items-center gap-3">
        <div className="bg-green-500/20 p-2 rounded-full">
          <Icon className="text-green-400 w-5 h-5" />
        </div>
        <span className="text-lg text-gray-200">{text}</span>
      </div>
    );

    const TierCard = ({
      name,
      price,
      description,
      features,
      buttonText,
      buttonAction,
      isHighlighted = false,
      priceId = null,
      loading = false,
      currentTier = 'explorer',
      tierKey = 'explorer'
    }) => {
      const { toast } = useToast();
      const { redirectToCheckout } = useStripeCheckout();
      const isCurrentPlan = currentTier === tierKey;

      const handleButtonClick = async () => {
        if (isCurrentPlan) {
          toast({ title: "Current Plan", description: `You are already on the ${name} plan.` });
          return;
        }

        if (priceId) {
          const { data: keyData, error: keyError } = await supabase.functions.invoke('get-stripe-key');
          if (keyError || !keyData.publishableKey) {
              toast({
                  title: "Stripe Not Configured",
                  description: "The site owner needs to configure Stripe first. Please follow the setup guide.",
                  variant: "destructive",
              });
              return;
          }
          await redirectToCheckout(priceId);
        } else if (buttonAction) {
          buttonAction();
        } else {
          toast({
            title: "Feature Not Implemented",
            description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
            variant: "default",
          });
        }
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col bg-glass rounded-xl border-glow p-8 shadow-lg ${isHighlighted ? 'border-2 border-yellow-500' : 'border border-gray-700'}`}
        >
          <h3 className="text-3xl font-bold text-center mb-4">{name}</h3>
          <p className="text-5xl font-extrabold text-center mb-6">
            {price === 'Custom' ? 'Custom' : `$${price}`}
            {price !== 'Custom' && <span className="text-lg font-normal text-gray-400">/month</span>}
          </p>
          <p className="text-gray-300 text-center mb-8 flex-grow">{description}</p>
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <Feature key={index} icon={feature.icon} text={feature.text} />
            ))}
          </div>
          <Button
            onClick={handleButtonClick}
            disabled={loading || isCurrentPlan}
            className={`mt-auto w-full h-12 text-lg font-bold ${isCurrentPlan ? 'bg-gray-600 cursor-not-allowed' : isHighlighted ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'}`}
          >
            {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : buttonText}
          </Button>
        </motion.div>
      );
    };

    function SubscriptionPage() {
      const { loading: checkoutLoading } = useStripeCheckout();
      const { toast } = useToast();
      const { subscriptionTier } = useAuth();

      const tiers = [
        {
          name: 'Explorer',
          price: '0',
          description: 'The foundation of your journey. Discover opportunities and connect with the community.',
          features: [
            { icon: Users, text: 'Create a Basic Profile' },
            { icon: Briefcase, text: 'Browse Public Job Listings' },
            { icon: Globe, text: 'Browse Developer Directory' },
            { icon: CheckCircle, text: 'Limited Job Applications (5/month)' },
            { icon: CheckCircle, text: 'Limited Messaging' },
          ],
          buttonText: 'Your Plan',
          tierKey: 'explorer',
        },
        {
          name: 'Creator',
          price: '4.99',
          description: 'Your first step towards serious paid work. Build your reputation and expand your reach.',
          features: [
            { icon: CheckCircle, text: 'Everything in Explorer' },
            { icon: Rocket, text: 'Increased Job Applications (25/month)' },
            { icon: Star, text: 'Creator Profile Badge' },
            { icon: CheckCircle, text: 'Unlimited Messaging' },
            { icon: BarChart, text: 'See Profile Viewers' },
            { icon: CheckCircle, text: 'Remove On-site Ads' },
          ],
          buttonText: 'Upgrade to Creator',
          priceId: import.meta.env.VITE_STRIPE_CREATOR_PRICE_ID || 'price_1P9Y7sRqi0223O7g5E4XJv8g',
          tierKey: 'creator',
        },
        {
          name: 'Pro / Verified Developer',
          price: '12.99',
          description: 'Establish your professional brand. Get verified and unlock premium opportunities.',
          features: [
            { icon: CheckCircle, text: 'Everything in Creator' },
            { icon: Crown, text: 'Official Verification Badge' },
            { icon: Rocket, text: 'Profile Boost in Search Results' },
            { icon: CheckCircle, text: 'Unlimited Job Applications' },
            { icon: Gem, text: 'Advanced Portfolio Options' },
            { icon: BarChart, text: 'Profile Analytics' },
          ],
          buttonText: 'Upgrade to Pro',
          isHighlighted: true,
          priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_1P9Y7sRqi0223O7g5E4XJv8g',
          tierKey: 'pro',
        },
        {
          name: 'Studio / Recruiter',
          price: '39.99',
          description: 'The essential toolkit for serious hiring. Find and vet top talent quickly and efficiently.',
          features: [
            { icon: CheckCircle, text: 'Everything in Pro (for their own studio page)' },
            { icon: Briefcase, text: 'Post Multiple Job Listings (3-5 active)' },
            { icon: BarChart, text: 'Advanced Developer Search & Filters' },
            { icon: DollarSign, text: 'Direct Outreach to Any Developer' },
            { icon: CheckCircle, text: 'Applicant Tracking System (ATS)' },
            { icon: Users, text: 'Access to Curated Talent Pools' },
          ],
          buttonText: 'Upgrade to Studio',
          priceId: import.meta.env.VITE_STRIPE_STUDIO_PRICE_ID || 'price_1P9Y7sRqi0223O7g5E4XJv8g',
          tierKey: 'studio',
        },
        {
          name: 'Enterprise',
          price: 'Custom',
          description: 'For major studios and brands. Maximize visibility, efficiency, and strategic partnership.',
          features: [
            { icon: CheckCircle, text: 'Everything in Studio' },
            { icon: Briefcase, text: 'Unlimited Job Posts' },
            { icon: Star, text: 'Featured Company Profile & Listings' },
            { icon: Users, text: 'Dedicated Account Manager' },
            { icon: Globe, text: 'API Access for Integrations' },
            { icon: Rocket, text: 'Early Access to New Features' },
            { icon: Crown, text: 'Talent Scouting Assistance' },
          ],
          buttonText: 'Contact Sales',
          buttonAction: () => toast({ title: "Contact Sales", description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀" }),
          tierKey: 'enterprise',
        },
      ];

      return (
        <>
          <Helmet>
            <title>Subscription Tiers | Devconnect</title>
            <meta name="description" content="Explore Devconnect's subscription tiers: Explorer, Creator, Pro, Studio/Recruiter, and Enterprise. Unlock features to boost your career or find top talent." />
          </Helmet>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mt-4 text-white">Choose Your Path</h1>
              <p className="text-xl text-gray-400 mt-4 max-w-3xl mx-auto">
                Unlock powerful features designed to elevate your career or streamline your talent acquisition on Devconnect.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mt-16">
              {tiers.map((tier, index) => (
                <TierCard key={index} {...tier} loading={checkoutLoading} currentTier={subscriptionTier} />
              ))}
            </div>
          </div>
        </>
      );
    }

    export default SubscriptionPage;