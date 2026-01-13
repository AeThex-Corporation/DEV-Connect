import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  Building
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's applications
  const { data: myApplications = [] } = useQuery({
    queryKey: ['myApplications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Application.filter({ applicant_id: user.id });
    },
    enabled: !!user,
  });

  // Fetch user's posted jobs (if employer)
  const { data: myJobs = [] } = useQuery({
    queryKey: ['myJobs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Job.filter({ employer_id: user.id });
    },
    enabled: !!user,
  });

  // Fetch recent jobs
  const { data: recentJobs = [] } = useQuery({
    queryKey: ['recentJobs'],
    queryFn: async () => {
      const jobs = await base44.entities.Job.filter({ status: 'Open' });
      return jobs.slice(0, 5);
    },
  });

  // Fetch unread messages
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unreadMessages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Message.filter({
        receiver_id: user.id,
        read: false
      });
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isDeveloper = user?.developer_roles && user.developer_roles.length > 0;
  const pendingApplications = myApplications.filter(a => a.status === 'Submitted' || a.status === 'Under Review').length;
  const activeJobs = myJobs.filter(j => j.status === 'Open').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400">
            {isDeveloper ? "Find your next opportunity" : "Find the perfect developer for your project"}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">
                    {isDeveloper ? "Applications" : "Active Jobs"}
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {isDeveloper ? myApplications.length : activeJobs}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">
                    {isDeveloper ? "Pending" : "Total Applications"}
                  </p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {isDeveloper ? pendingApplications : myJobs.reduce((acc, job) => acc + (job.application_count || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Messages</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {unreadMessages.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Profile Views</p>
                  <p className="text-3xl font-bold text-white mt-1">0</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Jobs */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">
                    {isDeveloper ? "Recent Job Openings" : "Your Posted Jobs"}
                  </CardTitle>
                  <Button
                    onClick={() => window.location.href = createPageUrl(isDeveloper ? "Jobs" : "PostJob")}
                    variant="ghost"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {isDeveloper ? "View All" : "Post New"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(isDeveloper ? recentJobs : myJobs.slice(0, 5)).map((job) => (
                  <div
                    key={job.id}
                    onClick={() => window.location.href = createPageUrl("Jobs") + `?job=${job.id}`}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{job.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {job.required_roles?.slice(0, 2).map((role, i) => (
                            <Badge key={i} className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                              {role}
                            </Badge>
                          ))}
                          {job.payment_type && (
                            <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                              {job.payment_type}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2">{job.description}</p>
                      </div>
                      {!isDeveloper && (
                        <div className="ml-4 text-right">
                          <p className="text-xs text-gray-400">Applications</p>
                          <p className="text-lg font-bold text-white">{job.application_count || 0}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {(isDeveloper ? recentJobs : myJobs).length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">
                      {isDeveloper ? "No jobs posted yet" : "You haven't posted any jobs yet"}
                    </p>
                    {!isDeveloper && (
                      <Button
                        onClick={() => window.location.href = createPageUrl("PostJob")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Post Your First Job
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Applications (Developers) or Recent Applications (Employers) */}
            {isDeveloper ? (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">My Applications</CardTitle>
                    <Button
                      onClick={() => window.location.href = createPageUrl("Profile")}
                      variant="ghost"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {myApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">You haven't applied to any jobs yet</p>
                      <Button
                        onClick={() => window.location.href = createPageUrl("Jobs")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Browse Jobs
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myApplications.slice(0, 5).map((app) => (
                        <div key={app.id} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">Application #{app.id.slice(0, 8)}</p>
                              <p className="text-gray-400 text-xs mt-1">
                                Applied {new Date(app.created_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              className={`${
                                app.status === 'Accepted'
                                  ? 'bg-green-500/20 text-green-400'
                                  : app.status === 'Rejected'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              } border-0`}
                            >
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Complete Your Profile</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Basic Information</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Add Portfolio Projects</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Add Work Experience</span>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = createPageUrl("Profile")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Complete Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isDeveloper ? (
                  <>
                    <Button
                      onClick={() => window.location.href = createPageUrl("Jobs")}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </Button>
                    <Button
                      onClick={() => window.location.href = createPageUrl("BrowseProfiles")}
                      variant="outline"
                      className="w-full glass-card border-white/10 text-white hover:bg-white/5 justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Find Collaborators
                    </Button>
                    <Button
                      onClick={() => window.location.href = createPageUrl("Messages")}
                      variant="outline"
                      className="w-full glass-card border-white/10 text-white hover:bg-white/5 justify-start"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => window.location.href = createPageUrl("PostJob")}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Post a Job
                    </Button>
                    <Button
                      onClick={() => window.location.href = createPageUrl("BrowseProfiles")}
                      variant="outline"
                      className="w-full glass-card border-white/10 text-white hover:bg-white/5 justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Find Developers
                    </Button>
                    <Button
                      onClick={() => window.location.href = createPageUrl("EmployerDashboard")}
                      variant="outline"
                      className="w-full glass-card border-white/10 text-white hover:bg-white/5 justify-start"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Applications
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Getting Started Tips */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  {isDeveloper ? (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-indigo-400 font-bold text-xs">1</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Complete your profile</p>
                          <p className="text-gray-400 text-xs">Add portfolio and skills</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-indigo-400 font-bold text-xs">2</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Browse opportunities</p>
                          <p className="text-gray-400 text-xs">Find jobs that match your skills</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-indigo-400 font-bold text-xs">3</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Apply & connect</p>
                          <p className="text-gray-400 text-xs">Start conversations with employers</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-indigo-400 font-bold text-xs">1</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Post a job</p>
                          <p className="text-gray-400 text-xs">Describe your project needs</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-indigo-400 font-bold text-xs">2</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Review applications</p>
                          <p className="text-gray-400 text-xs">Find the perfect developer</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-indigo-400 font-bold text-xs">3</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">Start working</p>
                          <p className="text-gray-400 text-xs">Communicate and collaborate</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}