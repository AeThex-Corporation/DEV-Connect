import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Calendar,
  ExternalLink,
  MessageSquare,
  Loader2
} from "lucide-react";

export default function ApplicationTracker({ userId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const [jobs, setJobs] = useState({});

  useEffect(() => {
    loadApplications();
  }, [userId]);

  const loadApplications = async () => {
    try {
      const userApplications = await base44.entities.Application.filter({
        applicant_id: userId
      }, '-created_date');

      setApplications(userApplications);

      // Fetch job details for each application
      const jobIds = [...new Set(userApplications.map(app => app.job_id))];
      const jobsData = {};
      
      for (const jobId of jobIds) {
        const jobList = await base44.entities.Job.filter({ id: jobId });
        if (jobList.length > 0) {
          jobsData[jobId] = jobList[0];
        }
      }
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Under Review': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Interview Scheduled': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Accepted': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Withdrawn': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Submitted': Send,
      'Under Review': Eye,
      'Interview Scheduled': Calendar,
      'Accepted': CheckCircle,
      'Rejected': XCircle,
      'Withdrawn': XCircle
    };
    return icons[status] || Clock;
  };

  const getStatusStats = () => {
    return {
      all: applications.length,
      active: applications.filter(app => 
        ['Submitted', 'Under Review', 'Interview Scheduled'].includes(app.status)
      ).length,
      accepted: applications.filter(app => app.status === 'Accepted').length,
      rejected: applications.filter(app => app.status === 'Rejected').length
    };
  };

  const filterApplications = () => {
    if (activeStatus === 'all') return applications;
    if (activeStatus === 'active') {
      return applications.filter(app => 
        ['Submitted', 'Under Review', 'Interview Scheduled'].includes(app.status)
      );
    }
    return applications.filter(app => app.status.toLowerCase().includes(activeStatus));
  };

  const stats = getStatusStats();
  const filteredApps = filterApplications();

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Loading your applications...</p>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
          <p className="text-gray-400 mb-6">
            Start applying to jobs to track your application status here
          </p>
          <Button
            onClick={() => window.location.href = createPageUrl('Jobs')}
            className="btn-primary text-white"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Browse Jobs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0 cursor-pointer" onClick={() => setActiveStatus('all')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.all}</p>
            <p className="text-gray-400 text-sm">Total Applied</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 cursor-pointer" onClick={() => setActiveStatus('active')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
            <p className="text-gray-400 text-sm">Active</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 cursor-pointer" onClick={() => setActiveStatus('accepted')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
            <p className="text-gray-400 text-sm">Accepted</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 cursor-pointer" onClick={() => setActiveStatus('rejected')}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-gray-400 text-sm">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card className="glass-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              {activeStatus === 'all' ? 'All Applications' :
               activeStatus === 'active' ? 'Active Applications' :
               activeStatus === 'accepted' ? 'Accepted Applications' :
               'Rejected Applications'}
            </CardTitle>
            <Badge className="bg-purple-500/20 text-purple-400 border-0">
              {filteredApps.length} {filteredApps.length === 1 ? 'application' : 'applications'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredApps.map(app => {
              const job = jobs[app.job_id];
              const StatusIcon = getStatusIcon(app.status);
              
              return (
                <div key={app.id} className="glass-card rounded-lg p-5 hover:bg-white/5 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold text-lg">
                          {job?.title || 'Job Title'}
                        </h3>
                        <Badge className={getStatusColor(app.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {app.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Applied {new Date(app.created_date).toLocaleDateString()}
                        </span>
                        {app.viewed_by_employer && (
                          <span className="flex items-center gap-1 text-green-400">
                            <Eye className="w-3 h-3" />
                            Viewed
                          </span>
                        )}
                        {job?.payment_type && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {job.payment_type}
                          </span>
                        )}
                      </div>

                      {app.cover_letter && (
                        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                          {app.cover_letter}
                        </p>
                      )}

                      {app.proposed_rate && (
                        <div className="glass-card rounded-lg p-3 bg-blue-500/5 mb-3">
                          <p className="text-blue-300 text-sm">
                            <strong>Proposed Rate:</strong> {app.proposed_rate}
                          </p>
                          {app.estimated_timeline && (
                            <p className="text-blue-300 text-sm mt-1">
                              <strong>Timeline:</strong> {app.estimated_timeline}
                            </p>
                          )}
                        </div>
                      )}

                      {app.rejection_reason && (
                        <div className="glass-card rounded-lg p-3 bg-red-500/5 border border-red-500/20">
                          <p className="text-red-300 text-sm">
                            <strong>Rejection Reason:</strong> {app.rejection_reason}
                          </p>
                        </div>
                      )}

                      {app.interview_notes && (
                        <div className="glass-card rounded-lg p-3 bg-purple-500/5">
                          <p className="text-purple-300 text-sm">
                            <strong>Interview Notes:</strong> {app.interview_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => window.location.href = createPageUrl('Jobs') + `?job=${job?.id}`}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Job
                    </Button>
                    {job && (
                      <Button
                        onClick={() => {
                          // Navigate to messages with employer
                          window.location.href = createPageUrl('Messages');
                        }}
                        size="sm"
                        variant="outline"
                        className="glass-card border-0 text-white hover:bg-white/5"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Contact Employer
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}