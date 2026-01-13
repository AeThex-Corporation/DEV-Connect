import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, CheckCircle, X } from "lucide-react";

export default function TimeTracker({ jobId, developerId, isEmployer }) {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTimeEntries();
  }, [jobId]);

  const loadTimeEntries = async () => {
    try {
      const entries = await base44.entities.TimeEntry.filter(
        { job_id: jobId },
        '-date'
      );
      setTimeEntries(entries);
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!description || !hours || !date) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const hourlyRate = 50; // Would come from contract/job
      await base44.entities.TimeEntry.create({
        job_id: jobId,
        developer_id: developerId,
        description: description,
        hours: parseFloat(hours),
        date: date,
        hourly_rate: hourlyRate,
        total_amount: parseFloat(hours) * hourlyRate,
        status: 'pending'
      });

      setDescription("");
      setHours("");
      setDate(new Date().toISOString().split('T')[0]);
      setShowForm(false);
      loadTimeEntries();
    } catch (error) {
      console.error('Error submitting time entry:', error);
      alert('Failed to submit time entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (entryId) => {
    try {
      const user = await base44.auth.me();
      await base44.entities.TimeEntry.update(entryId, {
        status: 'approved',
        approved_by: user.id,
        approved_date: new Date().toISOString()
      });
      loadTimeEntries();
    } catch (error) {
      console.error('Error approving time entry:', error);
    }
  };

  const handleReject = async (entryId) => {
    try {
      await base44.entities.TimeEntry.update(entryId, {
        status: 'rejected'
      });
      loadTimeEntries();
    } catch (error) {
      console.error('Error rejecting time entry:', error);
    }
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
  const approvedHours = timeEntries
    .filter(e => e.status === 'approved')
    .reduce((sum, entry) => sum + (entry.hours || 0), 0);
  const totalAmount = timeEntries
    .filter(e => e.status === 'approved')
    .reduce((sum, entry) => sum + (entry.total_amount || 0), 0);

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-white" />
            <CardTitle className="text-white text-lg">Time Tracking</CardTitle>
          </div>
          {!isEmployer && (
            <Button
              onClick={() => setShowForm(!showForm)}
              size="sm"
              className="btn-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Time
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Total Hours</p>
            <p className="text-white font-semibold text-lg">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Approved</p>
            <p className="text-green-400 font-semibold text-lg">{approvedHours.toFixed(1)}h</p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Total</p>
            <p className="text-emerald-400 font-semibold text-lg">${totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Time Entry Form */}
        {showForm && (
          <div className="glass-card rounded-lg p-4 space-y-3">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Input
              type="number"
              step="0.25"
              placeholder="Hours worked"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-gray-500"
            />
            <Textarea
              placeholder="What did you work on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-20"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 btn-primary text-white"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Time Entries List */}
        <div className="space-y-2">
          {timeEntries.map((entry) => (
            <div key={entry.id} className="glass-card rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium text-sm">
                      {entry.hours}h - {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <Badge className={`${
                      entry.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      entry.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    } border-0 text-xs`}>
                      {entry.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs">{entry.description}</p>
                  {entry.status === 'approved' && (
                    <p className="text-emerald-400 text-xs mt-1">
                      ${entry.total_amount?.toFixed(2)}
                    </p>
                  )}
                </div>

                {isEmployer && entry.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(entry.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => handleReject(entry.id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {timeEntries.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No time entries yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}