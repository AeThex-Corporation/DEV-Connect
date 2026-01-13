import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Check,
  X,
  Plus,
  Download,
  ExternalLink
} from "lucide-react";

export default function InterviewScheduler({ jobId, applicationId, candidateId, employerId, onComplete }) {
  const [step, setStep] = useState(1); // 1: propose times, 2: confirm
  const [proposedTimes, setProposedTimes] = useState([{ datetime: "", duration_minutes: 60 }]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const addTimeSlot = () => {
    setProposedTimes([...proposedTimes, { datetime: "", duration_minutes: 60 }]);
  };

  const removeTimeSlot = (index) => {
    setProposedTimes(proposedTimes.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = [...proposedTimes];
    updated[index][field] = value;
    setProposedTimes(updated);
  };

  const handlePropose = async () => {
    const validTimes = proposedTimes.filter(t => t.datetime);
    if (validTimes.length === 0) {
      alert('Please add at least one time slot');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Create interview proposal
      await base44.entities.InterviewProposal.create({
        job_id: jobId,
        application_id: applicationId,
        proposer_id: user.id,
        receiver_id: user.id === employerId ? candidateId : employerId,
        proposed_times: validTimes,
        message: message,
        status: 'pending'
      });

      // Send notification
      await base44.entities.Notification.create({
        user_id: user.id === employerId ? candidateId : employerId,
        type: 'application_update',
        title: '📅 Interview Time Proposed',
        message: `${user.full_name} has proposed interview times for your application.`,
        link: createPageUrl('EmployerDashboard')
      });

      if (onComplete) onComplete();
      alert('Interview times proposed successfully!');
    } catch (error) {
      console.error('Error proposing interview:', error);
      alert('Failed to propose interview times');
    } finally {
      setLoading(false);
    }
  };

  const downloadICS = (time) => {
    // Generate .ics file for calendar import
    const event = {
      start: new Date(time.datetime),
      duration: time.duration_minutes,
      title: 'Interview - Devconnect',
      description: message
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DURATION:PT${event.duration}M
SUMMARY:${event.title}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview.ics';
    a.click();
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Schedule Interview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Proposed Time Slots */}
        <div>
          <label className="text-white font-medium text-sm mb-3 block">
            Propose Interview Times
          </label>
          <p className="text-gray-400 text-xs mb-4">
            Propose multiple time slots. The other party can select the most convenient one.
          </p>
          
          <div className="space-y-3">
            {proposedTimes.map((slot, index) => (
              <div key={index} className="glass-card rounded-lg p-4">
                <div className="flex gap-3 items-start">
                  <div className="flex-1 grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={slot.datetime}
                        onChange={(e) => updateTimeSlot(index, 'datetime', e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Duration (minutes)</label>
                      <Input
                        type="number"
                        value={slot.duration_minutes}
                        onChange={(e) => updateTimeSlot(index, 'duration_minutes', parseInt(e.target.value))}
                        className="bg-white/5 border-white/10 text-white"
                        min="15"
                        step="15"
                      />
                    </div>
                  </div>
                  
                  {proposedTimes.length > 1 && (
                    <Button
                      onClick={() => removeTimeSlot(index)}
                      size="icon"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {slot.datetime && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <Button
                      onClick={() => downloadICS(slot)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5 text-xs"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Add to Calendar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={addTimeSlot}
            variant="outline"
            className="w-full mt-3 glass-card border-0 text-white hover:bg-white/5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Time Slot
          </Button>
        </div>

        {/* Optional Message */}
        <div>
          <label className="text-white font-medium text-sm mb-2 block">
            Message (Optional)
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add any additional details about the interview..."
            className="bg-white/5 border-white/10 text-white h-24"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="flex-1 glass-card border-0 text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePropose}
            disabled={loading}
            className="flex-1 btn-primary text-white"
          >
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Send Proposal
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="glass-card rounded-lg p-4 bg-blue-500/10">
          <p className="text-blue-400 text-xs mb-2 font-medium">💡 Pro Tip:</p>
          <p className="text-gray-300 text-xs">
            The other party will be able to select one of your proposed times or suggest alternatives. 
            You'll both receive calendar invites once a time is confirmed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}