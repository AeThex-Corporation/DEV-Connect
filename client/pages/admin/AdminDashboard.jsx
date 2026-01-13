import React, { useEffect, useState } from 'react';
import { getPlatformStats, getDailyStats } from '@/lib/db_analytics';
import { getAuditLogs } from '@/lib/admin_utils';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar 
} from 'recharts';
import { Users, Briefcase, CheckCircle, DollarSign, TrendingUp, Activity, ArrowUpRight, Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, trend, subtext, color = "indigo" }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col relative overflow-hidden group hover:border-zinc-700 transition-all">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
       <Icon className={`w-24 h-24 text-${color}-500`} />
    </div>
    <div className="flex items-center justify-between mb-4 z-10">
      <div className={`p-2.5 rounded-lg bg-${color}-500/10 text-${color}-500`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          {trend}%
        </div>
      )}
    </div>
    <h3 className="text-3xl font-bold text-white z-10 tracking-tight">{value}</h3>
    <p className="text-sm text-zinc-400 mt-1 z-10">{title}</p>
    {subtext && <p className="text-xs text-zinc-500 mt-4 pt-4 border-t border-zinc-800/50 z-10">{subtext}</p>}
  </div>
);

const ActivityItem = ({ log }) => (
  <div className="flex gap-4 py-4 border-b border-zinc-800/50 last:border-0 group hover:bg-zinc-900/30 px-2 rounded-lg transition-colors -mx-2">
    <div className="relative">
      <Avatar className="h-9 w-9 border border-zinc-700">
        <AvatarFallback className="bg-zinc-800 text-xs text-zinc-400">AD</AvatarFallback>
      </Avatar>
      <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5">
        <div className="bg-indigo-500 h-2.5 w-2.5 rounded-full ring-2 ring-zinc-900"></div>
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-zinc-200">
        <span className="font-medium text-white">Admin</span> performed <span className="font-medium text-indigo-400">{log.action_type.replace('_', ' ')}</span>
      </p>
      <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
        <Clock className="w-3 h-3" />
        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
        <span className="text-zinc-600">•</span>
        <span className="truncate">ID: {log.entity_id}</span>
      </p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, dailyData, logsData] = await Promise.all([
          getPlatformStats(),
          getDailyStats(14),
          getAuditLogs()
        ]);
        setStats(statsData);
        setChartData(dailyData);
        setAuditLogs(logsData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 bg-zinc-900 rounded-lg" />
        <Skeleton className="h-4 w-96 bg-zinc-900 rounded-lg" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         {[1,2,3,4].map(i => <Skeleton key={i} className="h-40 w-full bg-zinc-900 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 w-full bg-zinc-900 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Overview</h1>
        <p className="text-gray-400">Real-time insights and performance metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          trend={12}
          subtext="Total registered accounts"
          color="indigo"
        />
        <StatCard
          title="Active Jobs"
          value={stats?.totalJobs?.toLocaleString() || '0'}
          icon={Briefcase}
          trend={8}
          subtext="Open positions"
          color="purple"
        />
        <StatCard
          title="Verified Talent"
          value={stats?.activeContractors?.toLocaleString() || '0'}
          icon={CheckCircle}
          trend={4}
          subtext="Identity verified"
          color="emerald"
        />
        <StatCard
          title="Revenue Volume"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={24}
          subtext="Last 30 days processed"
          color="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800 shadow-none">
          <CardHeader>
            <CardTitle className="text-white">Growth Trajectory</CardTitle>
            <CardDescription className="text-zinc-400">New user signups vs job postings (14 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                    itemStyle={{ color: '#e4e4e7' }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="jobs" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorJobs)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 shadow-none flex flex-col">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> 
              Live Activity
            </CardTitle>
            <CardDescription className="text-zinc-400">Recent administrative actions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {auditLogs.length > 0 ? (
                auditLogs.map(log => <ActivityItem key={log.id} log={log} />)
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <Activity className="w-12 h-12 opacity-20 mb-2" />
                  <p className="text-sm">No recent activity recorded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;