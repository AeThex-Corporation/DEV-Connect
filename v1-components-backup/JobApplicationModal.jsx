
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Send, Briefcase, Video } from "lucide-react";

export default function JobApplicationModal({ isOpen, onClose, job, onSubmit }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [estimatedTimeline, setEstimatedTimeline] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showInterviewOption, setShowInterviewOption] = useState(false);

  const handleSubmit = async () => {
    if (!coverLetter.trim()) {
      alert('Please write a cover letter');
      return;
    }

    setSubmitting(true);
    try {
      const user = await base44.auth.me();

      const application = await base44.entities.Application.create({
        job_id: job.id,
        applicant_id: user.id,
        cover_letter: coverLetter,
        proposed_rate: proposedRate,
        estimated_timeline: estimatedTimeline,
        availability_start_date: availabilityDate,
        status: 'Submitted'
      });

      // Create notification for employer
      await base44.entities.Notification.create({
        user_id: job.employer_id,
        type: 'application_update',
        title: 'New Job Application',
        message: `${user.full_name} applied to "${job.title}"`,
        link: createPageUrl('Jobs'),
        metadata: { application_id: application.id, job_id: job.id }
      });

      // Track analytics
      await base44.entities.Analytics.create({
        user_id: user.id,
        metric_type: 'application_sent',
        metric_value: 1,
        date: new Date().toISOString().split('T')[0],
        metadata: { job_id: job.id }
      });

      if (onSubmit) onSubmit(application);
      onClose();

      // Reset form
      setCoverLetter("");
      setProposedRate("");
      setEstimatedTimeline("");
      setAvailabilityDate("");
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      const user = await base44.auth.me();
      
      // Create a collaboration room for the interview
      const room = await base44.entities.CollabRoom.create({
        room_name: `Interview: ${job.title}`,
        room_type: "interview",
        creator_id: user.id,
        participant_ids: [user.id, job.employer_id],
        related_job_id: job.id,
        started_at: new Date().toISOString()
      });

      // Send notification to employer
      await base44.entities.Notification.create({
        user_id: job.employer_id,
        type: 'application_update',
        title: 'Interview Room Request',
        message: `${user.full_name} wants to schedule an interview for "${job.title}"`,
        link: createPageUrl('Messages'),
        metadata: { room_id: room.id, job_id: job.id }
      });

      alert('Interview room created! Check your messages.');
      onClose();
    } catch (error) {
      console.error('Error creating interview room:', error);
      alert('Failed to create interview room');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="glass-card border-0 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl mb-1">Apply for Job</CardTitle>
              <p className="text-gray-400 text-sm">{job.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Job Info */}
          <div className="glass-card rounded-lg p-4 bg-blue-500/5">
            <div className="flex gap-3">
              <Briefcase className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-medium text-sm mb-1">Job Requirements</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {job.required_roles?.map(role => (
                    <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
                <p className="text-gray-400 text-xs">
                  Budget: {job.budget_range} • Timeline: {job.timeline}
                </p>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Cover Letter *
            </label>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you're the perfect fit for this job..."
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 min-h-32"
            />
            <p className="text-gray-500 text-xs mt-1">
              Highlight your relevant experience and why you want this project
            </p>
          </div>

          {/* Proposed Rate */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Proposed Rate
            </label>
            <Input
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              placeholder="e.g., $75/hour or $5,000 fixed"
              className="bg-white/5 border-white/10 text-white placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Timeline */}
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Estimated Timeline
              </label>
              <Input
                value={estimatedTimeline}
                onChange={(e) => setEstimatedTimeline(e.target.value)}
                placeholder="e.g., 2-3 weeks"
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Available From
              </label>
              <Input
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card rounded-lg p-4 bg-green-500/5">
            <p className="text-green-400 text-sm font-medium mb-2">💡 Application Tips</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Be specific about your relevant experience</li>
              <li>• Mention similar projects you've completed</li>
              <li>• Ask clarifying questions if needed</li>
              <li>• Be realistic with your timeline and rate</li>
            </ul>
          </div>

          {/* Interview Room Option */}
          <div className="glass-card rounded-lg p-4 bg-purple-500/5">
            <div className="flex items-start gap-3">
              <Video className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-purple-400 text-sm font-medium mb-1">Want to discuss first?</p>
                <p className="text-gray-400 text-xs mb-3">
                  Create an interview room to chat with the employer before submitting your application
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleScheduleInterview}
                  className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-0"
                >
                  <Video className="w-3 h-3 mr-2" />
                  Request Interview Room
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 glass-card border-0 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !coverLetter.trim()}
              className="flex-1 btn-primary text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
