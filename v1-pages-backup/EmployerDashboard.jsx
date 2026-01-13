
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// AIDeveloperMatcher is replaced by AITalentScout
// import AIDeveloperMatcher from "../components/AIDeveloperMatcher";
import InterviewScheduler from "../components/InterviewScheduler";
import OfferLetterGenerator from "../components/OfferLetterGenerator";
import AITalentScout from '../components/AITalentScout'; // New import
import {
  Briefcase,
  Users,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Plus,
  Building,
  BarChart3,
  UserCheck,
  Send,
  Sparkles,
  Palette,
  Brain,
  Wand2,
  X,
  FileText
} from "lucide-react";

export default function EmployerDashboard() {
  const [user, setUser] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0,
    scheduled: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);
  // Removed showAIMatcher as AITalentScout replaces its functionality
  // const [showAIMatcher, setShowAIMatcher] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showOfferGenerator, setShowOfferGenerator] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeTab, setActiveTab] = useState("applications");
  const [showTalentScout, setShowTalentScout] = useState(false); // New state
  const [selectedJobForScout, setSelectedJobForScout] = useState(null); // New state

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load company profile
      const profiles = await base44.entities.CompanyProfile.filter({ user_id: currentUser.id });
      const profile = profiles[0];
      setCompanyProfile(profile);

      // Load jobs
      const employerJobs = await base44.entities.Job.filter({ employer_id: currentUser.id }, '-created_date');
      setJobs(employerJobs);

      // Load applications for all jobs
      const allApplications = [];
      for (const job of employerJobs) {
        const jobApps = await base44.entities.Application.filter({ job_id: job.id }, '-created_date');
        allApplications.push(...jobApps.map(app => ({ ...app, job })));
      }
      setApplications(allApplications);

      // Calculate stats
      const activeJobs = employerJobs.filter(j => j.status === 'Open').length;
      const pendingApps = allApplications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length;
      const scheduledInterviews = allApplications.filter(a => a.status === 'Interview Scheduled').length;

      setStats({
        totalJobs: employerJobs.length,
        activeJobs,
        totalApplications: allApplications.length,
        pendingReview: pendingApps,
        scheduled: scheduledInterviews,
        avgResponseTime: 2.5 // Placeholder
      });

    } catch (error) {
      console.error('Error loading employer dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const newStatus = action === 'accept' ? 'Interview Scheduled' : 'Rejected';
      await base44.entities.Application.update(applicationId, { status: newStatus });
      
      const app = applications.find(a => a.id === applicationId);
      if (app) {
        await base44.entities.Notification.create({
          user_id: app.applicant_id,
          type: 'application_update',
          title: action === 'accept' ? '🎉 Application Accepted!' : 'Application Update',
          message: action === 'accept' 
            ? `Your application for "${app.job.title}" has been accepted! The employer will contact you soon.`
            : `Thank you for your interest in "${app.job.title}". We've decided to move forward with other candidates.`,
          link: createPageUrl('Profile')
        });
      }

      await loadDashboardData();
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  const handleScheduleInterview = (application) => {
    setSelectedApplication(application);
    setShowInterviewScheduler(true);
  };

  const handleSendOffer = (application) => {
    setSelectedApplication(application);
    setShowOfferGenerator(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!companyProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Complete Your Company Profile</h2>
        <p className="text-gray-400 mb-6">
          Set up your company profile to start posting jobs and finding talent
        </p>
        <Link to={createPageUrl('EmployerOnboarding')}>
          <Button className="btn-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Set Up Company Profile
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {companyProfile.logo_url && (
              <img 
                src={companyProfile.logo_url} 
                alt={companyProfile.company_name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{companyProfile.company_name}</h1>
              <p className="text-gray-400">{companyProfile.tagline || 'Employer Dashboard'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('PostJob')}>
              <Button className="btn-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </Link>
            <Link to={createPageUrl('CompanyProfile')}>
              <Button variant="outline" className="glass-card border-0 text-white hover:bg-white/5">
                <Building className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Briefcase className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.activeJobs}</p>
              <p className="text-gray-400 text-xs">Active Jobs</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
              <p className="text-gray-400 text-xs">Applications</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.pendingReview}</p>
              <p className="text-gray-400 text-xs">Pending Review</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.scheduled}</p>
              <p className="text-gray-400 text-xs">Interviews</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalJobs}</p>
              <p className="text-gray-400 text-xs">Total Jobs</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.avgResponseTime}h</p>
              <p className="text-gray-400 text-xs">Avg Response</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions (Replaced AI Tools Highlight) */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* AI Branding Suite */}
        <Card className="glass-card border-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 card-hover cursor-pointer"
              onClick={() => window.location.href = createPageUrl('CompanyProfile')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AI Branding Suite</h3>
                <p className="text-gray-400 text-xs">NEW</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Generate logos, color palettes, and compelling descriptions with AI
            </p>
            <Button className="w-full btn-primary text-white text-sm">
              <Palette className="w-4 h-4 mr-2" />
              Enhance Profile
            </Button>
          </CardContent>
        </Card>

        {/* NEW: AI Talent Scout Card (Replaces AI Candidate Matching) */}
        <Card className="glass-card border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 cursor-pointer card-hover" onClick={() => {
          if (jobs.length > 0) { // Using 'jobs' instead of 'myJobs'
            setSelectedJobForScout(jobs[0]); // Select the first job for scouting
            setShowTalentScout(true);
          } else {
            alert("Please post a job first to use AI Talent Scout");
          }
        }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">AI Talent Scout</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Let AI find the perfect candidates for your jobs
                </p>
                <Button size="sm" className="btn-primary text-white">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Talent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Job Posting Wizard */}
        <Card className="glass-card border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 card-hover cursor-pointer"
              onClick={() => window.location.href = createPageUrl('PostJob')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AI Job Posting Wizard</h3>
                <p className="text-gray-400 text-xs">GUIDED</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Create optimized job posts with AI assistance
            </p>
            <Button className="w-full btn-primary text-white text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Removed AI Developer Matcher Modal as it's replaced by AI Talent Scout */}
      {/* {showAIMatcher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="glass-card border-0 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-xl flex items-center gap-2">
                    <Brain className="w-6 h-6 text-blue-400" />
                    AI Candidate Matching
                  </h2>
                  <Button
                    onClick={() => setShowAIMatcher(false)}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <AIDeveloperMatcher jobId={jobs.length > 0 ? jobs[0].id : null} companyProfile={companyProfile} />
              </CardContent>
            </Card>
          </div>
        </div>
      )} */}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="applications">
            <Users className="w-4 h-4 mr-2" />
            Applications ({stats.totalApplications})
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <Briefcase className="w-4 h-4 mr-2" />
            My Jobs ({stats.totalJobs})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications">
          {applications.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                <p className="text-gray-400">
                  Applications will appear here once developers apply to your jobs
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <Card key={app.id} className="glass-card border-0 card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">
                            Application for {app.job?.title}
                          </h3>
                          <Badge className={
                            app.status === 'Submitted' ? 'bg-blue-500/20 text-blue-400 border-0' :
                            app.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400 border-0' :
                            app.status === 'Interview Scheduled' ? 'bg-green-500/20 text-green-400 border-0' :
                            app.status === 'Accepted' ? 'bg-green-500/20 text-green-400 border-0' :
                            'bg-red-500/20 text-red-400 border-0'
                          }>
                            {app.status}
                          </Badge>
                        </div>

                        <p className="text-gray-400 text-sm mb-3">
                          Applied {new Date(app.created_date).toLocaleDateString()}
                        </p>

                        <div className="glass-card rounded-lg p-4 bg-white/5 mb-4">
                          <p className="text-white font-medium text-sm mb-2">Cover Letter:</p>
                          <p className="text-gray-300 text-sm line-clamp-3">{app.cover_letter}</p>
                        </div>

                        {app.proposed_rate && (
                          <div className="flex gap-4 text-sm text-gray-400">
                            <span>💰 Proposed Rate: {app.proposed_rate}</span>
                            {app.estimated_timeline && (
                              <span>⏱️ Timeline: {app.estimated_timeline}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link to={createPageUrl('PublicProfile') + `?id=${app.applicant_id}`}>
                        <Button size="sm" variant="outline" className="glass-card border-0 text-white hover:bg-white/5">
                          <UserCheck className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      
                      {(app.status === 'Submitted' || app.status === 'Under Review') && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleApplicationAction(app.id, 'accept')}
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleApplicationAction(app.id, 'reject')}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </>
                      )}

                      {app.status === 'Interview Scheduled' && (
                        <>
                          <Button
                            onClick={() => handleScheduleInterview(app)}
                            size="sm"
                            className="btn-primary text-white"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Interview
                          </Button>
                          <Link to={createPageUrl('Messages')}>
                            <Button size="sm" className="btn-primary text-white">
                              <Send className="w-4 h-4 mr-2" />
                              Message Candidate
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleSendOffer(app)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Send Offer
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <div className="space-y-4">
            {jobs.map(job => (
              <Card key={job.id} className="glass-card border-0 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold text-lg">{job.title}</h3>
                        <Badge className={
                          job.status === 'Open' ? 'bg-green-500/20 text-green-400 border-0' :
                          job.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border-0' :
                          job.status === 'Completed' ? 'bg-gray-500/20 text-gray-400 border-0' :
                          'bg-red-500/20 text-red-400 border-0'
                        }>
                          {job.status}
                        </Badge>
                      </div>

                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{job.description}</p>

                      <div className="flex gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          0 views
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {applications.filter(a => a.job_id === job.id).length} applications
                        </span>
                        <span>Posted {new Date(job.created_date).toLocaleDateString()}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.required_roles?.slice(0, 3).map(role => (
                          <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={createPageUrl('Jobs')}>
                      <Button size="sm" variant="outline" className="glass-card border-0 text-white hover:bg-white/5">
                        <Eye className="w-4 h-4 mr-2" />
                        View Job
                      </Button>
                    </Link>
                    <Link to={createPageUrl('PostJob') + `?jobId=${job.id}`}> {/* Added jobId for editing */}
                      <Button size="sm" className="btn-primary text-white">
                        Edit Job
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Application Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">This Week</span>
                      <span className="text-white font-semibold">
                        {applications.filter(a => {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return new Date(a.created_date) > weekAgo;
                        }).length} applications
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Acceptance Rate</span>
                      <span className="text-white font-semibold">
                        {applications.length > 0 
                          ? Math.round((applications.filter(a => a.status === 'Accepted' || a.status === 'Interview Scheduled').length / applications.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Response Time</span>
                      <span className="text-white font-semibold">{stats.avgResponseTime}h avg</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Job Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs.slice(0, 5).map(job => {
                    const jobApps = applications.filter(a => a.job_id === job.id);
                    return (
                      <div key={job.id} className="glass-card rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white text-sm font-medium line-clamp-1">{job.title}</p>
                          <Badge className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                            {jobApps.length} apps
                          </Badge>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                            style={{width: `${Math.min((jobApps.length / 10) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Talent Scout Modal */}
      {showTalentScout && selectedJobForScout && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                AI Talent Scout for "{selectedJobForScout.title}"
              </h2>
              <Button
                onClick={() => {
                  setShowTalentScout(false);
                  setSelectedJobForScout(null);
                }}
                variant="ghost"
                className="text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <AITalentScout 
              job={selectedJobForScout}
              onClose={() => {
                setShowTalentScout(false);
                setSelectedJobForScout(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Interview Scheduler Modal */}
      {showInterviewScheduler && selectedApplication && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="glass-card border-0 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-xl">Schedule Interview</h2>
                  <Button
                    onClick={() => {
                      setShowInterviewScheduler(false);
                      setSelectedApplication(null);
                    }}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <InterviewScheduler
                  jobId={selectedApplication.job_id}
                  applicationId={selectedApplication.id}
                  candidateId={selectedApplication.applicant_id}
                  employerId={user.id}
                  onComplete={() => {
                    setShowInterviewScheduler(false);
                    setSelectedApplication(null);
                    loadDashboardData();
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Offer Letter Generator Modal */}
      {showOfferGenerator && selectedApplication && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="glass-card border-0 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-xl">Generate Offer Letter</h2>
                  <Button
                    onClick={() => {
                      setShowOfferGenerator(false);
                      setSelectedApplication(null);
                    }}
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <OfferLetterGenerator
                  jobId={selectedApplication.job_id}
                  applicationId={selectedApplication.id}
                  candidateId={selectedApplication.applicant_id}
                  employerId={user.id}
                  jobTitle={jobs.find(j => j.id === selectedApplication.job_id)?.title || 'Position'}
                  onComplete={() => {
                    setShowOfferGenerator(false);
                    setSelectedApplication(null);
                    loadDashboardData();
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
