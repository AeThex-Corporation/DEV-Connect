
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  Code,
  Users,
  Briefcase,
  Shield,
  MessageSquare,
  CheckCircle,
  Rocket,
  LogIn,
  Mail,
  ArrowRight,
  Target,
  TrendingUp,
  Bell,
  X,
  Calendar,
  DollarSign,
  Eye,
  Building,
  Search
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Footer from "../components/Footer";
import WaitlistOnboarding from "../components/WaitlistOnboarding";

export default function Waitlist() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    user_type: "developer",
    primary_interest: "Finding Jobs",
    roblox_username: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [queuePosition, setQueuePosition] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [missions, setMissions] = useState({
    discord: false,
    twitter: false,
  });
  const [mySignup, setMySignup] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkAuth();
    loadWaitlistCount();
  }, []);

  useEffect(() => {
    const tryLoadMySignupFromQuery = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      if (emailParam) {
        setFormData(prev => ({ ...prev, email: emailParam }));
        const existing = await base44.entities.WaitlistSignup.filter({ email: emailParam });
        if (existing.length > 0) {
          setMySignup(existing[0]);
          setQueuePosition(existing[0].position_in_queue);
          setSubmitted(true);
        }
      }
    };
    tryLoadMySignupFromQuery();
  }, []);

  useEffect(() => {
    const loadReferralsForMySignup = async () => {
      if (mySignup?.id) {
        try {
          const myReferrals = await base44.entities.Referral.filter({
            referrer_id: mySignup.id
          });
          setReferrals(myReferrals);
        } catch (error) {
          console.error('Error loading referrals:', error);
        }
      }
    };
    loadReferralsForMySignup();
  }, [mySignup]);

  useEffect(() => {
    if (submitted && mySignup && !localStorage.getItem(`onboarding_seen_${mySignup.id}`)) {
      setShowOnboarding(true);
    }
  }, [submitted, mySignup]);

  const handleOnboardingComplete = () => {
    if (mySignup) {
      localStorage.setItem(`onboarding_seen_${mySignup.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWaitlistCount = async () => {
    try {
      const signups = await base44.entities.WaitlistSignup.list();
      setWaitlistCount(signups.length);
    } catch (error) {
      console.error('Error loading waitlist count:', error);
    }
  };

  const completeMission = async (missionType) => {
    if (!mySignup) return;
    setMissions({ ...missions, [missionType]: true });
    try {
      const newPosition = Math.max(1, mySignup.position_in_queue - 5);
      const updatedSignup = await base44.entities.WaitlistSignup.update(mySignup.id, {
        position_in_queue: newPosition
      });
      setQueuePosition(newPosition);
      setMySignup(updatedSignup);
      alert(`🎉 Mission completed! You moved up 5 spots in the queue!`);
    } catch (error) {
      console.error('Error updating position:', error);
      setMissions({ ...missions, [missionType]: false });
      alert('Failed to complete mission. Please try again.');
    }
  };

  const handleReferralShare = async (platform) => {
    const referralUrl = `${window.location.origin}${createPageUrl('Waitlist')}?ref=${mySignup?.referral_code}`;
    if (platform === 'copy') {
      navigator.clipboard.writeText(referralUrl);
      alert('Referral link copied! Share with friends to move up the queue.');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=Join me on Devconnect - the future of Roblox development!&url=${encodeURIComponent(referralUrl)}`, '_blank');
    } else if (platform === 'discord') {
      navigator.clipboard.writeText(referralUrl);
      alert('Referral link copied! Share it in Discord to earn referral credits.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.full_name) {
      alert('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const existing = await base44.entities.WaitlistSignup.filter({ email: formData.email });
      if (existing.length > 0) {
        setMySignup(existing[0]);
        setQueuePosition(existing[0].position_in_queue);
        setSubmitted(true);
        setSubmitting(false);
        return;
      }
      const isAethexDev = formData.email.toLowerCase().endsWith('@aethex.dev');
      const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      let newQueuePosition;
      let priorityTier = 'standard';
      let verified = false;
      if (isAethexDev) {
        const priorityUsers = await base44.entities.WaitlistSignup.filter({ priority_tier: 'vip' });
        newQueuePosition = priorityUsers.length + 1;
        priorityTier = 'vip';
        verified = true;
      } else {
        newQueuePosition = waitlistCount + 1;
      }
      const signup = await base44.entities.WaitlistSignup.create({
        ...formData,
        position_in_queue: newQueuePosition,
        referral_code: referralCode,
        verified: verified,
        priority_tier: priorityTier
      });
      setMySignup(signup);
      setQueuePosition(signup.position_in_queue);
      setSubmitted(true);
      setWaitlistCount(waitlistCount + 1);
      if (isAethexDev) {
        alert('🎉 Welcome Aethex team member! You\'ve been verified and moved to priority access.');
      }
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        const referrer = await base44.entities.WaitlistSignup.filter({ referral_code: refCode });
        if (referrer.length > 0) {
          const referrerNewPosition = Math.max(1, referrer[0].position_in_queue - 10);
          await base44.entities.WaitlistSignup.update(referrer[0].id, {
            position_in_queue: referrerNewPosition
          });
          await base44.entities.Referral.create({
            referrer_id: referrer[0].id,
            referred_email: formData.email,
            referred_user_id: signup.id,
            referral_code: refCode,
            status: 'signed_up',
            signed_up_date: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const features = [
    { icon: Briefcase, title: "Job Board", description: "Browse and apply for Roblox development opportunities" },
    { icon: Users, title: "Developer Profiles", description: "Showcase your portfolio and skills" },
    { icon: MessageSquare, title: "Direct Messaging", description: "Communicate directly with developers and employers" },
    { icon: Search, title: "Advanced Search", description: "Find jobs and developers with powerful filters" },
    { icon: Shield, title: "Verified Profiles", description: "Build trust with verified developer profiles" },
    { icon: Eye, title: "Portfolio Showcase", description: "Display your best work to potential employers" }
  ];

  const advancedFeatures = [
    { icon: Sparkles, title: "AI Job Matching", description: "Get matched with perfect opportunities using AI", phase: 3 },
    { icon: Target, title: "AI Talent Scout", description: "Employers can find developers automatically", phase: 3 },
    { icon: Users, title: "Real-Time Collaboration", description: "Code together with built-in tools", phase: 2 },
    { icon: DollarSign, title: "Asset Marketplace", description: "Buy and sell Roblox assets securely", phase: 4 },
    { icon: Shield, title: "Secure Escrow", description: "Protected payments with milestone tracking", phase: 2 },
    { icon: TrendingUp, title: "Advanced Analytics", description: "Deep insights into your career growth", phase: 3 }
  ];

  const roles = [
    { icon: Code, name: "Scripters", color: "indigo" },
    { icon: Building, name: "Builders", color: "purple" },
    { icon: Users, name: "3D Modelers", color: "pink" },
    { icon: Sparkles, name: "UI/UX Designers", color: "blue" }
  ];

  const roadmapPhases = [
    {
      phase: 1,
      name: "MVP Launch",
      timeline: "Q1 2026",
      status: "launching",
      features: [
        "Job posting and browsing",
        "Developer profiles with portfolios",
        "Direct messaging system",
        "Application tracking",
        "Basic search and filters",
        "Company profiles"
      ]
    },
    {
      phase: 2,
      name: "Community & Trust",
      timeline: "Q2 2026",
      status: "planned",
      features: [
        "Secure escrow system with milestones",
        "Rating and review system",
        "Community forums",
        "Real-time collaboration tools",
        "Team formation features",
        "Skill verification"
      ]
    },
    {
      phase: 3,
      name: "AI-Powered Features",
      timeline: "Q3 2026",
      status: "planned",
      features: [
        "AI job matching (80%+ accuracy)",
        "AI talent scout for employers",
        "AI career coach",
        "Skill gap analyzer",
        "AI-generated project ideas",
        "Smart recommendations"
      ]
    },
    {
      phase: 4,
      name: "Marketplace & Growth",
      timeline: "Q4 2026",
      status: "planned",
      features: [
        "Asset marketplace",
        "Premium courses",
        "Mentorship marketplace",
        "Advanced analytics dashboard",
        "Achievement system",
        "Gamification features"
      ]
    },
    {
      phase: 5,
      name: "Enterprise & Scale",
      timeline: "2027",
      status: "planned",
      features: [
        "Enterprise team tools",
        "White-label solutions",
        "API access",
        "Advanced integrations",
        "Custom workflows",
        "Priority support"
      ]
    }
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      color: "from-gray-500 to-gray-600",
      features: [
        "Create developer profile",
        "Apply to unlimited jobs",
        "5 portfolio projects",
        "Basic messaging",
        "Job alerts",
        "Community forum access"
      ],
      cta: "Sign Up Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "For serious developers",
      color: "from-indigo-500 to-purple-500",
      features: [
        "Everything in Free",
        "Verified developer badge",
        "10 portfolio projects",
        "AI job matching",
        "Priority in search results",
        "Advanced analytics",
        "Remove platform branding",
        "Early access to features"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Premium",
      price: "$29.99",
      period: "/month",
      description: "For top performers",
      color: "from-purple-500 to-pink-500",
      features: [
        "Everything in Pro",
        "Featured profile placement",
        "Unlimited portfolio projects",
        "Monthly strategy call",
        "Custom profile URL",
        "Advanced AI tools",
        "Priority support",
        "Mentorship access",
        "Premium badge"
      ],
      cta: "Go Premium",
      popular: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For studios and teams",
      color: "from-orange-500 to-red-500",
      features: [
        "Everything in Premium",
        "Team management tools",
        "Unlimited job postings",
        "Dedicated account manager",
        "Custom integrations",
        "White-label options",
        "API access",
        "Advanced recruiting tools"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {showOnboarding && (
        <WaitlistOnboarding
          onComplete={handleOnboardingComplete}
          mySignup={mySignup}
        />
      )}

      <style>{`
        .nav-glass { background-color: rgba(10, 10, 10, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .glass-card { background-color: rgba(255, 255, 255, 0.05); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .btn-primary { background-image: linear-gradient(to right, #4f46e5, #3b82f6); transition: all 0.2s ease-in-out; }
        .btn-primary:hover { background-image: linear-gradient(to right, #4338ca, #2563eb); }
        .gradient-text { background-image: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .card-hover:hover { background-color: rgba(255, 255, 255, 0.1); transform: translateY(-5px); transition: all 0.3s ease-in-out; }
        @keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.4; } }
        .animate-pulse { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
        .animate-bounce { animation: bounce 1s infinite; }
        @media (max-width: 768px) { .mobile-spacing { padding-left: 1rem; padding-right: 1rem; } .mobile-text-sm { font-size: 0.875rem; } .mobile-compact { gap: 0.75rem; } }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-16">
            <div className="flex items-center space-x-2">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d9d1f385dfdd1e5c5c92d0/c5979f609_Gemini_Generated_Image_q227rdq227rdq2271.png" alt="Devconnect Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} className="sm:w-10 sm:h-10" />
              <span className="text-white font-bold text-lg sm:text-xl">Devconnect</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs hidden sm:inline-flex">Early Access</Badge>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <Button onClick={() => window.location.href = createPageUrl("Dashboard")} className="btn-primary text-white text-sm sm:text-base px-3 sm:px-4 py-2">Dashboard</Button>
              ) : (
                <Button onClick={handleLogin} variant="outline" className="glass-card border-white/20 text-white hover:bg-white/5 text-sm sm:text-base px-3 sm:px-4 py-2">
                  <LogIn className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Log In</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                🚀 Launching Q1 2026
              </Badge>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
                The Job Board for <span className="gradient-text">Roblox Developers</span>
              </h1>
              <p className="text-base sm:text-xl text-gray-400">
                Connect with top studios and talented developers. A focused platform for finding Roblox development opportunities.
              </p>

              {!submitted ? (
                <Card className="glass-card border-0 p-4 sm:p-6" id="waitlist-form">
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Full Name *</label>
                        <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} placeholder="John Doe" required className="bg-white/5 border-white/10 text-white placeholder-gray-500 text-sm sm:text-base" />
                      </div>
                      <div>
                        <label className="text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Email *</label>
                        <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" required className="bg-white/5 border-white/10 text-white placeholder-gray-500 text-sm sm:text-base" />
                        {formData.email.toLowerCase().endsWith('@aethex.dev') && (
                          <p className="text-green-400 text-xs mt-1">✓ Verified Aethex team member - Priority access</p>
                        )}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">I am a... *</label>
                        <Select value={formData.user_type} onValueChange={(value) => setFormData({...formData, user_type: value})}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm sm:text-base"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="employer">Employer/Studio</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Primary Interest</label>
                        <Select value={formData.primary_interest} onValueChange={(value) => setFormData({...formData, primary_interest: value})}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm sm:text-base"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Finding Jobs">Finding Jobs</SelectItem>
                            <SelectItem value="Hiring Developers">Hiring Developers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-white text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 block">Roblox Username (Optional)</label>
                      <Input value={formData.roblox_username} onChange={(e) => setFormData({...formData, roblox_username: e.target.value})} placeholder="@YourUsername" className="bg-white/5 border-white/10 text-white placeholder-gray-500 text-sm sm:text-base" />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full btn-primary text-white text-base sm:text-lg py-5 sm:py-6">
                      {submitting ? 'Joining...' : (<><Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />Join the Waitlist</>)}
                    </Button>
                    <p className="text-gray-500 text-xs text-center">
                      {waitlistCount > 0 ? `${waitlistCount} developers already on the waitlist` : 'Be the first to join!'}
                    </p>
                  </form>
                </Card>
              ) : (
                <Tabs defaultValue="status" className="w-full">
                  <TabsList className="glass-card border-0 mb-3 sm:mb-4 grid w-full grid-cols-3 text-xs sm:text-sm">
                    <TabsTrigger value="status">Status</TabsTrigger>
                    <TabsTrigger value="referrals">Referrals ({referrals.length})</TabsTrigger>
                    <TabsTrigger value="missions">Missions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="status">
                    <Card className="glass-card border-0 p-6 sm:p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                      <div className="text-center">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">You're on the list! 🎉</h3>
                        {mySignup?.verified && (
                          <div className="mb-3 sm:mb-4">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs sm:text-sm">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified Aethex Team
                            </Badge>
                          </div>
                        )}
                        <div className="mb-3 sm:mb-4">
                          <p className="text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">
                            You're <strong className="text-white text-2xl sm:text-3xl">#{queuePosition}</strong> in line
                            {mySignup?.priority_tier === 'vip' && (<span className="text-green-400 ml-2">(Priority Access)</span>)}
                          </p>
                          <Progress value={Math.max(0, 100 - (queuePosition / (waitlistCount || 1)) * 100)} className="h-2 mb-1" />
                          <p className="text-gray-400 text-xs">{waitlistCount - (queuePosition || 0)} people behind you</p>
                        </div>
                        <p className="text-gray-400 text-sm sm:text-base mb-5 sm:mb-6">
                          We'll notify you at <strong className="text-white">{formData.email}</strong> when we launch.
                        </p>
                        <div className="glass-card rounded-lg p-3 sm:p-4 bg-indigo-500/5 mb-3 sm:mb-4">
                          <p className="text-indigo-400 font-medium text-xs sm:text-sm">
                            {formData.user_type === 'developer' ? '💼 For Developers' : formData.user_type === 'employer' ? '🏢 For Employers' : '🤝 For Both'}
                          </p>
                          <p className="text-gray-300 text-xs">
                            {formData.primary_interest === 'Finding Jobs' && "Get early access to exclusive Roblox development opportunities before anyone else!"}
                            {formData.primary_interest === 'Hiring Developers' && "Be first to access our pool of verified Roblox developers with proven skills!"}
                          </p>
                        </div>
                        <div className="glass-card rounded-lg p-3 sm:p-4 bg-purple-500/5 mb-5 sm:mb-6">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />
                            <div className="text-left flex-1">
                              <p className="text-white font-medium text-xs sm:text-sm">Join Our Discord Community</p>
                              <p className="text-gray-400 text-xs">Connect with other waitlist members</p>
                            </div>
                            <Button onClick={() => window.open('https://discord.gg/athx', '_blank')} size="sm" className="btn-primary text-white text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3">
                              Join
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                  <TabsContent value="referrals">
                    <Card className="glass-card border-0 p-4 sm:p-6">
                      <div className="text-center mb-5 sm:mb-6">
                        <h3 className="text-xl sm:text-xl font-bold text-white mb-2">Move Up Faster! 🚀</h3>
                        <p className="text-gray-400 text-sm">Each friend who joins moves you up <strong className="text-green-400">10 spots</strong></p>
                      </div>
                      <div className="glass-card rounded-lg p-3 sm:p-4 bg-white/5 mb-3 sm:mb-4">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <p className="text-gray-400 text-sm">Your Referral Link</p>
                          <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">{referrals.length} referrals</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Input readOnly value={`${window.location.origin}${createPageUrl('Waitlist')}?ref=${mySignup?.referral_code}`} className="bg-white/5 border-white/10 text-white text-xs sm:text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4">
                        <Button onClick={() => handleReferralShare('copy')} size="sm" className="glass-card border-0 text-white hover:bg-white/5 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3">📋 Copy</Button>
                        <Button onClick={() => handleReferralShare('twitter')} size="sm" className="glass-card border-0 text-white hover:bg-white/5 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3">🐦 Tweet</Button>
                        <Button onClick={() => handleReferralShare('discord')} size="sm" className="glass-card border-0 text-white hover:bg-white/5 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3">💬 Discord</Button>
                      </div>
                      {referrals.length > 0 && (
                        <div className="space-y-2 mt-3 sm:mt-4">
                          <p className="text-gray-400 text-xs font-medium">Your Referrals:</p>
                          {referrals.map((ref, i) => (
                            <div key={i} className="glass-card rounded p-3 flex items-center justify-between">
                              <div>
                                <p className="text-white text-sm">{ref.referred_email}</p>
                                <p className="text-gray-500 text-xs">{new Date(ref.signed_up_date).toLocaleDateString()}</p>
                              </div>
                              <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">+10 spots</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </TabsContent>
                  <TabsContent value="missions">
                    <Card className="glass-card border-0 p-4 sm:p-6">
                      <div className="text-center mb-5 sm:mb-6">
                        <h3 className="text-xl sm:text-xl font-bold text-white mb-2">Complete Missions 🎯</h3>
                        <p className="text-gray-400 text-sm">Each mission moves you up <strong className="text-blue-400">5 spots</strong></p>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          { id: 'discord', icon: MessageSquare, title: 'Join Discord Server', description: 'Connect with the community', color: 'purple', url: 'https://discord.gg/athx' },
                          { id: 'twitter', icon: Users, title: 'Follow on Twitter', description: 'Stay updated with news', color: 'blue', url: 'https://twitter.com/devlink' }
                        ].map((mission) => (
                          <div key={mission.id} className={`glass-card rounded-lg p-3 sm:p-4 ${missions[mission.id] ? 'bg-green-500/5' : 'bg-white/5'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3">
                                {missions[mission.id] ? (
                                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                                ) : (
                                  <mission.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${mission.color}-400`} />
                                )}
                                <div>
                                  <p className="text-white font-medium text-sm">{mission.title}</p>
                                  <p className="text-gray-400 text-xs">{mission.description}</p>
                                </div>
                              </div>
                              {!missions[mission.id] && (
                                <Button onClick={() => { if (mission.url) window.open(mission.url, '_blank'); completeMission(mission.id); }} size="sm" className="btn-primary text-white text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3">
                                  {mission.id === 'discord' ? 'Join' : 'Follow'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="glass-card border-0 p-6 text-center card-hover">
                    <Bell className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-white">{waitlistCount}</p>
                    <p className="text-gray-400 text-sm">On Waitlist</p>
                  </Card>
                  <Card className="glass-card border-0 p-6 text-center card-hover">
                    <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-white">Q1</p>
                    <p className="text-gray-400 text-sm">2026 Launch</p>
                  </Card>
                  <Card className="glass-card border-0 p-6 text-center card-hover">
                    <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-white">Free</p>
                    <p className="text-gray-400 text-sm">Beta Access</p>
                  </Card>
                  <Card className="glass-card border-0 p-6 text-center card-hover">
                    <Rocket className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-white">Early</p>
                    <p className="text-gray-400 text-sm">Access</p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card border-0 grid w-full grid-cols-4 mb-8 p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="roadmap" className="text-xs sm:text-sm">Roadmap</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs sm:text-sm">Pricing</TabsTrigger>
            <TabsTrigger value="faq" className="text-xs sm:text-sm">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-12">
            {/* Core MVP Features */}
            <section>
              <div className="text-center mb-10">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">
                  <Rocket className="w-3 h-3 mr-1" />
                  Launching Q1 2026
                </Badge>
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                  MVP Core Features
                </h2>
                <p className="text-gray-400 text-lg">
                  Everything you need to find jobs or hire developers on day one
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="glass-card rounded-2xl p-5 hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mb-3">
                      <feature.icon className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Future Features */}
            <section>
              <div className="text-center mb-10">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Coming Soon
                </Badge>
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                  The Full <span className="gradient-text">Vision</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  We're building the most advanced platform for Roblox developers
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedFeatures.map((feature, i) => (
                  <div key={i} className="glass-card rounded-2xl p-5 hover:bg-white/10 transition-all border-l-2 border-purple-500/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                        Phase {feature.phase}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Roles */}
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                  For All <span className="gradient-text">Roblox Roles</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {roles.map((role, i) => (
                  <Card key={i} className="glass-card border-0 p-6 text-center card-hover">
                    <role.icon className={`w-12 h-12 text-${role.color}-400 mx-auto mb-3`} />
                    <p className="text-white font-medium">{role.name}</p>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-12">
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                  Our <span className="gradient-text">5-Phase Launch Plan</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  From MVP to the most powerful platform for Roblox developers
                </p>
              </div>

              <div className="space-y-6">
                {roadmapPhases.map((phase, i) => (
                  <Card key={i} className={`glass-card border-0 ${
                    phase.status === 'launching' 
                      ? 'bg-gradient-to-br from-green-500/10 to-emerald-600/5 border-l-4 border-green-500' 
                      : 'bg-gradient-to-br from-purple-500/5 to-indigo-600/5 border-l-4 border-purple-500/30'
                  }`}>
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                            phase.status === 'launching' ? 'bg-green-500' : 'bg-purple-500/20'
                          }`}>
                            {phase.status === 'launching' ? (
                              <Rocket className="w-8 h-8 text-white" />
                            ) : (
                              <span className="text-2xl font-bold text-white">{phase.phase}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${
                                phase.status === 'launching' 
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                              } text-xs`}>
                                {phase.timeline}
                              </Badge>
                              {phase.status === 'launching' && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs animate-pulse">
                                  LAUNCHING SOON
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-2xl font-bold text-white">{phase.name}</h3>
                          </div>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {phase.features.map((feature, j) => (
                          <div key={j} className="flex items-start gap-2 bg-white/5 rounded-lg p-3">
                            <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                              phase.status === 'launching' ? 'text-green-400' : 'text-purple-400'
                            }`} />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Beta Access CTA */}
              <Card className="glass-card border-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 mt-8">
                <CardContent className="p-8 text-center">
                  <Rocket className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Want Early Access?
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                    Waitlist members get priority access to each phase as we launch. Join now to be first in line!
                  </p>
                  {!submitted && (
                    <Button
                      onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg px-8 py-6"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Join the Waitlist
                    </Button>
                  )}
                  {submitted && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-lg px-6 py-3">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      You're Already on the List! 🎉
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-12">
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                  Simple, <span className="gradient-text">Transparent Pricing</span>
                </h2>
                <p className="text-gray-400 text-lg mb-6">
                  Choose the plan that's right for you
                </p>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  🎁 Waitlist members get 14-day free trial of Premium
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingTiers.map((tier, i) => (
                  <Card key={i} className={`glass-card border-0 relative ${
                    tier.popular ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20' : ''
                  }`}>
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-indigo-500 text-white border-0 px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}>
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-white">{tier.price}</span>
                        <span className="text-gray-400 text-sm ml-1">{tier.period}</span>
                      </div>
                      <Button 
                        className={`w-full mb-6 ${
                          tier.popular 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                            : 'glass-card border-0 text-white hover:bg-white/5'
                        }`}
                        onClick={() => !submitted && document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        {tier.cta}
                      </Button>
                      <div className="space-y-3">
                        {tier.features.map((feature, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Employer Pricing */}
              <div className="mt-12">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">For Employers</h3>
                  <p className="text-gray-400">Powerful tools to find and hire the best talent</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="glass-card border-0">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-bold text-white mb-2">Free</h4>
                      <p className="text-3xl font-bold text-white mb-4">$0<span className="text-sm text-gray-400">/mo</span></p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          1 job posting per month
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          Basic candidate search
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          Standard support
                        </li>
                      </ul>
                      <Button className="w-full glass-card border-0 text-white hover:bg-white/5">
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-0 ring-2 ring-indigo-500">
                    <CardContent className="p-6">
                      <Badge className="bg-indigo-500 text-white border-0 mb-2">Popular</Badge>
                      <h4 className="text-lg font-bold text-white mb-2">Business</h4>
                      <p className="text-3xl font-bold text-white mb-4">$99<span className="text-sm text-gray-400">/mo</span></p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          10 job postings per month
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          AI Talent Scout
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          Featured job listings
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          Advanced analytics
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          Priority support
                        </li>
                      </ul>
                      <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        Start Trial
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-0">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-bold text-white mb-2">Enterprise</h4>
                      <p className="text-3xl font-bold text-white mb-4">Custom</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          Unlimited job postings
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          Team collaboration tools
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          Dedicated account manager
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          Custom integrations
                        </li>
                        <li className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                          White-label options
                        </li>
                      </ul>
                      <Button className="w-full glass-card border-0 text-white hover:bg-white/5">
                        Contact Sales
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="faq" className="space-y-12">
            <section>
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                  Frequently Asked <span className="gradient-text">Questions</span>
                </h2>
              </div>
              <div className="space-y-3 max-w-3xl mx-auto">
                {[
                  { q: "When will Devconnect launch?", a: "We're targeting Q1 2026 for beta access to waitlist members." },
                  { q: "Is Devconnect free to use?", a: "Yes! The core platform is free for both developers and employers." },
                  { q: "What makes Devconnect different?", a: "We're laser-focused on Roblox development jobs with a clean, simple interface." },
                  { q: "Can I join the beta?", a: "Yes! Join the waitlist to get early access when we launch." }
                ].map((faq, i) => (
                  <div key={i} className="glass-card rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-2 flex items-center text-base">
                      <MessageSquare className="w-4 h-4 text-indigo-400 mr-2" />
                      {faq.q}
                    </h3>
                    <p className="text-gray-400 text-sm pl-6">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA */}
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-3">Be Among the First</h2>
              <p className="text-lg text-gray-400 mb-6">
                Join {waitlistCount > 0 ? waitlistCount : ''} {waitlistCount > 1 ? 'other developers' : 'developers'} preparing for launch
              </p>
              {!submitted && (
                <Button onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })} size="lg" className="btn-primary text-white text-lg px-8 py-6">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Join the Waitlist Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}
