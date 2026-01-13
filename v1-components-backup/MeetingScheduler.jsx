import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Video } from "lucide-react";

export default function MeetingScheduler({ jobId, participantId, onScheduled }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingType, setMeetingType] = useState("interview");
  const [scheduledTime, setScheduledTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [scheduling, setScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!title || !scheduledTime) {
      alert('Please fill in all required fields');
      return;
    }

    setScheduling(true);
    try {
      const user = await base44.auth.me();

      // Create meeting
      const meeting = await base44.entities.Meeting.create({
        job_id: jobId,
        organizer_id: user.id,
        participant_ids: [participantId],
        title: title,
        description: description,
        scheduled_time: scheduledTime,
        duration_minutes: duration,
        meeting_type: meetingType,
        zoom_join_url: `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`, // Simulated
        status: 'scheduled'
      });

      // Create notification for participant
      await base44.entities.Notification.create({
        user_id: participantId,
        type: 'application_update',
        title: 'Meeting Scheduled',
        message: `${user.full_name} scheduled a ${meetingType} with you: "${title}"`,
        link: '/Jobs',
        metadata: { meeting_id: meeting.id, job_id: jobId }
      });

      // Reset form
      setTitle("");
      setDescription("");
      setScheduledTime("");
      
      if (onScheduled) onScheduled(meeting);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-white" />
          <CardTitle className="text-white text-lg">Schedule Meeting</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div>
          <label className="text-white text-sm font-medium mb-2 block">Meeting Title</label>
          <Input
            placeholder="e.g., Initial Interview"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder-gray-500"
          />
        </div>

        <div>
          <label className="text-white text-sm font-medium mb-2 block">Meeting Type</label>
          <Select value={meetingType} onValueChange={setMeetingType}>
            <SelectTrigger className="glass-card border-0 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="kickoff">Project Kickoff</SelectItem>
              <SelectItem value="check-in">Check-in</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-white text-sm font-medium mb-2 block">Date & Time</label>
          <Input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <label className="text-white text-sm font-medium mb-2 block">Duration (minutes)</label>
          <Select value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
            <SelectTrigger className="glass-card border-0 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-white text-sm font-medium mb-2 block">Description (Optional)</label>
          <Textarea
            placeholder="Meeting agenda..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-20"
          />
        </div>

        <div className="glass-card rounded-lg p-4 bg-blue-500/10">
          <div className="flex gap-3">
            <Video className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm mb-1">Zoom Meeting Included</p>
              <p className="text-gray-400 text-xs">
                A Zoom meeting link will be automatically generated and sent to participants.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSchedule}
          disabled={scheduling || !title || !scheduledTime}
          className="w-full btn-primary text-white"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {scheduling ? 'Scheduling...' : 'Schedule Meeting'}
        </Button>
      </CardContent>
    </Card>
  );
}