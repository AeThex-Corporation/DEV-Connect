import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUserAnalytics } from '@/lib/db_analytics';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DollarSign, Briefcase, Star, Clock } from 'lucide-react';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserAnalytics(user.id).then(data => {
        setAnalytics(data);
        setLoading(false);
      }).catch(err => {
          console.error("Failed to load analytics", err);
          setLoading(false);
      });
    }
  }, [user]);

  // Mock data for visualization
  const earningsData = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1900 },
    { month: 'Mar', amount: 1500 },
    { month: 'Apr', amount: 2400 },
    { month: 'May', amount: 2100 },
    { month: 'Jun', amount: 3200 },
  ];

  if (loading) return <div className="p-8 text-center text-white">Loading analytics...</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold text-white mb-8">My Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Earnings</CardTitle>
            <DollarSign className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${analytics?.earnings?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0).toLocaleString() || 0}</div>
            <p className="text-xs text-gray-500">Lifetime</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Jobs Completed</CardTitle>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.jobsCompleted || 0}</div>
            <p className="text-xs text-gray-500">Projects delivered</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Rating</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.avgRating || 'N/A'}</div>
            <p className="text-xs text-gray-500">Client feedback</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Est. Hours</CardTitle>
            <Clock className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">142h</div>
            <p className="text-xs text-gray-500">Logged time (demo)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white">Earnings History</CardTitle>
                <CardDescription>Your income over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={earningsData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="month" stroke="#9CA3AF" tickLine={false} axisLine={false} />
                            <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Area type="monotone" dataKey="amount" stroke="#10B981" fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white">Job Success Rate</CardTitle>
                <CardDescription>Completion vs Cancellation</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] flex items-center justify-center relative">
                     {/* Simplified visual representation */}
                     <div className="relative w-48 h-48 rounded-full border-[12px] border-gray-800 flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-full h-full rounded-full border-[12px] border-blue-600 border-l-transparent border-b-transparent rotate-45 opacity-80"></div>
                        <div className="text-center">
                            <span className="text-4xl font-bold text-white">92%</span>
                            <p className="text-xs text-gray-400 uppercase mt-1">Success</p>
                        </div>
                     </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;