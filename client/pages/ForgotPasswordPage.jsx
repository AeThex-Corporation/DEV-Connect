import React, { useState } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { useToast } from '@/components/ui/use-toast';
    import { Link } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';

    function ForgotPasswordPage() {
      const { toast } = useToast();
      const [loading, setLoading] = useState(false);
      const [emailSent, setEmailSent] = useState(false);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const email = formData.get('email');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/password-reset`,
        });

        setLoading(false);
        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        } else {
          toast({
            title: "Check your email",
            description: "A password reset link has been sent to your email address.",
          });
          setEmailSent(true);
        }
      };

      return (
        <>
          <Helmet>
            <title>Forgot Password | Devconnect</title>
            <meta name="description" content="Reset your password for Devconnect." />
          </Helmet>

          <div className="px-6 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-wider">
                Forgot Password
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-10 leading-relaxed">
                No worries, we'll send you reset instructions. You can log in with your email address.
              </p>
            </motion.div>
          </div>

          <div className="max-w-md mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-glass p-8 rounded-lg border-glow"
            >
              {emailSent ? (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Email Sent!</h2>
                  <p className="text-gray-300 mb-6">Please check your inbox (and spam folder) for a link to reset your password.</p>
                  <Link to="/login">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg py-3 glow-effect">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              )}
              <p className="text-center text-sm text-gray-400 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="font-medium text-blue-400 hover:underline">
                  Log in
                </Link>
              </p>
            </motion.div>
          </div>
        </>
      );
    }

    export default ForgotPasswordPage;