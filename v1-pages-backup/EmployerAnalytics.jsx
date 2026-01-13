import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  FileText,
  Target,
  Calendar,
  Zap,
  Brain,
  ArrowUp,
  ArrowDown,
  Download
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function EmployerAnalytics() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState("all");
  const [timeRange, setTimeRange] = useState("30");
  const [aiInsights, setAiInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedJob, timeRange]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load employer's jobs
      const allJobs = await base44.entities.Job.filter({ employer_id: currentUser.id });
      setJobs(allJobs);

      // Load analytics data
      const analyticsData = await base44.entities.JobAnalytics.filter({ employer_id: currentUser.id });
      setAnalytics(analyticsData);

      // Load applications
      const allApplications = await base44.entities.Application.list();
      const myApplications = allApplications.filter(app => 
        allJobs.some(job => job.id === app.job_id)
      );
      setApplications(myApplications);

      // Generate AI insights
      if (allJobs.length > 0 && !aiInsights) {
        generateAIInsights(allJobs, analyticsData, myApplications);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (jobsData, analyticsData, applicationsData) => {
    setGeneratingInsights(true);
    try {
      const prompt = `
You are an AI analytics advisor analyzing hiring data for a Roblox game developer employer.

EMPLOYER'S JOB POSTINGS (${jobsData.length} total):
${jobsData.slice(0, 10).map((job, i) => `
${i + 1}. ${job.title}
   - Status: ${job.status}
   - Required Roles: ${job.required_roles?.join(', ')}
   - Posted: ${new Date(job.created_date).toLocaleDateString()}
   - Budget: ${job.budget_range}
   - Experience: ${job.experience_level}
`).join('\n')}

ANALYTICS SUMMARY:
- Total jobs posted: ${jobsData.length}
- Total applications received: ${applicationsData.length}
- Average applications per job: ${(applicationsData.length / jobsData.length).toFixed(1)}
- Open positions: ${jobsData.filter(j => j.status === 'Open').length}

APPLICATION TRENDS:
- Accepted: ${applicationsData.filter(a => a.status === 'Accepted').length}
- Under Review: ${applicationsData.filter(a => a.status === 'Under Review').length}
- Rejected: ${applicationsData.filter(a => a.status === 'Rejected').length}

PROVIDE COMPREHENSIVE INSIGHTS:
1. Hiring effectiveness analysis
2. Most in-demand roles/skills in your postings
3. Budget optimization recommendations
4. Timeline/response time analysis
5. Candidate quality trends
6. Skill/role gaps in the market
7. Job posting optimization tips
8. Competitive positioning advice
9. Seasonal hiring trends (if applicable)
10. Specific actionable recommendations

Be data-driven, specific, and actionable.
`;

      const insights = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_performance: {
              type: "object",
              properties: {
                score: { type: "number" },
                summary: { type: "string" },
                key_metrics: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            top_performing_jobs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  job_title: { type: "string" },
                  reason: { type: "string" },
                  applications: { type: "number" }
                }
              }
            },
            skill_demand_trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  demand_level: { type: "string" },
                  market_saturation: { type: "string" }
                }
              }
            },
            budget_recommendations: {
              type: "array",
              items: { type: "string" }
            },
            posting_optimization_tips: {
              type: "array",
              items: { type: "string" }
            },
            candidate_quality_analysis: {
              type: "object",
              properties: {
                average_quality: { type: "string" },
                insights: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            market_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap: { type: "string" },
                  opportunity: { type: "string" }
                }
              }
            },
            actionable_next_steps: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const calculateMetrics = () => {
    const filteredJobs = selectedJob === "all" ? jobs : jobs.filter(j => j.id === selectedJob);
    const jobIds = filteredJobs.map(j => j.id);
    const filteredApps = applications.filter(app => jobIds.includes(app.job_id));

    const totalViews = analytics
      .filter(a => jobIds.includes(a.job_id))
      .reduce((sum, a) => sum + (a.views || 0), 0);

    const applicationRate = totalViews > 0 ? ((filteredApps.length / totalViews) * 100).toFixed(1) : 0;
    
    return {
      totalJobs: filteredJobs.length,
      totalApplications: filteredApps.length,
      totalViews: totalViews,
      applicationRate: applicationRate,
      avgApplicationsPerJob: filteredJobs.length > 0 ? (filteredApps.length / filteredJobs.length).toFixed(1) : 0,
      acceptedApplications: filteredApps.filter(a => a.status === 'Accepted').length
    };
  };

  const getChartData = () => {
    // Generate time-series data for the last 30 days
    const days = parseInt(timeRange);
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayAnalytics = analytics.filter(a => {
        const aDate = new Date(a.date);
        return aDate.toDateString() === date.toDateString();
      });

      data.push({
        date: dateStr,
        views: dayAnalytics.reduce((sum, a) => sum + (a.views || 0), 0),
        applications: dayAnalytics.reduce((sum, a) => sum + (a.applications || 0), 0)
      });
    }

    return data;
  };

  const getRoleDistribution = () => {
    const roleCounts = {};
    jobs.forEach(job => {
      job.required_roles?.forEach(role => {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });
    });

    return Object.entries(roleCounts).map(([role, count]) => ({
      name: role,
      value: count
    }));
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const metrics = calculateMetrics();

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
          <h1 className="text-2xl font-bold text-white mb-2">
            <span className="gradient-text">Employer Analytics</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Comprehensive insights into your hiring performance
          </p>
        </div>

        <div className="flex gap-3">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="glass-card border-0 text-white w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="glass-card border-0 text-white w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button className="btn-primary text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                <ArrowUp className="w-3 h-3 mr-1" />
                12%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.totalViews}</p>
            <p className="text-xs text-gray-400">Total Views</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                <ArrowUp className="w-3 h-3 mr-1" />
                8%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.totalApplications}</p>
            <p className="text-xs text-gray-400">Applications</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                {metrics.applicationRate}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.avgApplicationsPerJob}</p>
            <p className="text-xs text-gray-400">Avg per Job</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                {metrics.acceptedApplications} hired
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.totalJobs}</p>
            <p className="text-xs text-gray-400">Active Jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      {aiInsights && (
        <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-400" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Performance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Overall Performance</h3>
                <Badge className="bg-green-500/20 text-green-400 border-0">
                  Score: {aiInsights.overall_performance?.score}/100
                </Badge>
              </div>
              <p className="text-gray-400 text-sm mb-3">{aiInsights.overall_performance?.summary}</p>
              <div className="grid md:grid-cols-3 gap-2">
                {aiInsights.overall_performance?.key_metrics?.map((metric, i) => (
                  <div key={i} className="glass-card rounded-lg p-2">
                    <p className="text-gray-300 text-xs">{metric}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Jobs */}
            {aiInsights.top_performing_jobs?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">🏆 Top Performing Jobs</h3>
                <div className="space-y-2">
                  {aiInsights.top_performing_jobs.map((job, i) => (
                    <div key={i} className="glass-card rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium text-sm">{job.job_title}</p>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                          {job.applications} apps
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs">{job.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Demand Trends */}
            {aiInsights.skill_demand_trends?.length > 0 && (
              <div>
                <h3 className="text-white font-semibold mb-3">📊 Skill Demand Analysis</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {aiInsights.skill_demand_trends.map((trend, i) => (
                    <div key={i} className="glass-card rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium text-sm">{trend.skill}</p>
                        <Badge className={`${
                          trend.demand_level === 'high' ? 'bg-red-500/20 text-red-400' :
                          trend.demand_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        } border-0 text-xs`}>
                          {trend.demand_level}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs">Market: {trend.market_saturation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Next Steps */}
            <div>
              <h3 className="text-white font-semibold mb-3">🎯 Recommended Actions</h3>
              <div className="space-y-2">
                {aiInsights.actionable_next_steps?.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 glass-card rounded-lg p-3">
                    <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="timeline">
            <Calendar className="w-4 h-4 mr-2" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Users className="w-4 h-4 mr-2" />
            Role Demand
          </TabsTrigger>
          <TabsTrigger value="candidates">
            <Target className="w-4 h-4 mr-2" />
            Candidate Quality
          </TabsTrigger>
        </TabsList>

        {/* Timeline Chart */}
        <TabsContent value="timeline">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Views & Applications Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="applications" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Distribution */}
        <TabsContent value="roles">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Required Roles Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getRoleDistribution()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getRoleDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6">
                {getRoleDistribution().map((role, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-gray-300 text-xs">{role.name} ({role.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidate Quality */}
        <TabsContent value="candidates">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Candidate Quality Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {aiInsights?.candidate_quality_analysis ? (
                <div className="space-y-4">
                  <div className="glass-card rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Average Quality Rating</p>
                    <p className="text-white text-2xl font-bold">{aiInsights.candidate_quality_analysis.average_quality}</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Key Insights</h3>
                    <div className="space-y-2">
                      {aiInsights.candidate_quality_analysis.insights?.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2 glass-card rounded-lg p-3">
                          <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Analyzing candidate quality...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}