
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, TrendingUp, DollarSign, Clock, AlertCircle, Crown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import JobPostingWizard from "../components/JobPostingWizard";

export default function PostJob() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobsPostedThisMonth, setJobsPostedThisMonth] = useState(0);
  const [canPostJob, setCanPostJob] = useState(true);
  const [limitMessage, setLimitMessage] = useState("");
  const [useWizard, setUseWizard] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    required_roles: [],
    payment_type: "USD",
    budget_range: "",
    min_hourly_rate: "",
    max_hourly_rate: "",
    timeline: "",
    project_scope: "Part-time Project",
    experience_level: "Intermediate",
    remote_type: "Remote",
    programming_languages: [],
    urgency: "Normal"
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUserAndSubscription();
  }, []);

  const loadUserAndSubscription = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Load user's subscription
      const subscriptions = await base44.entities.Subscription.filter({
        user_id: userData.id
      });

      if (subscriptions.length > 0) {
        const userSubscription = subscriptions[0];
        setSubscription(userSubscription);

        // Check if user can post jobs based on their plan
        const maxPostings = userSubscription.features?.max_job_postings_per_month || 0;
        let currentPostings = userSubscription.jobs_posted_this_month || 0;

        // Check if billing period needs reset
        const lastReset = userSubscription.last_job_post_reset;
        const currentPeriodStart = userSubscription.current_period_start;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Simple monthly reset logic: if last reset was in a previous month/year
        const lastResetDate = lastReset ? new Date(lastReset) : null;
        const needsReset = !lastResetDate || lastResetDate.getMonth() !== currentMonth || lastResetDate.getFullYear() !== currentYear;
        
        if (needsReset) {
          // Reset counter if we're in a new month
          await base44.entities.Subscription.update(userSubscription.id, {
            jobs_posted_this_month: 0,
            last_job_post_reset: now.toISOString()
          });
          currentPostings = 0; // Reset for display
        }
        
        setJobsPostedThisMonth(currentPostings);

        // Check limits
        if (maxPostings === -1) {
          // Unlimited
          setCanPostJob(true);
          setLimitMessage(`Unlimited job postings with your ${userSubscription.plan_name || 'current'} plan`);
        } else if (maxPostings === 0) {
          // No postings allowed
          setCanPostJob(false);
          setLimitMessage("Your current plan doesn't include job postings. Upgrade to start hiring!");
        } else if (currentPostings >= maxPostings) {
          // Limit reached
          setCanPostJob(false);
          setLimitMessage(`You've used all ${maxPostings} job postings for this month. Upgrade for more!`);
        } else {
          // Still have postings left
          setCanPostJob(true);
          setLimitMessage(`${maxPostings - currentPostings} of ${maxPostings} job postings remaining this month`);
        }
      } else {
        // No subscription found - create free tier subscription
        const newSubscription = await base44.entities.Subscription.create({
          user_id: userData.id,
          plan_type: "free",
          user_type: "employer",
          status: "active",
          features: {
            max_job_postings_per_month: 0
          },
          jobs_posted_this_month: 0,
          last_job_post_reset: new Date().toISOString()
        });
        setSubscription(newSubscription);
        setCanPostJob(false);
        setLimitMessage("Your current plan doesn't include job postings. Upgrade to start hiring!");
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title?.trim()) newErrors.title = "Job title is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    if (formData.required_roles.length === 0) newErrors.required_roles = "Select at least one role";
    if (!formData.payment_type) newErrors.payment_type = "Payment type is required";
    if (!formData.budget_range?.trim()) newErrors.budget_range = "Budget range is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canPostJob) {
      alert("You've reached your job posting limit. Please upgrade your plan to post more jobs.");
      return;
    }

    if (!validate()) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      if (!user) {
        throw new Error("User not loaded. Please try again.");
      }

      await base44.entities.Job.create({
        ...formData,
        employer_id: user.id,
        status: "Open"
      });

      // Increment job posting counter
      if (subscription) {
        await base44.entities.Subscription.update(subscription.id, {
          jobs_posted_this_month: jobsPostedThisMonth + 1,
          last_job_post_reset: new Date().toISOString() // Update reset date to ensure current month count is accurate
        });
      }

      alert("Job posted successfully!");
      window.location.href = createPageUrl("EmployerDashboard");
    } catch (error) {
      console.error('Error posting job:', error);
      alert("Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (useWizard) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Button
            onClick={() => setUseWizard(false)}
            variant="outline"
            className="glass-card border-0 text-white hover:bg-white/5"
          >
            ← Switch to Manual Form
          </Button>
        </div>
        <JobPostingWizard onComplete={() => setUseWizard(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
          <p className="text-gray-600">Find the perfect Roblox developer for your project</p>
        </div>

        {/* Subscription Status Alert */}
        {!canPostJob && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <span>{limitMessage}</span>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white ml-4"
                  onClick={() => window.location.href = createPageUrl("Premium")}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {canPostJob && limitMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {limitMessage}
              {subscription?.features?.max_job_postings_per_month !== -1 && (
                <Button
                  size="sm"
                  variant="link"
                  className="text-green-700 underline ml-2 p-0 h-auto"
                  onClick={() => window.location.href = createPageUrl("Premium")}
                >
                  Need more? Upgrade
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* AI Wizard Option */}
        <Card className="mb-6 border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Try AI Job Posting Wizard</h3>
                  <p className="text-gray-600 text-sm">Let AI help you create the perfect job posting</p>
                </div>
              </div>
              <Button
                onClick={() => setUseWizard(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!canPostJob}
              >
                Use AI Wizard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Job Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Expert Lua Scripter Needed"
                  className={errors.title ? "border-red-500" : ""}
                  disabled={!canPostJob}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your project, requirements, and what you're looking for..."
                  rows={6}
                  className={errors.description ? "border-red-500" : ""}
                  disabled={!canPostJob}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Required Roles *</label>
                <Select
                  value={formData.required_roles[0] || ""}
                  onValueChange={(value) => setFormData({...formData, required_roles: [value]})}
                  disabled={!canPostJob}
                >
                  <SelectTrigger className={errors.required_roles ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select primary role" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Scripter", "Builder", "UI/UX Designer", "3D Modeler", "Sound Designer", "Game Designer", "Artist", "Animator", "VFX Designer"].map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.required_roles && <p className="text-red-500 text-sm mt-1">{errors.required_roles}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment & Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Type *</label>
                <Select
                  value={formData.payment_type}
                  onValueChange={(value) => setFormData({...formData, payment_type: value})}
                  disabled={!canPostJob}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Robux">Robux</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="Percentage">Revenue Share %</SelectItem>
                    <SelectItem value="Fixed Price">Fixed Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget Range *</label>
                <Input
                  value={formData.budget_range}
                  onChange={(e) => setFormData({...formData, budget_range: e.target.value})}
                  placeholder="e.g., $500-$1000 or 10,000-20,000 Robux"
                  className={errors.budget_range ? "border-red-500" : ""}
                  disabled={!canPostJob}
                />
                {errors.budget_range && <p className="text-red-500 text-sm mt-1">{errors.budget_range}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Timeline</label>
                <Input
                  value={formData.timeline}
                  onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                  placeholder="e.g., 2-3 weeks, 1 month, Ongoing"
                  disabled={!canPostJob}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Scope</label>
                <Select
                  value={formData.project_scope}
                  onValueChange={(value) => setFormData({...formData, project_scope: value})}
                  disabled={!canPostJob}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small Task">Small Task</SelectItem>
                    <SelectItem value="Part-time Project">Part-time Project</SelectItem>
                    <SelectItem value="Full-time Project">Full-time Project</SelectItem>
                    <SelectItem value="Long-term Partnership">Long-term Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => setFormData({...formData, experience_level: value})}
                  disabled={!canPostJob}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = createPageUrl("EmployerDashboard")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !canPostJob}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
