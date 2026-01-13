import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Lightbulb,
  MessageSquare
} from "lucide-react";

export default function EmployerOnboardingWizard({ user }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    required_roles: [],
    required_skills: [],
    experience_level: "Intermediate",
    payment_type: "Fixed Price",
    budget_range: "",
    timeline: "",
    project_scope: "Part-time Project",
    game_genre: "Other"
  });
  const [budgetEstimate, setBudgetEstimate] = useState(null);
  const [aiJobDescription, setAiJobDescription] = useState(null);

  const navigate = useNavigate();

  const roles = ["Scripter", "Builder", "UI/UX Designer", "3D Modeler", "Sound Designer", "Game Designer", "Artist", "Animator"];
  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const calculateBudget = async () => {
    try {
      const prompt = `
You are a budget advisor for Roblox game development projects.

PROJECT DETAILS:
- Roles Needed: ${jobData.required_roles.join(', ')}
- Experience Level: ${jobData.experience_level}
- Timeline: ${jobData.timeline}
- Project Scope: ${jobData.project_scope}
- Game Genre: ${jobData.game_genre}

PROVIDE A DETAILED BUDGET BREAKDOWN:
1. Recommended budget range (min-max in USD and Robux)
2. Cost per role type
3. Estimated hours per role
4. Payment structure recommendation
5. Budget allocation tips
6. Industry benchmarks
7. Cost-saving suggestions without compromising quality

Be realistic and based on current Roblox development market rates.
`;

      const estimate = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_budget_usd: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" }
              }
            },
            recommended_budget_robux: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" }
              }
            },
            role_breakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  estimated_hours: { type: "number" },
                  hourly_rate: { type: "string" },
                  total_cost: { type: "string" }
                }
              }
            },
            payment_structure: { type: "string" },
            budget_tips: {
              type: "array",
              items: { type: "string" }
            },
            cost_saving_tips: {
              type: "array",
              items: { type: "string" }
            },
            market_insight: { type: "string" }
          }
        }
      });

      setBudgetEstimate(estimate);
    } catch (error) {
      console.error('Error calculating budget:', error);
    }
  };

  const generateJobDescription = async () => {
    try {
      const prompt = `
You are an expert at writing compelling Roblox job postings that attract top talent.

PROJECT OUTLINE:
- Title: ${jobData.title}
- Roles: ${jobData.required_roles.join(', ')}
- Experience: ${jobData.experience_level}
- Scope: ${jobData.project_scope}
- Genre: ${jobData.game_genre}
- Timeline: ${jobData.timeline}
- Current Description: ${jobData.description || 'None provided'}

CREATE AN OPTIMIZED JOB DESCRIPTION:
1. Compelling opening hook (1-2 sentences)
2. Project overview (what makes it exciting)
3. Responsibilities (bullet points)
4. Required qualifications
5. Nice-to-have skills
6. What you offer (compensation, growth, recognition)
7. Call-to-action

Make it professional, exciting, and specific. Avoid generic language.
`;

      const aiDescription = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            optimized_title: { type: "string" },
            opening_hook: { type: "string" },
            full_description: { type: "string" },
            responsibilities: {
              type: "array",
              items: { type: "string" }
            },
            required_skills: {
              type: "array",
              items: { type: "string" }
            },
            nice_to_have: {
              type: "array",
              items: { type: "string" }
            },
            selling_points: {
              type: "array",
              items: { type: "string" }
            },
            improvement_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAiJobDescription(aiDescription);
    } catch (error) {
      console.error('Error generating job description:', error);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Create the job posting
      const job = await base44.entities.Job.create({
        ...jobData,
        employer_id: user.id,
        status: "Open",
        description: aiJobDescription?.full_description || jobData.description
      });

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'job_match',
        title: '🎉 Job Posted Successfully!',
        message: `Your job "${jobData.title}" is now live and visible to developers.`,
        link: createPageUrl('EmployerDashboard')
      });

      navigate(createPageUrl("EmployerDashboard"));
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role) => {
    const roles = jobData.required_roles || [];
    if (roles.includes(role)) {
      setJobData({
        ...jobData,
        required_roles: roles.filter(r => r !== role)
      });
    } else {
      setJobData({
        ...jobData,
        required_roles: [...roles, role]
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Briefcase className="w-3 h-3 mr-1" />
            Step {step} of {totalSteps}
          </Badge>
          <span className="text-gray-400 text-sm">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <Card className="glass-card border-0 mb-6">
        <CardContent className="p-8">
          {/* Step 1: Project Basics */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Tell Us About Your Project</h2>
                  <p className="text-gray-400 text-sm">Basic information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Job Title</label>
                  <Input
                    value={jobData.title}
                    onChange={(e) => setJobData({...jobData, title: e.target.value})}
                    placeholder="e.g., Experienced Lua Scripter for RPG Game"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Game Genre</label>
                  <Select value={jobData.game_genre} onValueChange={(val) => setJobData({...jobData, game_genre: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Simulator", "RPG", "Obby", "Tycoon", "FPS", "Fighting", "Horror", "Story Game", "Showcase", "Other"].map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Project Scope</label>
                  <Select value={jobData.project_scope} onValueChange={(val) => setJobData({...jobData, project_scope: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Small Task", "Part-time Project", "Full-time Project", "Long-term Partnership"].map(scope => (
                        <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Timeline</label>
                  <Select value={jobData.timeline} onValueChange={(val) => setJobData({...jobData, timeline: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                      <SelectItem value="1-2 months">1-2 months</SelectItem>
                      <SelectItem value="2-3 months">2-3 months</SelectItem>
                      <SelectItem value="3+ months">3+ months</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Brief Description</label>
                  <Textarea
                    value={jobData.description}
                    onChange={(e) => setJobData({...jobData, description: e.target.value})}
                    placeholder="What's your project about? What needs to be done?"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-32"
                  />
                  <p className="text-gray-500 text-xs mt-2">Don't worry, we'll help you optimize this with AI in the next steps!</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Roles & Skills */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Who Do You Need?</h2>
                  <p className="text-gray-400 text-sm">Select required roles and skills</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-white text-sm font-medium mb-3 block">Required Roles</label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map(role => (
                      <Button
                        key={role}
                        onClick={() => toggleRole(role)}
                        variant={jobData.required_roles?.includes(role) ? "default" : "outline"}
                        className={jobData.required_roles?.includes(role)
                          ? "btn-primary text-white justify-start"
                          : "glass-card border-white/20 text-white hover:bg-white/5 justify-start"
                        }
                      >
                        {jobData.required_roles?.includes(role) && <CheckCircle className="w-4 h-4 mr-2" />}
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-3 block">Experience Level Required</label>
                  <Select value={jobData.experience_level} onValueChange={(val) => setJobData({...jobData, experience_level: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner (0-1 years)</SelectItem>
                      <SelectItem value="Intermediate">Intermediate (1-3 years)</SelectItem>
                      <SelectItem value="Advanced">Advanced (3-5 years)</SelectItem>
                      <SelectItem value="Expert">Expert (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="glass-card rounded-lg p-4 bg-blue-500/5">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-400 text-sm font-medium">Hiring Tip</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Being flexible with experience levels can increase your applicant pool. Consider "Intermediate" if the role can be learned quickly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget Calculator */}
          {step === 3 && (
            <div>
              {!budgetEstimate ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white">Calculating budget recommendations...</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Budget Recommendations</h2>
                      <p className="text-gray-400 text-sm">AI-calculated estimates for your project</p>
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <Card className="glass-card border-0 bg-green-500/10">
                      <CardContent className="p-6">
                        <p className="text-gray-400 text-sm mb-2">Recommended Budget (USD)</p>
                        <p className="text-white text-2xl font-bold">
                          ${budgetEstimate.recommended_budget_usd?.min?.toLocaleString()} - ${budgetEstimate.recommended_budget_usd?.max?.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-0 bg-blue-500/10">
                      <CardContent className="p-6">
                        <p className="text-gray-400 text-sm mb-2">Recommended Budget (Robux)</p>
                        <p className="text-white text-2xl font-bold">
                          R$ {budgetEstimate.recommended_budget_robux?.min?.toLocaleString()} - R$ {budgetEstimate.recommended_budget_robux?.max?.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Role Breakdown */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">💰 Cost Breakdown by Role</h3>
                    <div className="space-y-2">
                      {budgetEstimate.role_breakdown?.map((role, i) => (
                        <div key={i} className="glass-card rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">{role.role}</p>
                            <Badge className="bg-green-500/20 text-green-400 border-0">
                              {role.total_cost}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{role.estimated_hours} hours</span>
                            <span>•</span>
                            <span>{role.hourly_rate}/hr</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Structure */}
                  <div className="mb-6 glass-card rounded-lg p-4 bg-indigo-500/5">
                    <p className="text-indigo-400 text-sm font-medium mb-2">💡 Recommended Payment Structure</p>
                    <p className="text-gray-300 text-sm">{budgetEstimate.payment_structure}</p>
                  </div>

                  {/* Budget Tips */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">📊 Budget Tips</h3>
                    <div className="space-y-2">
                      {budgetEstimate.budget_tips?.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 glass-card rounded-lg p-3">
                          <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Saving Tips */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">💡 Cost-Saving Strategies</h3>
                    <div className="space-y-2">
                      {budgetEstimate.cost_saving_tips?.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 glass-card rounded-lg p-3">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Market Insight */}
                  <div className="glass-card rounded-lg p-4 bg-yellow-500/5">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 text-sm font-medium mb-1">Market Insight</p>
                        <p className="text-gray-300 text-xs">{budgetEstimate.market_insight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Set Budget */}
                  <div className="mt-6">
                    <label className="text-white text-sm font-medium mb-2 block">Set Your Budget</label>
                    <Input
                      value={jobData.budget_range}
                      onChange={(e) => setJobData({...jobData, budget_range: e.target.value})}
                      placeholder="e.g., $500-$1000 or 50k-100k Robux"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: AI Job Description */}
          {step === 4 && (
            <div>
              {!aiJobDescription ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white">AI is writing your job description...</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Optimized Job Description</h2>
                      <p className="text-gray-400 text-sm">AI-generated to attract top talent</p>
                    </div>
                  </div>

                  {/* Optimized Title */}
                  <div className="mb-6">
                    <label className="text-gray-400 text-xs font-medium mb-2 block">AI-Optimized Title</label>
                    <Input
                      value={aiJobDescription.optimized_title}
                      onChange={(e) => setJobData({...jobData, title: e.target.value})}
                      className="bg-white/5 border-white/10 text-white font-semibold text-lg"
                    />
                  </div>

                  {/* Opening Hook */}
                  <div className="mb-6">
                    <label className="text-gray-400 text-xs font-medium mb-2 block">Opening Hook</label>
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-white text-sm">{aiJobDescription.opening_hook}</p>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="mb-6">
                    <label className="text-gray-400 text-xs font-medium mb-2 block">Full Description</label>
                    <Textarea
                      value={aiJobDescription.full_description}
                      onChange={(e) => setJobData({...jobData, description: e.target.value})}
                      className="bg-white/5 border-white/10 text-white h-64"
                    />
                  </div>

                  {/* Responsibilities */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">📋 Responsibilities</h3>
                    <div className="space-y-2">
                      {aiJobDescription.responsibilities?.map((resp, i) => (
                        <div key={i} className="flex items-start gap-2 glass-card rounded-lg p-3">
                          <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{resp}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selling Points */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">⭐ What Makes This Opportunity Great</h3>
                    <div className="space-y-2">
                      {aiJobDescription.selling_points?.map((point, i) => (
                        <div key={i} className="flex items-start gap-2 glass-card rounded-lg p-3">
                          <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Improvement Tips */}
                  <div className="glass-card rounded-lg p-4 bg-blue-500/5">
                    <h3 className="text-blue-400 font-semibold mb-3 text-sm">💡 Tips to Improve Your Listing</h3>
                    <div className="space-y-1">
                      {aiJobDescription.improvement_tips?.map((tip, i) => (
                        <p key={i} className="text-gray-300 text-xs">• {tip}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Dashboard Tour Preview */}
          {step === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">What Happens Next?</h2>
                  <p className="text-gray-400 text-sm">Quick tour of your Employer Dashboard</p>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="glass-card border-0 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Track Applications</h3>
                        <p className="text-gray-400 text-sm">
                          View all applications in one place. Sort by match score, experience, and ratings.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">View Analytics</h3>
                        <p className="text-gray-400 text-sm">
                          See views, conversion rates, and performance metrics for your job posting.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">AI-Matched Candidates</h3>
                        <p className="text-gray-400 text-sm">
                          Our AI will automatically find and suggest the best matching developers for your role.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Message Candidates</h3>
                        <p className="text-gray-400 text-sm">
                          Built-in messaging system to communicate directly with applicants.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="glass-card rounded-lg p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 mt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h3 className="text-white font-semibold text-lg">You're All Set!</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Your job will be posted immediately and visible to thousands of Roblox developers. 
                    You'll receive notifications when developers apply.
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
            onClick={async () => {
              if (step === 2 && !budgetEstimate) {
                await calculateBudget();
              } else if (step === 3 && !aiJobDescription) {
                await generateJobDescription();
              }
              setStep(step + 1);
            }}
            className="btn-primary text-white"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={saving || !jobData.title || jobData.required_roles.length === 0}
            className="btn-primary text-white"
          >
            {saving ? 'Posting Job...' : (
              <>
                <Briefcase className="w-4 h-4 mr-2" />
                Post Job
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}