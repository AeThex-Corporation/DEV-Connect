import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Label } from '@/components/ui/label';
import { LogIn, ArrowRight, AlertCircle } from 'lucide-react';

function LoginPage() {
  const { toast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        let errorMessage = "Could not sign in. Please check your credentials.";
        let errorTitle = "Login Failed";

        // Specific Supabase error handling
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Incorrect email or password. Please try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Your email is not verified. Please check your inbox for the verification link.";
          errorTitle = "Verification Required";
        }

        setLoginError(errorMessage);
        
        toast({
          variant: "destructive",
          title: errorTitle,
          description: errorMessage,
        });
      } else {
        // AuthContext and App.jsx will handle the redirect to Dashboard automatically
        toast({ title: "Welcome back!", description: "Logging you in..." });
      }
    } catch (err) {
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Devconnect</title>
        <meta name="description" content="Log in to your Devconnect account." />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center bg-grid-pattern p-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="h-12 w-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
              <p className="text-zinc-400">Enter your credentials to access your account.</p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-200 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <p>{loginError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  required 
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-300">Password</Label>
                  <Link to="/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-6 rounded-xl shadow-lg shadow-blue-900/20 transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
              <p className="text-sm text-zinc-500">
                Don't have an account yet?{' '}
                <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default LoginPage;