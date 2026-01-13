import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Bookmark,
  Trash2,
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  Edit,
  Save,
  X,
  Sparkles
} from 'lucide-react';
import JobApplicationModal from '../components/JobApplicationModal';

export default function SavedJobs() {
  const [user, setUser] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notes, setNotes] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: savedJobs = [], refetch } = useQuery({
    queryKey: ['saved-jobs-page', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.SavedJob.filter({ user_id: user.id }, '-created_date');
    },
    enabled: !!user
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs-for-saved'],
    queryFn: async () => {
      const jobIds = savedJobs.map(s => s.job_id);
      if (jobIds.length === 0) return [];
      
      const allJobs = await base44.entities.Job.list();
      return allJobs.filter(j => jobIds.includes(j.id));
    },
    enabled: savedJobs.length > 0
  });

  const removeSavedJob = async (savedJobId) => {
    if (!confirm('Remove this job from your saved list?')) return;
    
    await base44.entities.SavedJob.delete(savedJobId);
    refetch();
  };

  const updateNotes = async (savedJobId) => {
    await base44.entities.SavedJob.update(savedJobId, { notes });
    setEditingNotes(null);
    setNotes('');
    refetch();
  };

  const updatePriority = async (savedJobId, priority) => {
    await base44.entities.SavedJob.update(savedJobId, { priority });
    refetch();
  };

  const getJobDetails = (jobId) => {
    return jobs.find(j => j.id === jobId);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-500/20 text-red-400';
    if (priority === 'medium') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">Saved Jobs</h1>
        </div>
        <p className="text-gray-400">
          {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {savedJobs.length === 0 ? (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Saved Jobs Yet</h3>
            <p className="text-gray-400 mb-6">
              Save jobs you're interested in to review them later
            </p>
            <Button 
              onClick={() => window.location.href = '/jobs'}
              className="btn-primary text-white"
            >
              Browse Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((savedJob) => {
            const job = getJobDetails(savedJob.job_id);
            if (!job) return null;

            return (
              <Card key={savedJob.id} className="glass-card border-0 card-hover">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h2 className="text-xl font-bold text-white">{job.title}</h2>
                        
                        <Badge className={getPriorityColor(savedJob.priority)}>
                          {savedJob.priority} priority
                        </Badge>

                        {new Date(job.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                            New
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-300 text-sm mb-3">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.required_roles?.map((role) => (
                          <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-400 mb-4">
                        <div className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {job.budget_range || '$' + (job.min_hourly_rate || 0) + '-' + (job.max_hourly_rate || 'N/A') + '/hr'}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {job.timeline || 'Flexible'}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {job.experience_level}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.remote_type}
                        </div>
                      </div>

                      {/* Notes Section */}
                      {editingNotes === savedJob.id ? (
                        <div className="bg-white/5 rounded-lg p-3 mb-3">
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add private notes about this job..."
                            className="bg-white/5 border-white/10 text-white text-sm mb-2"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateNotes(savedJob.id)}
                              className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingNotes(null)}
                              className="text-gray-400"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : savedJob.notes ? (
                        <div className="bg-white/5 rounded-lg p-3 mb-3">
                          <p className="text-gray-300 text-sm mb-2">{savedJob.notes}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingNotes(savedJob.id);
                              setNotes(savedJob.notes);
                            }}
                            className="text-gray-400 text-xs"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit Notes
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNotes(savedJob.id);
                            setNotes('');
                          }}
                          className="text-gray-400 text-xs mb-3"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Add Notes
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button 
                        className="btn-primary text-white text-sm"
                        onClick={() => {
                          setSelectedJob(job);
                          setApplicationModalOpen(true);
                        }}
                      >
                        Apply Now
                      </Button>

                      {/* Priority Buttons */}
                      <div className="flex gap-1">
                        {['high', 'medium', 'low'].map(priority => (
                          <button
                            key={priority}
                            onClick={() => updatePriority(savedJob.id, priority)}
                            className={`px-2 py-1 rounded text-xs ${
                              savedJob.priority === priority
                                ? getPriorityColor(priority)
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSavedJob(savedJob.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-gray-500 text-xs">
                      Saved {new Date(savedJob.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <JobApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        job={selectedJob}
        onSubmit={() => {
          setApplicationModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}