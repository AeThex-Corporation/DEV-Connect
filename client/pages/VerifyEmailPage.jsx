import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <>
      <Helmet>
        <title>Check Your Email | Devconnect</title>
        <meta name="description" content="Verify your email address to continue." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-grid-pattern p-4 relative overflow-hidden">
         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
         <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center bg-zinc-950/80 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800/50 shadow-2xl"
        >
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-blue-500/10 mb-6 ring-1 ring-blue-500/20">
            <Mail className="h-10 w-10 text-blue-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">Verify Your Email</h1>
          
          <p className="text-zinc-400 mb-6 leading-relaxed">
            We've sent a verification link to{email ? ':' : ' your inbox.'}
            {email && (
              <span className="block mt-2 text-white font-medium bg-zinc-900/50 py-2 px-4 rounded-lg border border-zinc-800">
                {email}
              </span>
            )}
          </p>

          <div className="space-y-4 text-sm text-zinc-500 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/30 mb-8 text-left">
            <p className="flex gap-2">
              <span className="text-blue-400 font-bold">1.</span> Check your email inbox.
            </p>
            <p className="flex gap-2">
              <span className="text-blue-400 font-bold">2.</span> Click the verification link.
            </p>
             <p className="flex gap-2">
              <span className="text-blue-400 font-bold">3.</span> You will be automatically logged in!
            </p>
          </div>

          <div className="flex flex-col gap-3">
             <Button asChild variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                <Link to="/login">
                  Back to Login
                </Link>
             </Button>
             <p className="text-xs text-zinc-600 mt-2">
               Didn't receive the email? Check your spam folder.
             </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default VerifyEmailPage;