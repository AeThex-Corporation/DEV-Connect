import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
  Briefcase, Users, MessageSquare, Rocket, 
  Code, Award, Building, Trophy,
  Clock, FileText, BarChart2, PieChart, 
  LayoutDashboard, DollarSign, Search, BookOpen,
  CreditCard, ScrollText, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, description, icon: Icon, to, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className="h-full"
  >
    <Link to={to} className="block h-full">
      <Card className="h-full bg-gray-900/50 border-gray-800 hover:border-blue-500/50 hover:bg-gray-900 transition-all duration-300 group flex flex-col overflow-hidden relative">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${color.replace('bg-', 'bg-')}`} />
        <CardHeader className="pb-4 relative z-10">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/50`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow relative z-10">
          <CardDescription className="text-gray-400 text-sm leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
        <CardFooter className="pt-4 border-t border-gray-800/50 relative z-10">
          <div className="w-full flex items-center justify-between text-sm font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Open Tool</span>
            <span className="text-lg">→</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  </motion.div>
);

const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-6 mt-8 border-b border-gray-800 pb-4">
    <div className="p-2 bg-blue-500/10 rounded-lg">
      <Icon className="w-5 h-5 text-blue-400" />
    </div>
    <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
  </div>
);

const DashboardPage = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Determine account type
  // Defaults to 'both' if undefined, but UI handles undefined case via banner below
  const isBusiness = profile?.account_type === 'business' || profile?.account_type === 'both' || profile?.user_type === 'client';
  const isContractor = profile?.account_type === 'contractor' || profile?.account_type === 'both' || !profile?.account_type; // Default to showing contractor tools if unset

  // Check if account_type is missing
  const showSetupBanner = !profile?.account_type;

  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-20">
      <Helmet>
        <title>Dashboard | Devconnect</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Welcome back, <span className="text-white font-semibold">{profile?.display_name || 'Developer'}</span>. Manage your work and growth.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:text-white">
               <Link to={`/profile/${profile?.username}`}>View Profile</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-500">
               <Link to="/post-a-job">Post a Job</Link>
            </Button>
          </div>
        </div>

        {/* Missing Account Type Banner */}
        {showSetupBanner && (
           <div className="mb-8 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4 flex items-center gap-4">
              <div className="p-2 bg-yellow-600/20 rounded-full">
                 <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="flex-grow">
                 <h3 className="text-lg font-semibold text-yellow-400">Complete your profile setup</h3>
                 <p className="text-yellow-200/80 text-sm">Please select your account type (Contractor or Business) to see the most relevant tools.</p>
              </div>
              <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-500 text-white border-none">
                 <Link to="/dashboard/settings">Complete Setup</Link>
              </Button>
           </div>
        )}

        {/* 1. Marketplace Section */}
        <SectionHeader title="Marketplace & Network" icon={Search} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <DashboardCard 
            title="Find Work" 
            description="Browse hundreds of active job listings and apply to projects."
            icon={Briefcase} 
            to="/jobs" 
            color="bg-blue-600"
            delay={0.1}
          />
          <DashboardCard 
            title="Hire Talent" 
            description="Find top-tier developers and designers for your next project."
            icon={Users} 
            to="/developers" 
            color="bg-purple-600"
            delay={0.15}
          />
          <DashboardCard 
            title="My Messages" 
            description="Check your inbox for new opportunities and team communications."
            icon={MessageSquare} 
            to="/messages" 
            color="bg-green-600"
            delay={0.2}
          />
          <DashboardCard 
            title="Studios" 
            description="Join or manage creative studios and developer collectives."
            icon={Building} 
            to="/studios" 
            color="bg-indigo-600"
            delay={0.25}
          />
        </div>

        {/* 2. Contractor Tools */}
        {isContractor && (
          <>
            <SectionHeader title="Contractor Tools" icon={Briefcase} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <DashboardCard 
                title="Time Tracker" 
                description="Log your work hours, manage sessions, and track productivity."
                icon={Clock} 
                to="/contractor/time-tracker" 
                color="bg-cyan-600"
                delay={0.3}
              />
              <DashboardCard 
                title="Invoices" 
                description="Create professional invoices, track payments, and manage billing."
                icon={FileText} 
                to="/contractor/invoices" 
                color="bg-pink-600"
                delay={0.35}
              />
              <DashboardCard 
                title="Hourly Rates" 
                description="Set your base rates and specialized service pricing for clients."
                icon={DollarSign} 
                to="/contractor/rates" 
                color="bg-emerald-600"
                delay={0.4}
              />
            </div>
          </>
        )}

        {/* 3. Analytics & Performance */}
        <SectionHeader title="Analytics & Insights" icon={BarChart2} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <DashboardCard 
            title="Analytics Dashboard" 
            description="Visual overview of your profile views, job applications, and earnings."
            icon={LayoutDashboard} 
            to="/dashboard/analytics" 
            color="bg-orange-600"
            delay={0.45}
          />
          <DashboardCard 
            title="Reports Generator" 
            description="Generate detailed PDF/CSV reports of your activity and finances."
            icon={PieChart} 
            to="/dashboard/reports" 
            color="bg-red-600"
            delay={0.5}
          />
        </div>

        {/* 4. Learning & Growth */}
        <SectionHeader title="Learning & Growth" icon={Trophy} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <DashboardCard 
            title="Foundation Courses" 
            description="Access premium courses to upgrade your skills and earn badges."
            icon={BookOpen} 
            to="/dashboard/foundation" 
            color="bg-yellow-600"
            delay={0.55}
          />
          <DashboardCard 
            title="Gamification" 
            description="Track your XP, level progress, and unlock new achievements."
            icon={Award} 
            to="/dashboard/gamification" 
            color="bg-rose-600"
            delay={0.6}
          />
        </div>

        {/* 5. Business Section (Conditional) */}
        {isBusiness && (
          <>
            <SectionHeader title="Business Suite" icon={Building} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <DashboardCard 
                title="Business Dashboard" 
                description="Manage your company profile, job postings, and team members."
                icon={LayoutDashboard} 
                to="/business/dashboard" 
                color="bg-slate-600"
                delay={0.65}
              />
               <DashboardCard 
                title="Billing & Plans" 
                description="Manage your subscription, view payment history and invoices."
                icon={CreditCard} 
                to="/business/billing" 
                color="bg-slate-600"
                delay={0.7}
              />
               <DashboardCard 
                title="Contractor Directory" 
                description="Browse your hired contractors and manage active contracts."
                icon={ScrollText} 
                to="/business/contractors" 
                color="bg-slate-600"
                delay={0.75}
              />
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;