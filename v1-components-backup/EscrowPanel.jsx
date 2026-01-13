import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Send
} from "lucide-react";

export default function EscrowPanel({ job, escrow, milestones, onUpdate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingMilestone, setSubmittingMilestone] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState({});

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEmployer = user && job.employer_id === user.id;
  const isDeveloper = user && escrow && escrow.developer_id === user.id;

  const handleFundEscrow = async () => {
    try {
      await base44.entities.EscrowTransaction.update(escrow.id, {
        funded_amount: escrow.total_amount,
        status: 'funded',
        funded_date: new Date().toISOString()
      });

      // Create notification for developer
      await base44.entities.Notification.create({
        user_id: escrow.developer_id,
        type: 'escrow_funded',
        title: 'Escrow Funded',
        message: `The employer has funded the escrow for "${job.title}"`,
        link: `/Jobs`,
        metadata: { job_id: job.id, escrow_id: escrow.id }
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error funding escrow:', error);
    }
  };

  const handleSubmitMilestone = async (milestone) => {
    setSubmittingMilestone(milestone.id);
    try {
      await base44.entities.Milestone.update(milestone.id, {
        status: 'submitted',
        submitted_date: new Date().toISOString(),
        submission_notes: submissionNotes[milestone.id] || ''
      });

      // Create notification for employer
      await base44.entities.Notification.create({
        user_id: job.employer_id,
        type: 'milestone_completed',
        title: 'Milestone Submitted',
        message: `Developer has submitted milestone "${milestone.title}" for review`,
        link: `/Jobs`,
        metadata: { job_id: job.id, milestone_id: milestone.id }
      });

      setSubmissionNotes(prev => ({ ...prev, [milestone.id]: '' }));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error submitting milestone:', error);
    } finally {
      setSubmittingMilestone(null);
    }
  };

  const handleApproveMilestone = async (milestone) => {
    try {
      await base44.entities.Milestone.update(milestone.id, {
        status: 'approved',
        approved_date: new Date().toISOString()
      });

      await base44.entities.EscrowTransaction.update(escrow.id, {
        released_amount: escrow.released_amount + milestone.amount,
        status: escrow.released_amount + milestone.amount >= escrow.total_amount ? 'completed' : 'partially_released'
      });

      // Create notification for developer
      await base44.entities.Notification.create({
        user_id: escrow.developer_id,
        type: 'payout_requested',
        title: 'Milestone Approved',
        message: `Milestone "${milestone.title}" approved! ${milestone.amount} ${escrow.currency} released`,
        link: `/Jobs`,
        metadata: { job_id: job.id, milestone_id: milestone.id }
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error approving milestone:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-500/20 text-gray-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      submitted: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      paid: 'bg-emerald-500/20 text-emerald-400',
      disputed: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      in_progress: Clock,
      submitted: Send,
      approved: CheckCircle,
      paid: CheckCircle,
      disputed: AlertCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-3 h-3" />;
  };

  if (loading || !escrow) {
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
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-white text-lg">Escrow Protection</CardTitle>
          </div>
          <Badge className={`${
            escrow.status === 'funded' ? 'bg-green-500/20 text-green-400' :
            escrow.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
            escrow.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-gray-500/20 text-gray-400'
          } border-0`}>
            {escrow.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Escrow Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Total Amount</p>
            <p className="text-white font-semibold text-lg">
              {escrow.total_amount} {escrow.currency}
            </p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Funded</p>
            <p className="text-emerald-400 font-semibold text-lg">
              {escrow.funded_amount} {escrow.currency}
            </p>
          </div>
          <div className="glass-card rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Released</p>
            <p className="text-blue-400 font-semibold text-lg">
              {escrow.released_amount} {escrow.currency}
            </p>
          </div>
        </div>

        {/* Fund Escrow Button (Employer Only) */}
        {isEmployer && escrow.status === 'pending' && (
          <Button
            onClick={handleFundEscrow}
            className="w-full btn-primary text-white"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Fund Escrow ({escrow.total_amount} {escrow.currency})
          </Button>
        )}

        {/* Milestones */}
        {milestones && milestones.length > 0 && (
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Milestones</h4>
            <div className="space-y-3">
              {milestones.sort((a, b) => (a.order || 0) - (b.order || 0)).map((milestone) => (
                <div key={milestone.id} className="glass-card rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-white font-medium text-sm mb-1">{milestone.title}</h5>
                      <p className="text-gray-400 text-xs mb-2">{milestone.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(milestone.status)} border-0 text-xs`}>
                          {getStatusIcon(milestone.status)}
                          <span className="ml-1">{milestone.status.replace('_', ' ')}</span>
                        </Badge>
                        <span className="text-emerald-400 text-sm font-medium">
                          {milestone.amount} {escrow.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Developer: Submit Milestone */}
                  {isDeveloper && milestone.status === 'in_progress' && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        placeholder="Add notes about completion..."
                        value={submissionNotes[milestone.id] || ''}
                        onChange={(e) => setSubmissionNotes(prev => ({ 
                          ...prev, 
                          [milestone.id]: e.target.value 
                        }))}
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500 text-sm h-20"
                      />
                      <Button
                        onClick={() => handleSubmitMilestone(milestone)}
                        disabled={submittingMilestone === milestone.id}
                        className="w-full btn-primary text-white text-sm"
                        size="sm"
                      >
                        {submittingMilestone === milestone.id ? 'Submitting...' : 'Submit for Review'}
                      </Button>
                    </div>
                  )}

                  {/* Employer: Approve Milestone */}
                  {isEmployer && milestone.status === 'submitted' && (
                    <div className="mt-3">
                      {milestone.submission_notes && (
                        <div className="bg-white/5 rounded p-3 mb-2">
                          <p className="text-gray-400 text-xs mb-1">Developer Notes:</p>
                          <p className="text-white text-sm">{milestone.submission_notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveMilestone(milestone)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve & Release
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 glass-card border-0 text-white hover:bg-white/5 text-sm"
                          size="sm"
                        >
                          Request Changes
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Show submission date if submitted */}
                  {milestone.submitted_date && (
                    <p className="text-gray-600 text-xs mt-2">
                      Submitted: {new Date(milestone.submitted_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Escrow Info */}
        <div className="glass-card rounded-lg p-4 bg-blue-500/10">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm mb-1">Escrow Protection</p>
              <p className="text-gray-400 text-xs">
                Funds are held securely until milestones are completed and approved. Both parties are protected throughout the project.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}