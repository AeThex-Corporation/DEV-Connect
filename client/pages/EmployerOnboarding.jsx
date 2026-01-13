import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Building,
  Briefcase,
  CreditCard,
  Rocket,
  Users
} from "lucide-react";

export default function EmployerOnboarding() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyData, setCompanyData] = useState({
    company_name: "",
    tagline: "",
    description: "",
    industry: "Gaming",
    company_size: "1-10",
    location: "",
    website_url: "",
    mission: ""
  });
  const [firstJobData, setFirstJobData] = useState({
    title: "",
    description: "",
    required_roles: [],
    payment_type: "USD",
    budget_range: "",
    timeline: "",
    experience_level: "Intermediate"
  });

  const industries = ["Gaming", "Education", "Entertainment", "Simulation", "Social", "Other"];
  const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];
  const roles = ["Scripter", "Builder", "UI/UX Designer", "3D Modeler", "Sound Designer", "Game Designer"];
  const paymentTypes = ["USD", "Robux", "Fixed Price", "Rev-Share"];
  const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin(createPageUrl("EmployerOnboarding"));
        return;
      }

      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check if user already completed employer onboarding
      const existingProfile = await base44.entities.CompanyProfile.filter({ user_id: currentUser.id });
      if (existingProfile.length > 0) {
        window.location.href = createPageUrl("EmployerDashboard");
        return;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role) => {
    const roles = firstJobData.required_roles || [];
    if (roles.includes(role)) {
      setFirstJobData({
        ...firstJobData,
        required_roles: roles.filter(r => r !== role)
      });
    } else {
      setFirstJobData({
        ...firstJobData,
        required_roles: [...roles, role]
      });
    }
  };

  const handleComplete = async () => {
    if (!companyData.company_name || !companyData.description) {
      alert('Please complete required company information');
      return;
    }

    setSaving(true);
    try {
      // Create company profile
      await base44.entities.CompanyProfile.create({
        user_id: user.id,
        ...companyData
      });

      // Create first job if details provided
      if (firstJobData.title && firstJobData.description) {
        await base44.entities.Job.create({
          ...firstJobData,
          employer_id: user.id,
          status: "Open"
        });
      }

      // Award XP and badge
      await base44.auth.updateMe({
        xp_points: (user.xp_points || 0) + 150,
        badges: [...(user.badges || []), 'employer', 'first_job_posted']
      });

      // Create welcome notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🎉 Welcome to Devconnect Employers!',
        message: 'Your company profile is set up! Earned 150 XP. Start finding great developers!',
        link: createPageUrl('EmployerDashboard')
      });

      window.location.href = createPageUrl("EmployerDashboard");
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete setup. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4 sm:px-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Step {step} of {totalSteps}
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to <span className="gradient-text">Devconnect</span>
          </h1>
          <p className="text-gray-400">Let's set up your company profile</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Step Content */}
        <Card className="glass-card border-0 mb-8">
          <CardContent className="p-8">
            {/* Step 1: Company Basics */}
            {step === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Company Information</h2>
                    <p className="text-gray-400 text-sm">Tell us about your company</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Company Name *</label>
                    <Input
                      value={companyData.company_name}
                      onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                      placeholder="Acme Studios"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Tagline</label>
                    <Input
                      value={companyData.tagline}
                      onChange={(e) => setCompanyData({ ...companyData, tagline: e.target.value })}
                      placeholder="Building the future of Roblox gaming"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Description *</label>
                    <Textarea
                      value={companyData.description}
                      onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                      placeholder="Tell developers about your company, what you do, and what makes your team special..."
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-32"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Industry</label>
                      <Select value={companyData.industry} onValueChange={(value) => setCompanyData({ ...companyData, industry: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map(ind => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Company Size</label>
                      <Select value={companyData.company_size} onValueChange={(value) => setCompanyData({ ...companyData, company_size: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map(size => (
                            <SelectItem key={size} value={size}>{size} employees</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Location</label>
                    <Input
                      value={companyData.location}
                      onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                      placeholder="e.g., Remote, San Francisco, USA"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Company Details */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Company Details</h2>
                    <p className="text-gray-400 text-sm">Help developers learn more about you</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Mission Statement</label>
                    <Textarea
                      value={companyData.mission}
                      onChange={(e) => setCompanyData({ ...companyData, mission: e.target.value })}
                      placeholder="What drives your company? What are your goals?"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-24"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Website URL</label>
                    <Input
                      type="url"
                      value={companyData.website_url}
                      onChange={(e) => setCompanyData({ ...companyData, website_url: e.target.value })}
                      placeholder="https://yourcompany.com"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: First Job Post (Optional) */}
            {step === 3 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Post Your First Job (Optional)</h2>
                    <p className="text-gray-400 text-sm">Start finding talent right away</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Job Title</label>
                    <Input
                      value={firstJobData.title}
                      onChange={(e) => setFirstJobData({ ...firstJobData, title: e.target.value })}
                      placeholder="e.g., Senior Scripter for RPG Game"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Job Description</label>
                    <Textarea
                      value={firstJobData.description}
                      onChange={(e) => setFirstJobData({ ...firstJobData, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-32"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Required Roles</label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map(role => (
                        <Button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          variant={firstJobData.required_roles?.includes(role) ? "default" : "outline"}
                          size="sm"
                          className={firstJobData.required_roles?.includes(role)
                            ? "btn-primary text-white"
                            : "glass-card border-white/20 text-white hover:bg-white/5"
                          }
                        >
                          {firstJobData.required_roles?.includes(role) && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {role}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Payment Type</label>
                      <Select value={firstJobData.payment_type} onValueChange={(value) => setFirstJobData({ ...firstJobData, payment_type: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Budget Range</label>
                      <Input
                        value={firstJobData.budget_range}
                        onChange={(e) => setFirstJobData({ ...firstJobData, budget_range: e.target.value })}
                        placeholder="e.g., $1000-$3000"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Timeline</label>
                      <Input
                        value={firstJobData.timeline}
                        onChange={(e) => setFirstJobData({ ...firstJobData, timeline: e.target.value })}
                        placeholder="e.g., 2-3 months"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="text-white text-sm font-medium mb-2 block">Experience Level</label>
                      <Select value={firstJobData.experience_level} onValueChange={(value) => setFirstJobData({ ...firstJobData, experience_level: value })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Launch */}
            {step === 4 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Review & Launch</h2>
                    <p className="text-gray-400 text-sm">You're almost ready!</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card className="glass-card border-0 bg-white/5">
                    <CardContent className="p-4">
                      <h3 className="text-white font-semibold mb-3">Company Profile</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Company:</span>
                          <span className="text-white">{companyData.company_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Industry:</span>
                          <span className="text-white">{companyData.industry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Size:</span>
                          <span className="text-white">{companyData.company_size} employees</span>
                        </div>
                        {companyData.location && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Location:</span>
                            <span className="text-white">{companyData.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {firstJobData.title && (
                    <Card className="glass-card border-0 bg-white/5">
                      <CardContent className="p-4">
                        <h3 className="text-white font-semibold mb-3">First Job Posting</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Title:</span>
                            <span className="text-white">{firstJobData.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Budget:</span>
                            <span className="text-white">{firstJobData.budget_range || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Timeline:</span>
                            <span className="text-white">{firstJobData.timeline || 'Flexible'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="glass-card rounded-lg p-4 bg-green-500/5">
                    <p className="text-green-400 text-sm">
                      🎉 You'll earn <strong>150 XP</strong> and employer badges for completing your profile!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            variant="outline"
            className="glass-card border-white/20 text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!companyData.company_name || !companyData.description)}
              className="btn-primary text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={saving || !companyData.company_name || !companyData.description}
              className="btn-primary text-white"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}