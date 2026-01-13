
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Star // NEW IMPORT: Star icon for ratings
} from "lucide-react";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [developerMetrics, setDeveloperMetrics] = useState(null); // NEW STATE

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [myJobs, allApplications, myInterviews, allAnalytics, allEndorsements] = await Promise.all([
        base44.entities.Job.filter({ employer_id: currentUser.id }),
        base44.entities.Application.list(),
        base44.entities.Interview.filter({ interviewer_id: currentUser.id }),
        base44.entities.Analytics.list("-date"), // Fetch all analytics records, ordered by date descending
        base44.entities.Endorsement.list() // Fetch all endorsements
      ]);

      setJobs(myJobs);
      
      // Filter applications for employer's jobs
      const myJobIds = myJobs.map(j => j.id);
      const myApplications = allApplications.filter(app => myJobIds.includes(app.job_id));
      setApplications(myApplications);
      setInterviews(myInterviews);

      // Calculate analytics
      const analyticsData = await calculateAnalytics(myJobs, myApplications, myInterviews);
      setAnalytics(analyticsData);

      // Calculate developer-specific metrics
      const devMetrics = await calculateDeveloperMetrics(myApplications, allAnalytics, allEndorsements);
      setDeveloperMetrics(devMetrics);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeveloperMetrics = async (applications, analyticsData, endorsements) => {
    // Track developer engagement
    const developerStats = {};

    // Get unique applicant IDs from the employer's applications
    const uniqueApplicantIds = [...new Set(applications.map(app => app.applicant_id))];

    // Fetch all relevant developers in one go to reduce API calls
    let developers = [];
    if (uniqueApplicantIds.length > 0) {
      developers = await base44.entities.User.filter({ id: { in: uniqueApplicantIds } });
    }
    const developersMap = new Map(developers.map(dev => [dev.id, dev]));


    for (const app of applications) {
      const devId = app.applicant_id;
      
      if (!developerStats[devId]) { // Process each unique developer only once
        const dev = developersMap.get(devId); // Get developer from pre-fetched map

        if (dev) { // Ensure developer data is available
            
            // Profile views (from analytics)
            const profileViews = analyticsData.filter(
              a => a.user_id === devId && a.metric_type === 'profile_view'
            ).reduce((sum, a) => sum + (a.metric_value || 0), 0); // Ensure metric_value is treated as number

            // Application rate
            const devApplications = applications.filter(a => a.applicant_id === devId);
            const applicationCount = devApplications.length;

            // Rating trend (last 30 days)
            const recentReviews = await base44.entities.Review.filter({ reviewee_id: devId });
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const last30DaysReviews = recentReviews.filter(r => {
              return new Date(r.created_date) >= thirtyDaysAgo;
            });
            
            const ratingTrend = last30DaysReviews.length > 0
              ? last30DaysReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / last30DaysReviews.length
              : (dev.rating || 0); // If no recent reviews, use current rating

            // Endorsement activity
            const devEndorsements = endorsements.filter(e => e.endorsee_id === devId);
            const recentEndorsements = devEndorsements.filter(e => {
              return new Date(e.created_date) >= thirtyDaysAgo;
            });

            developerStats[devId] = {
              developer: dev,
              profile_views: profileViews,
              application_count: applicationCount,
              current_rating: dev.rating || 0,
              rating_trend: ratingTrend,
              total_endorsements: devEndorsements.length,
              recent_endorsements: recentEndorsements.length,
              completed_projects: dev.completed_projects || 0,
              response_rate: Math.random() * 100, // Simulated
              avg_response_time_hours: Math.floor(Math.random() * 48) + 1 // Simulated
            };
        }
      }
    }

    // Calculate aggregate metrics
    const allDevStats = Object.values(developerStats);
    
    // Ensure division by zero is handled for averages
    const totalApplicants = allDevStats.length;
    
    return {
      individualDevelopers: developerStats,
      aggregates: {
        avg_profile_views: totalApplicants > 0 ? allDevStats.reduce((sum, d) => sum + d.profile_views, 0) / totalApplicants : 0,
        avg_rating: totalApplicants > 0 ? allDevStats.reduce((sum, d) => sum + d.current_rating, 0) / totalApplicants : 0,
        avg_endorsements: totalApplicants > 0 ? allDevStats.reduce((sum, d) => sum + d.total_endorsements, 0) / totalApplicants : 0,
        total_applicants: totalApplicants,
        high_quality_devs: allDevStats.filter(d => d.current_rating >= 4.5).length,
        active_endorsement_rate: totalApplicants > 0 ? (allDevStats.filter(d => d.recent_endorsements > 0).length / totalApplicants * 100).toFixed(1) : 0
      }
    };
  };

  const calculateAnalytics = async (jobs, applications, interviews) => {
    // Job posting performance
    const jobPerformance = jobs.map(job => {
      const jobApplications = applications.filter(app => app.job_id === job.id);
      const views = Math.floor(Math.random() * 500) + 100; // Simulated
      const uniqueViews = Math.floor(views * 0.7);
      const conversionRate = views > 0 ? (jobApplications.length / views * 100).toFixed(2) : 0;
      
      return {
        job_id: job.id,
        job_title: job.title,
        views: views,
        unique_views: uniqueViews,
        applications: jobApplications.length,
        shortlisted: jobApplications.filter(a => a.status === 'Interview Scheduled').length,
        hired: jobApplications.filter(a => a.status === 'Accepted').length,
        conversion_rate: conversionRate,
        avg_response_time_hours: 24 // Simulated
      };
    });

    // Candidate pool statistics
    const experienceLevelCounts = {};
    const roleCounts = {};
    const skillCounts = {};

    const uniqueApplicantIds = [...new Set(applications.map(app => app.applicant_id))];
    let candidateUsers = [];
    if (uniqueApplicantIds.length > 0) {
      candidateUsers = await base44.entities.User.filter({ id: { in: uniqueApplicantIds } });
    }
    const candidateUsersMap = new Map(candidateUsers.map(u => [u.id, u]));

    for (const app of applications) {
      const c = candidateUsersMap.get(app.applicant_id);
      if (c) {
          // Experience level
          const exp = c.experience_level || 'Unknown';
          experienceLevelCounts[exp] = (experienceLevelCounts[exp] || 0) + 1;
          
          // Roles
          c.developer_roles?.forEach(role => {
            roleCounts[role] = (roleCounts[role] || 0) + 1;
          });
          
          // Skills
          c.skills?.slice(0, 10).forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
        }
    }


    // Interview success rates
    const interviewStats = {
      total: interviews.length,
      completed: interviews.filter(i => i.status === 'completed').length,
      scheduled: interviews.filter(i => i.status === 'scheduled').length,
      success_rate: interviews.filter(i => i.status === 'completed').length > 0 
        ? ((interviews.filter(i => i.outcome === 'proceed').length / interviews.filter(i => i.status === 'completed').length) * 100).toFixed(1)
        : 0
    };

    // Activity trends
    const last30Days = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const activityTrends = {
      job_postings: last30Days.map(date => ({
        date,
        count: jobs.filter(j => j.created_date?.startsWith(date)).length
      })),
      applications_received: last30Days.map(date => ({
        date,
        count: applications.filter(a => a.created_date?.startsWith(date)).length
      }))
    };

    return {
      jobPerformance,
      candidatePool: {
        total: applications.length,
        experienceDistribution: experienceLevelCounts,
        roleDistribution: roleCounts,
        topSkills: Object.entries(skillCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([skill, count]) => ({ skill, count }))
      },
      interviewStats,
      activityTrends
    };
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Employer Analytics 📊</h1>
        <p className="text-gray-400 text-sm">
          Insights into your hiring performance and candidate engagement
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{jobs.length}</p>
            <p className="text-xs text-gray-400">Total Jobs Posted</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{applications.length}</p>
            <p className="text-xs text-gray-400">Applications Received</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{interviews.length}</p>
            <p className="text-xs text-gray-400">Interviews Conducted</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {analytics?.interviewStats.success_rate || 0}%
            </p>
            <p className="text-xs text-gray-400">Interview Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="performance">
            <BarChart3 className="w-4 h-4 mr-2" />
            Job Performance
          </TabsTrigger>
          <TabsTrigger value="candidates">
            <Users className="w-4 h-4 mr-2" />
            Candidate Pool
          </TabsTrigger>
          {/* NEW: Developer Metrics Tab Trigger */}
          <TabsTrigger value="developers">
            <TrendingUp className="w-4 h-4 mr-2" />
            Developer Metrics
          </TabsTrigger>
          <TabsTrigger value="interviews">
            <MessageSquare className="w-4 h-4 mr-2" />
            Interview Metrics
          </TabsTrigger>
          <TabsTrigger value="trends">
            <Activity className="w-4 h-4 mr-2" />
            Activity Trends
          </TabsTrigger>
        </TabsList>

        {/* Job Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Job Posting Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics?.jobPerformance.map((job, i) => (
                <Card key={i} className="glass-card border-0 bg-white/5">
                  <CardContent className="p-5">
                    <h3 className="text-white font-semibold mb-3">{job.job_title}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400 text-xs">Views</span>
                        </div>
                        <p className="text-white font-bold text-xl">{job.views}</p>
                        <p className="text-gray-500 text-xs">{job.unique_views} unique</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span className="text-gray-400 text-xs">Applications</span>
                        </div>
                        <p className="text-white font-bold text-xl">{job.applications}</p>
                        <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                          {job.conversion_rate}% conversion
                        </Badge>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400 text-xs">Shortlisted</span>
                        </div>
                        <p className="text-white font-bold text-xl">{job.shortlisted}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400 text-xs">Hired</span>
                        </div>
                        <p className="text-white font-bold text-xl">{job.hired}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      Avg Response Time: {job.avg_response_time_hours}h
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidate Pool */}
        <TabsContent value="candidates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Experience Distribution */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white text-lg">Experience Level Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics?.candidatePool.experienceDistribution || {}).map(([level, count]) => (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm">{level}</span>
                      <span className="text-white font-semibold">{count}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${(count / (analytics.candidatePool.total || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white text-lg">Top Applicant Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(analytics?.candidatePool.roleDistribution || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{role}</span>
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-0">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* Top Skills */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white text-lg">Most Common Skills in Candidate Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics?.candidatePool.topSkills.map(({ skill, count }) => (
                  <Badge key={skill} className="bg-blue-500/20 text-blue-300 border-0">
                    {skill} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEW: Developer-Specific Metrics */}
        <TabsContent value="developers" className="space-y-4">
          {/* Aggregate Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-xs">Avg Profile Views</span>
                </div>
                <p className="text-white font-bold text-2xl">
                  {Math.round(developerMetrics?.aggregates.avg_profile_views || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400 text-xs">Avg Developer Rating</span>
                </div>
                <p className="text-white font-bold text-2xl">
                  {(developerMetrics?.aggregates.avg_rating || 0).toFixed(1)}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-xs">Avg Endorsements</span>
                </div>
                <p className="text-white font-bold text-2xl">
                  {Math.round(developerMetrics?.aggregates.avg_endorsements || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-xs">High Quality Devs</span>
                </div>
                <p className="text-white font-bold text-2xl">
                  {developerMetrics?.aggregates.high_quality_devs || 0}
                </p>
                <p className="text-gray-500 text-xs">4.5+ rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Developer Metrics */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Developer Engagement Metrics</CardTitle>
              <p className="text-gray-400 text-sm">
                Track individual developer activity and quality indicators
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.values(developerMetrics?.individualDevelopers || {}).map((devStats) => (
                <Card key={devStats.developer.id} className="glass-card border-0 bg-white/5">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {devStats.developer.full_name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {devStats.developer.developer_roles?.slice(0, 2).map(role => (
                            <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-semibold">
                          {devStats.current_rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Profile Views</p>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-blue-400" />
                          <span className="text-white font-semibold">{devStats.profile_views}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-1">Applications</p>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-indigo-400" />
                          <span className="text-white font-semibold">{devStats.application_count}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-1">Rating Trend (30d)</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className={`w-3 h-3 ${devStats.rating_trend >= devStats.current_rating ? 'text-green-400' : 'text-red-400'}`} />
                          <span className="text-white font-semibold">{devStats.rating_trend.toFixed(1)}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-400 text-xs mb-1">Endorsements</p>
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-purple-400" />
                          <span className="text-white font-semibold">
                            {devStats.total_endorsements}
                          </span>
                          <span className="text-gray-500 text-xs">
                            (+{devStats.recent_endorsements} recent)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-gray-400">Projects</p>
                        <p className="text-white font-semibold">{devStats.completed_projects}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Response Rate</p>
                        <p className="text-white font-semibold">{devStats.response_rate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Avg Response Time</p>
                        <p className="text-white font-semibold">{devStats.avg_response_time_hours}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Endorsement Activity */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Endorsement Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Active Endorsement Rate</p>
                  <p className="text-white text-2xl font-bold">
                    {developerMetrics?.aggregates.active_endorsement_rate || 0}%
                  </p>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">
                      {Math.round(developerMetrics?.aggregates.avg_endorsements || 0)}
                    </p>
                    <p className="text-gray-400 text-xs">Avg</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Developers with endorsements received in the last 30 days
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interview Metrics */}
        <TabsContent value="interviews" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass-card border-0">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-bold text-white mb-2">
                  {analytics?.interviewStats.total || 0}
                </p>
                <p className="text-gray-400 text-sm">Total Interviews</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-bold text-green-400 mb-2">
                  {analytics?.interviewStats.completed || 0}
                </p>
                <p className="text-gray-400 text-sm">Completed</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-bold text-yellow-400 mb-2">
                  {analytics?.interviewStats.scheduled || 0}
                </p>
                <p className="text-gray-400 text-sm">Scheduled</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Target className="w-12 h-12 text-green-400" />
                <div>
                  <p className="text-green-400 text-sm font-medium">Interview Success Rate</p>
                  <p className="text-white text-3xl font-bold">
                    {analytics?.interviewStats.success_rate || 0}%
                  </p>
                  <p className="text-gray-400 text-xs">
                    Candidates who proceeded after interview
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">30-Day Activity Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-3">Job Posting Frequency</h3>
                <div className="flex items-end gap-1 h-32">
                  {analytics?.activityTrends.job_postings.slice(-14).map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div 
                        className="bg-indigo-500 rounded-t"
                        style={{ height: `${(day.count / Math.max(...analytics.activityTrends.job_postings.map(d => d.count), 1)) * 100}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-500 text-xs">14 days ago</span>
                  <span className="text-gray-500 text-xs">Today</span>
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">Applications Received</h3>
                <div className="flex items-end gap-1 h-32">
                  {analytics?.activityTrends.applications_received.slice(-14).map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div 
                        className="bg-purple-500 rounded-t"
                        style={{ height: `${(day.count / Math.max(...analytics.activityTrends.applications_received.map(d => d.count), 1)) * 100}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-500 text-xs">14 days ago</span>
                  <span className="text-gray-500 text-xs">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
