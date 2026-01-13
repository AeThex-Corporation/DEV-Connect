import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Download,
  Eye,
  ShoppingCart,
  Award,
  Video,
  MessageSquare,
  Calendar,
  TrendingDown,
  Activity
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days
  const [analytics, setAnalytics] = useState({
    revenue: [],
    assetPerformance: [],
    purchases: [],
    collabActivity: [],
    certifications: []
  });

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const daysAgo = parseInt(timeRange);
      const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      // Load all relevant data
      const [
        myAssets,
        allAssetPurchases,
        myPurchases,
        certifications,
        collabRooms,
        collabMessages,
        transactions
      ] = await Promise.all([
        base44.entities.Asset.filter({ seller_id: currentUser.id }),
        base44.entities.AssetPurchase.filter({ seller_id: currentUser.id }),
        base44.entities.AssetPurchase.filter({ buyer_id: currentUser.id }),
        base44.entities.Certification.filter({ user_id: currentUser.id }),
        base44.entities.CollabRoom.list(),
        base44.entities.CollabMessage.list(),
        base44.entities.PlatformTransaction.filter({ payer_id: currentUser.id })
      ]);

      // Process revenue data
      const revenueByDay = processRevenueData(allAssetPurchases, daysAgo);
      
      // Process asset performance
      const assetPerformance = myAssets.map(asset => {
        const purchases = allAssetPurchases.filter(p => p.asset_id === asset.id);
        const revenue = purchases.reduce((sum, p) => sum + p.price_paid, 0);
        
        return {
          name: asset.title,
          revenue: revenue,
          downloads: asset.downloads || 0,
          views: Math.floor(asset.downloads * (Math.random() * 5 + 5)), // Simulated views
          conversionRate: asset.downloads > 0 ? ((purchases.length / asset.downloads) * 100).toFixed(1) : 0,
          rating: asset.rating || 0
        };
      });

      // Process purchase history
      const purchasesByCategory = processPurchaseHistory(myPurchases);
      const spendingTrend = processSpendingTrend(myPurchases, daysAgo);

      // Process collaboration activity
      const myRooms = collabRooms.filter(room => 
        room.participant_ids?.includes(currentUser.id)
      );
      const myMessages = collabMessages.filter(msg => 
        msg.sender_id === currentUser.id
      );
      const collabActivity = processCollabActivity(myRooms, myMessages, daysAgo);

      setAnalytics({
        revenue: revenueByDay,
        assetPerformance: assetPerformance,
        purchases: purchasesByCategory,
        spendingTrend: spendingTrend,
        collabActivity: collabActivity,
        certifications: certifications,
        totalRevenue: allAssetPurchases.reduce((sum, p) => sum + p.price_paid, 0),
        totalSpent: myPurchases.reduce((sum, p) => sum + p.price_paid, 0),
        totalAssets: myAssets.length,
        totalPurchases: myPurchases.length,
        activeCollabRooms: myRooms.filter(r => r.status === 'active').length,
        totalMessages: myMessages.length
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processRevenueData = (purchases, days) => {
    const revenueByDay = {};
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      revenueByDay[dateStr] = 0;
    }

    // Sum revenue by day
    purchases.forEach(purchase => {
      const dateStr = purchase.created_date.split('T')[0];
      if (revenueByDay.hasOwnProperty(dateStr)) {
        revenueByDay[dateStr] += purchase.price_paid;
      }
    });

    return Object.entries(revenueByDay).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: revenue
    }));
  };

  const processPurchaseHistory = (purchases) => {
    const byCategory = {};
    purchases.forEach(purchase => {
      // We'd need to fetch asset details to get category, simulating for now
      const category = 'Unknown';
      byCategory[category] = (byCategory[category] || 0) + purchase.price_paid;
    });

    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  };

  const processSpendingTrend = (purchases, days) => {
    const spendingByDay = {};
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      spendingByDay[dateStr] = 0;
    }

    purchases.forEach(purchase => {
      const dateStr = purchase.created_date.split('T')[0];
      if (spendingByDay.hasOwnProperty(dateStr)) {
        spendingByDay[dateStr] += purchase.price_paid;
      }
    });

    return Object.entries(spendingByDay).map(([date, spending]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      spending: spending
    }));
  };

  const processCollabActivity = (rooms, messages, days) => {
    const activityByDay = {};
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      activityByDay[dateStr] = 0;
    }

    messages.forEach(msg => {
      const dateStr = msg.created_date.split('T')[0];
      if (activityByDay.hasOwnProperty(dateStr)) {
        activityByDay[dateStr]++;
      }
    });

    return Object.entries(activityByDay).map(([date, messages]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      messages: messages
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm">Comprehensive insights into your activity and performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="glass-card border-0 text-white px-4 py-2 rounded-lg"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">R${analytics.totalRevenue || 0}</p>
            <p className="text-gray-400 text-sm">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 text-blue-400" />
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.totalAssets || 0}</p>
            <p className="text-gray-400 text-sm">Assets Listed</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Video className="w-8 h-8 text-purple-400" />
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.activeCollabRooms || 0}</p>
            <p className="text-gray-400 text-sm">Active Collaborations</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-yellow-400" />
              <TrendingUp className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.certifications?.length || 0}</p>
            <p className="text-gray-400 text-sm">Certifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="revenue">
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="assets">
            <BarChart className="w-4 h-4 mr-2" />
            Asset Performance
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Purchase History
          </TabsTrigger>
          <TabsTrigger value="collaboration">
            <Video className="w-4 h-4 mr-2" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <Award className="w-4 h-4 mr-2" />
            Certifications
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Revenue Trends</CardTitle>
              <p className="text-gray-400 text-sm">Daily revenue from asset sales over time</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (R$)" />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="glass-card rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Average Daily Revenue</p>
                  <p className="text-white text-2xl font-bold">
                    R${(analytics.totalRevenue / parseInt(timeRange)).toFixed(2)}
                  </p>
                </div>
                <div className="glass-card rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Highest Single Day</p>
                  <p className="text-white text-2xl font-bold">
                    R${Math.max(...analytics.revenue.map(d => d.revenue), 0)}
                  </p>
                </div>
                <div className="glass-card rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Total Transactions</p>
                  <p className="text-white text-2xl font-bold">{analytics.totalPurchases || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Performance Tab */}
        <TabsContent value="assets">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Asset Performance Breakdown</CardTitle>
              <p className="text-gray-400 text-sm">Detailed metrics for each of your assets</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.assetPerformance.map((asset, i) => (
                  <div key={i} className="glass-card rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold text-lg">{asset.name}</h3>
                      <Badge className="bg-green-500/20 text-green-400 border-0">
                        R${asset.revenue}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <Eye className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{asset.views}</p>
                        <p className="text-gray-400 text-xs">Views</p>
                      </div>
                      <div className="text-center">
                        <Download className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{asset.downloads}</p>
                        <p className="text-gray-400 text-xs">Downloads</p>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{asset.conversionRate}%</p>
                        <p className="text-gray-400 text-xs">Conversion</p>
                      </div>
                      <div className="text-center">
                        <Award className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{asset.rating.toFixed(1)}</p>
                        <p className="text-gray-400 text-xs">Rating</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Performance Score</span>
                        <span className="text-white">{Math.min(100, Math.round((asset.views / 100) * 20 + asset.conversionRate * 2 + asset.rating * 10))}%</span>
                      </div>
                      <Progress 
                        value={Math.min(100, Math.round((asset.views / 100) * 20 + asset.conversionRate * 2 + asset.rating * 10))} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}

                {analytics.assetPerformance.length === 0 && (
                  <div className="text-center py-12">
                    <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No asset performance data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase History Tab */}
        <TabsContent value="purchases">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Spending Trends</CardTitle>
                <p className="text-gray-400 text-sm">Your purchase activity over time</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.spendingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    />
                    <Line type="monotone" dataKey="spending" stroke="#8b5cf6" strokeWidth={2} name="Spent (R$)" />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Spent</span>
                    <span className="text-white font-bold">R${analytics.totalSpent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Purchases</span>
                    <span className="text-white font-bold">{analytics.totalPurchases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Purchase</span>
                    <span className="text-white font-bold">
                      R${analytics.totalPurchases > 0 ? (analytics.totalSpent / analytics.totalPurchases).toFixed(2) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Purchase by Category</CardTitle>
                <p className="text-gray-400 text-sm">Where your money goes</p>
              </CardHeader>
              <CardContent>
                {analytics.purchases.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.purchases}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: R$${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.purchases.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No purchase data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaboration">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Collaboration Activity</CardTitle>
              <p className="text-gray-400 text-sm">Your engagement in collaboration rooms</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.collabActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Legend />
                  <Bar dataKey="messages" fill="#8b5cf6" name="Messages Sent" />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="glass-card rounded-lg p-4 text-center">
                  <Video className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{analytics.activeCollabRooms}</p>
                  <p className="text-gray-400 text-sm">Active Rooms</p>
                </div>
                <div className="glass-card rounded-lg p-4 text-center">
                  <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{analytics.totalMessages}</p>
                  <p className="text-gray-400 text-sm">Total Messages</p>
                </div>
                <div className="glass-card rounded-lg p-4 text-center">
                  <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {(analytics.totalMessages / parseInt(timeRange)).toFixed(1)}
                  </p>
                  <p className="text-gray-400 text-sm">Avg. Daily Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Certification Progress</CardTitle>
              <p className="text-gray-400 text-sm">Your acquired skills and certifications</p>
            </CardHeader>
            <CardContent>
              {analytics.certifications.length > 0 ? (
                <div className="space-y-4">
                  {analytics.certifications.map((cert, i) => (
                    <div key={i} className="glass-card rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{cert.skill_name}</h3>
                            <p className="text-gray-400 text-sm capitalize">{cert.certification_level} Level</p>
                          </div>
                        </div>
                        <Badge className={`${
                          cert.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        } border-0`}>
                          {cert.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Score</p>
                          <p className="text-white font-bold">{cert.score}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Percentile</p>
                          <p className="text-white font-bold">Top {100 - cert.percentile}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Issued</p>
                          <p className="text-white font-bold">
                            {new Date(cert.issued_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {cert.expiry_date && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                          </span>
                          {cert.certificate_url && (
                            <a
                              href={cert.certificate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              View Certificate →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No certifications yet</p>
                  <p className="text-gray-500 text-sm">Complete skill assessments to earn certifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}