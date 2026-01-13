import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { api } from '@/lib/db';
import { Loader } from '@/components/Loader';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  Briefcase,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const report = await api.getAnalyticsReport();
        setData(report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader /></div>;

  return (
    <>
      <Helmet>
        <title>Analytics | Devconnect</title>
      </Helmet>

      <div className="min-h-screen pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              Platform Analytics
            </h1>
            <p className="text-gray-400">Real-time insights into network performance.</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-glass border-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{data.overview.totalUsers}</div>
                <div className="flex items-center text-green-400 text-xs mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" /> +12% this month
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-glass border-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{data.overview.conversionRate}%</div>
                <div className="text-xs text-gray-500 mt-1">Signup to Verified</div>
              </CardContent>
            </Card>

            <Card className="bg-glass border-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{data.overview.totalJobs}</div>
              </CardContent>
            </Card>

            <Card className="bg-glass border-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{data.overview.totalApps}</div>
              </CardContent>
            </Card>
          </div>

          {/* Funnel Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-glass rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Conversion Funnel</h3>
              
              <div className="space-y-6">
                {data.funnel.map((step, i) => (
                  <div key={step.step} className="relative">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span className="font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: step.fill}}></span>
                        {step.step}
                      </span>
                      <span>{step.value}</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step.value / data.overview.totalUsers) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: step.fill }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="space-y-6">
               <Card className="bg-glass border border-white/10">
                 <CardHeader>
                   <CardTitle className="text-lg text-white">Engagement Targets</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Verification Goal</span>
                      <span className="text-green-400 text-sm font-bold">85%</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full w-[85%]"></div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-gray-400 text-sm">Response Time</span>
                      <span className="text-yellow-400 text-sm font-bold">&lt; 24h</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                       <div className="bg-yellow-500 h-full w-[60%]"></div>
                    </div>
                 </CardContent>
               </Card>

               <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20">
                 <div className="flex items-start gap-4">
                   <Target className="w-8 h-8 text-blue-400 shrink-0" />
                   <div>
                     <h4 className="font-bold text-white mb-1">Pro Tip</h4>
                     <p className="text-sm text-gray-400">Increasing verification completion rates by 10% correlates with a 25% increase in job fulfillment.</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsDashboard;