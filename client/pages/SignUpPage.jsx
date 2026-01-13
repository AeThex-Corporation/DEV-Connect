import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Briefcase, Building2, Layers, UserPlus, ArrowRight, Check, X } from 'lucide-react';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  const [referralCode, setReferralCode] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [location.search]);

  // Check password match in real-time
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!displayName) {
      toast({ variant: "destructive", title: "Display Name Required", description: "Please enter a display name." });
      setLoading(false); return;
    }
    if (!accountType) {
      toast({ variant: "destructive", title: "Account Type Required", description: "Please select a role." });
      setLoading(false); return;
    }
    if (password.length < 6) {
        toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 6 characters." });
        setLoading(false); return;
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
      setLoading(false); return;
    }

    try {
      // Redirect to login page so AuthContext can pick up the session hash fragment automatically
      const redirectUrl = `${window.location.origin}/login`;

      const { data, error } = await signUp(email, password, {
        data: {
          display_name: displayName,
          referral_code: referralCode,
          account_type: accountType,
        },
        emailRedirectTo: redirectUrl
      });

      if (error) throw error;

      // If Supabase requires email verification, data.user might be returned but session will be null
      // If verification is disabled, session will be present.
      if (data.user && !data.session) {
        navigate('/verify-email', { state: { email } });
      } else if (data.user && data.session) {
         toast({ title: "Welcome!", description: "Account created successfully." });
         navigate('/onboarding');
      } else if (data.user && data.user.identities?.length === 0) {
         toast({ variant: "destructive", title: "Account Exists", description: "This email is already registered. Please log in." });
      }

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up | Devconnect</title>
        <meta name="description" content="Create your Devconnect account." />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center bg-grid-pattern p-4 relative overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg z-10"
        >
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="h-12 w-12 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h1>
              <p className="text-zinc-400">Join the community. Free forever.</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-zinc-300">Display Name</Label>
                <Input
                  id="display-name"
                  name="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. AlexDev"
                  required
                  className="bg-zinc-900/50 border-zinc-800 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account-type" className="text-zinc-300">I want to...</Label>
                <Select value={accountType} onValueChange={setAccountType} required>
                  <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800 text-white focus:ring-emerald-500/20">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="contractor" className="focus:bg-zinc-800 cursor-pointer py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-blue-500/10 rounded text-blue-400"><Briefcase className="w-4 h-4" /></div>
                        <div className="flex flex-col text-left">
                           <span className="font-medium">Find Work</span>
                           <span className="text-xs text-zinc-500">Looking for jobs</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="business" className="focus:bg-zinc-800 cursor-pointer py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-purple-500/10 rounded text-purple-400"><Building2 className="w-4 h-4" /></div>
                        <div className="flex flex-col text-left">
                           <span className="font-medium">Hire Talent</span>
                           <span className="text-xs text-zinc-500">Posting jobs</span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="both" className="focus:bg-zinc-800 cursor-pointer py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-green-500/10 rounded text-green-400"><Layers className="w-4 h-4" /></div>
                         <div className="flex flex-col text-left">
                           <span className="font-medium">Both</span>
                           <span className="text-xs text-zinc-500">I do everything</span>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  className="bg-zinc-900/50 border-zinc-800 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-zinc-300">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    minLength="6"
                    className="bg-zinc-900/50 border-zinc-800 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-zinc-300">Confirm</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retype password"
                      required
                      className={`bg-zinc-900/50 border-zinc-800 text-white focus:ring-emerald-500/20 pr-10 ${
                        !passwordsMatch ? 'border-red-500 focus:border-red-500' : 'focus:border-emerald-500/50'
                      }`}
                    />
                    {confirmPassword && (
                       <div className="absolute right-3 top-2.5">
                         {passwordsMatch ? (
                           <Check className="w-4 h-4 text-emerald-500" />
                         ) : (
                           <X className="w-4 h-4 text-red-500" />
                         )}
                       </div>
                    )}
                  </div>
                </div>
              </div>
              {!passwordsMatch && confirmPassword && (
                 <p className="text-xs text-red-400 mt-[-10px]">Passwords do not match</p>
              )}

              {referralCode && (
                <div className="bg-emerald-900/20 border border-emerald-800/50 text-emerald-300 text-sm rounded-xl p-3 text-center">
                  Referral Code: <span className="font-mono font-bold">{referralCode}</span>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-6 rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-300" 
                disabled={loading || !passwordsMatch}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                     <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                     Creating Account...
                  </span>
                ) : (
                   <span className="flex items-center gap-2">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
              <p className="text-sm text-zinc-500">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                  Log in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SignUpPage;