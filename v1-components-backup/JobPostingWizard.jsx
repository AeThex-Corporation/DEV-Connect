import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Wand2,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  AlertCircle,
  Check,
  X
} from "lucide-react";

export default function JobPostingWizard({ onComplete, initialData = {} }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [optimizationScore, setOptimizationScore] = useState(0);
  
  const [jobData, setJobData] = useState({
    title: initialData.title || "",
    industry: initialData.industry || "Gaming",
    description: initialData.description || "",
    required_roles: initialData.required_roles || [],
    required_skills: initialData.required_skills || [],
    responsibilities: initialData.responsibilities || [],
    qualifications: initialData.qualifications || [],
    benefits: initialData.benefits || [],
    company_culture: initialData.company_culture || [],
    payment_type: initialData.payment_type || "Robux",
    budget_range: initialData.budget_range || "",
    timeline: initialData.timeline || "",
    project_scope: initialData.project_scope || "Full-time Project",
    experience_level: initialData.experience_level || "Intermediate"
  });

  const steps = [
    {
      title: "Job Basics",
      icon: Target,
      description: "Let's start with the fundamentals"
    },
    {
      title: "Skills & Requirements",
      icon: Users,
      description: "Define what you're looking for"
    },
    {
      title: "Description & Culture",
      icon: Sparkles,
      description: "Make your job stand out"
    },
    {
      title: "Benefits & Compensation",
      icon: TrendingUp,
      description: "Attract top talent"
    },
    {
      title: "Review & Optimize",
      icon: CheckCircle,
      description: "Final touches"
    }
  ];

  const generateAISuggestions = async (step) => {
    setLoading(true);
    try {
      let prompt = "";
      let responseSchema = {};

      switch(step) {
        case 0: // Job Basics
          prompt = `
You are an expert job posting consultant. Given this job title: "${jobData.title}" in the ${jobData.industry} industry:

1. Suggest 3 alternative, optimized job titles that would attract more qualified candidates
2. Provide SEO keywords that should be included in the job description
3. Suggest the ideal experience level
4. Rate the current title's effectiveness (1-10)

Consider:
- Search volume and discoverability
- Industry standards
- Clarity and appeal
- Roblox development context
`;
          responseSchema = {
            type: "object",
            properties: {
              alternative_titles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    reason: { type: "string" },
                    score: { type: "number" }
                  }
                }
              },
              seo_keywords: {
                type: "array",
                items: { type: "string" }
              },
              recommended_experience: { type: "string" },
              title_effectiveness: { type: "number" },
              optimization_tips: {
                type: "array",
                items: { type: "string" }
              }
            }
          };
          break;

        case 1: // Skills & Requirements
          prompt = `
You are a Roblox development expert. For a "${jobData.title}" position in ${jobData.industry}:

1. Suggest 8-12 relevant required skills (specific technologies, tools, programming languages)
2. Suggest appropriate developer roles (Scripter, Builder, UI/UX Designer, etc.)
3. List 5-7 key responsibilities for this role
4. List 3-5 essential qualifications
5. Suggest nice-to-have skills

Focus on Roblox-specific skills and tools.
`;
          responseSchema = {
            type: "object",
            properties: {
              required_skills: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill: { type: "string" },
                    importance: { type: "string" },
                    reasoning: { type: "string" }
                  }
                }
              },
              suggested_roles: {
                type: "array",
                items: { type: "string" }
              },
              responsibilities: {
                type: "array",
                items: { type: "string" }
              },
              qualifications: {
                type: "array",
                items: { type: "string" }
              },
              nice_to_have: {
                type: "array",
                items: { type: "string" }
              }
            }
          };
          break;

        case 2: // Description & Culture
          prompt = `
You are an expert copywriter specializing in job descriptions. For a "${jobData.title}" role:

Current description: ${jobData.description || "None provided"}

1. If description is empty or weak, write 3 compelling job description variations (short, medium, long)
2. Suggest 5-7 company culture points that would appeal to developers
3. Provide 3-5 engaging opening statements
4. Suggest keywords to include for better searchability
5. Rate the current description (if provided) and suggest improvements

Make it exciting and professional while being authentic.
`;
          responseSchema = {
            type: "object",
            properties: {
              description_variations: {
                type: "object",
                properties: {
                  short: { type: "string" },
                  medium: { type: "string" },
                  long: { type: "string" }
                }
              },
              culture_points: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    point: { type: "string" },
                    appeal: { type: "string" }
                  }
                }
              },
              opening_statements: {
                type: "array",
                items: { type: "string" }
              },
              search_keywords: {
                type: "array",
                items: { type: "string" }
              },
              improvement_tips: {
                type: "array",
                items: { type: "string" }
              }
            }
          };
          break;

        case 3: // Benefits & Compensation
          prompt = `
You are a compensation and benefits expert. For a "${jobData.title}" position with payment type "${jobData.payment_type}":

1. Suggest competitive salary/compensation ranges based on role and experience level (${jobData.experience_level})
2. Suggest 6-8 attractive benefits that Roblox developers value
3. Provide market insights about compensation expectations
4. Suggest how to frame the compensation to be most attractive
5. If budget range is provided (${jobData.budget_range}), assess if it's competitive

Consider:
- Roblox development market rates
- Remote work considerations
- Industry standards
`;
          responseSchema = {
            type: "object",
            properties: {
              compensation_ranges: {
                type: "object",
                properties: {
                  low: { type: "string" },
                  mid: { type: "string" },
                  high: { type: "string" },
                  reasoning: { type: "string" }
                }
              },
              suggested_benefits: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    benefit: { type: "string" },
                    appeal_score: { type: "number" },
                    description: { type: "string" }
                  }
                }
              },
              market_insights: { type: "string" },
              compensation_tips: {
                type: "array",
                items: { type: "string" }
              },
              budget_assessment: { type: "string" }
            }
          };
          break;

        case 4: // Final Review
          prompt = `
You are a job posting optimization expert. Review this complete job posting:

Title: ${jobData.title}
Industry: ${jobData.industry}
Description: ${jobData.description}
Skills: ${jobData.required_skills.join(', ')}
Roles: ${jobData.required_roles.join(', ')}
Experience: ${jobData.experience_level}
Payment: ${jobData.payment_type} - ${jobData.budget_range}

Provide:
1. Overall optimization score (0-100)
2. Specific areas that need improvement
3. Strengths of the posting
4. Final optimization suggestions
5. Predicted application rate (low/medium/high)
6. Missing elements that should be added
`;
          responseSchema = {
            type: "object",
            properties: {
              optimization_score: { type: "number" },
              areas_to_improve: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    area: { type: "string" },
                    severity: { type: "string" },
                    suggestion: { type: "string" }
                  }
                }
              },
              strengths: {
                type: "array",
                items: { type: "string" }
              },
              final_suggestions: {
                type: "array",
                items: { type: "string" }
              },
              predicted_application_rate: { type: "string" },
              missing_elements: {
                type: "array",
                items: { type: "string" }
              }
            }
          };
          break;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: responseSchema
      });

      setAiSuggestions(prev => ({ ...prev, [step]: response }));
      
      if (step === 4 && response.optimization_score) {
        setOptimizationScore(response.optimization_score);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      alert('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (field, value) => {
    if (Array.isArray(value)) {
      setJobData(prev => ({
        ...prev,
        [field]: [...new Set([...prev[field], ...value])]
      }));
    } else {
      setJobData(prev => ({ ...prev, [field]: value }));
    }
  };

  const renderStepContent = () => {
    const stepSuggestions = aiSuggestions[currentStep];

    switch(currentStep) {
      case 0: // Job Basics
        return (
          <div className="space-y-6">
            <div>
              <label className="text-white font-medium mb-2 block">Job Title *</label>
              <Input
                value={jobData.title}
                onChange={(e) => setJobData({...jobData, title: e.target.value})}
                placeholder="e.g., Senior Lua Scripter"
                className="bg-white/5 border-white/20 text-white text-lg"
              />
              <p className="text-gray-400 text-xs mt-1">
                Be specific and include the primary skill/role
              </p>
            </div>

            {stepSuggestions?.alternative_titles && (
              <Card className="glass-card border-0 bg-indigo-500/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    AI-Optimized Title Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stepSuggestions.alternative_titles.map((alt, i) => (
                    <div key={i} className="glass-card rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="text-white font-medium">{alt.title}</p>
                          <p className="text-gray-400 text-xs mt-1">{alt.reason}</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                          Score: {alt.score}/10
                        </Badge>
                      </div>
                      <Button
                        onClick={() => setJobData({...jobData, title: alt.title})}
                        size="sm"
                        className="btn-primary text-white mt-2"
                      >
                        Use This Title
                      </Button>
                    </div>
                  ))}
                  
                  {stepSuggestions.optimization_tips && (
                    <div className="mt-3 p-3 glass-card rounded-lg bg-blue-500/10">
                      <p className="text-blue-400 font-medium text-xs mb-2">Optimization Tips:</p>
                      <ul className="space-y-1">
                        {stepSuggestions.optimization_tips.map((tip, i) => (
                          <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                            <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white font-medium mb-2 block">Industry</label>
                <select
                  value={jobData.industry}
                  onChange={(e) => setJobData({...jobData, industry: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-2"
                >
                  <option value="Gaming">Gaming</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Simulation">Simulation</option>
                  <option value="Social">Social</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Experience Level</label>
                <select
                  value={jobData.experience_level}
                  onChange={(e) => setJobData({...jobData, experience_level: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-2"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            {stepSuggestions?.seo_keywords && (
              <div className="glass-card rounded-lg p-4 bg-purple-500/10">
                <p className="text-purple-400 font-medium text-sm mb-2">
                  SEO Keywords to Include:
                </p>
                <div className="flex flex-wrap gap-2">
                  {stepSuggestions.seo_keywords.map((keyword, i) => (
                    <Badge key={i} className="bg-purple-500/20 text-purple-300 border-0">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 1: // Skills & Requirements
        return (
          <div className="space-y-6">
            {stepSuggestions?.required_skills && (
              <Card className="glass-card border-0 bg-indigo-500/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    AI-Recommended Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stepSuggestions.required_skills.map((skill, i) => (
                      <div key={i} className="glass-card rounded-lg p-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium text-sm">{skill.skill}</p>
                            <Badge className={`text-xs border-0 ${
                              skill.importance === 'Critical' ? 'bg-red-500/20 text-red-400' :
                              skill.importance === 'Important' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {skill.importance}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-xs">{skill.reasoning}</p>
                        </div>
                        <Button
                          onClick={() => {
                            if (!jobData.required_skills.includes(skill.skill)) {
                              setJobData({
                                ...jobData,
                                required_skills: [...jobData.required_skills, skill.skill]
                              });
                            }
                          }}
                          size="sm"
                          className="btn-primary text-white ml-2"
                          disabled={jobData.required_skills.includes(skill.skill)}
                        >
                          {jobData.required_skills.includes(skill.skill) ? 'Added' : 'Add'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <label className="text-white font-medium mb-2 block">Selected Skills ({jobData.required_skills.length})</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {jobData.required_skills.map((skill, i) => (
                  <Badge key={i} className="bg-purple-500/20 text-purple-300 border-0">
                    {skill}
                    <button
                      onClick={() => setJobData({
                        ...jobData,
                        required_skills: jobData.required_skills.filter(s => s !== skill)
                      })}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {stepSuggestions?.responsibilities && (
              <div>
                <label className="text-white font-medium mb-2 block">Key Responsibilities</label>
                <div className="space-y-2">
                  {stepSuggestions.responsibilities.map((resp, i) => (
                    <div key={i} className="glass-card rounded-lg p-3 flex items-center justify-between">
                      <p className="text-gray-300 text-sm flex-1">{resp}</p>
                      <Button
                        onClick={() => {
                          if (!jobData.responsibilities.includes(resp)) {
                            setJobData({
                              ...jobData,
                              responsibilities: [...jobData.responsibilities, resp]
                            });
                          }
                        }}
                        size="sm"
                        className="btn-primary text-white ml-2"
                        disabled={jobData.responsibilities.includes(resp)}
                      >
                        {jobData.responsibilities.includes(resp) ? <Check className="w-4 h-4" /> : 'Add'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Description & Culture
        return (
          <div className="space-y-6">
            <div>
              <label className="text-white font-medium mb-2 block">Job Description *</label>
              <Textarea
                value={jobData.description}
                onChange={(e) => setJobData({...jobData, description: e.target.value})}
                placeholder="Describe the role, project, and what makes this opportunity exciting..."
                className="bg-white/5 border-white/20 text-white h-40"
              />
            </div>

            {stepSuggestions?.description_variations && (
              <Card className="glass-card border-0 bg-green-500/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    AI-Generated Descriptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['short', 'medium', 'long'].map((length) => (
                    <div key={length} className="glass-card rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs capitalize">
                          {length}
                        </Badge>
                        <Button
                          onClick={() => setJobData({...jobData, description: stepSuggestions.description_variations[length]})}
                          size="sm"
                          className="btn-primary text-white"
                        >
                          Use This
                        </Button>
                      </div>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {stepSuggestions.description_variations[length]}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {stepSuggestions?.culture_points && (
              <div>
                <label className="text-white font-medium mb-2 block">Company Culture Points</label>
                <div className="space-y-2">
                  {stepSuggestions.culture_points.map((culture, i) => (
                    <div key={i} className="glass-card rounded-lg p-3 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{culture.point}</p>
                        <p className="text-gray-400 text-xs mt-1">{culture.appeal}</p>
                      </div>
                      <Button
                        onClick={() => {
                          if (!jobData.company_culture.includes(culture.point)) {
                            setJobData({
                              ...jobData,
                              company_culture: [...jobData.company_culture, culture.point]
                            });
                          }
                        }}
                        size="sm"
                        className="btn-primary text-white ml-2"
                        disabled={jobData.company_culture.includes(culture.point)}
                      >
                        {jobData.company_culture.includes(culture.point) ? <Check className="w-4 h-4" /> : 'Add'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Benefits & Compensation
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white font-medium mb-2 block">Payment Type</label>
                <select
                  value={jobData.payment_type}
                  onChange={(e) => setJobData({...jobData, payment_type: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-lg p-2"
                >
                  <option value="Robux">Robux</option>
                  <option value="USD">USD</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Price">Fixed Price</option>
                  <option value="Rev-Share">Rev-Share</option>
                </select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Budget Range</label>
                <Input
                  value={jobData.budget_range}
                  onChange={(e) => setJobData({...jobData, budget_range: e.target.value})}
                  placeholder="e.g., 50,000 - 100,000 R$"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            {stepSuggestions?.compensation_ranges && (
              <Card className="glass-card border-0 bg-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Market Compensation Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass-card rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Entry Level</p>
                      <p className="text-white font-semibold">{stepSuggestions.compensation_ranges.low}</p>
                    </div>
                    <div className="glass-card rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Mid Level</p>
                      <p className="text-white font-semibold">{stepSuggestions.compensation_ranges.mid}</p>
                    </div>
                    <div className="glass-card rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs mb-1">Senior</p>
                      <p className="text-white font-semibold">{stepSuggestions.compensation_ranges.high}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{stepSuggestions.compensation_ranges.reasoning}</p>
                  
                  {stepSuggestions.budget_assessment && (
                    <div className="glass-card rounded-lg p-3 bg-yellow-500/10">
                      <p className="text-yellow-400 text-xs font-medium mb-1">Your Budget Assessment:</p>
                      <p className="text-gray-300 text-xs">{stepSuggestions.budget_assessment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {stepSuggestions?.suggested_benefits && (
              <div>
                <label className="text-white font-medium mb-2 block">Benefits & Perks</label>
                <div className="space-y-2">
                  {stepSuggestions.suggested_benefits.map((benefit, i) => (
                    <div key={i} className="glass-card rounded-lg p-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white text-sm font-medium">{benefit.benefit}</p>
                          <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                            Appeal: {benefit.appeal_score}/10
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs">{benefit.description}</p>
                      </div>
                      <Button
                        onClick={() => {
                          if (!jobData.benefits.includes(benefit.benefit)) {
                            setJobData({
                              ...jobData,
                              benefits: [...jobData.benefits, benefit.benefit]
                            });
                          }
                        }}
                        size="sm"
                        className="btn-primary text-white ml-2"
                        disabled={jobData.benefits.includes(benefit.benefit)}
                      >
                        {jobData.benefits.includes(benefit.benefit) ? <Check className="w-4 h-4" /> : 'Add'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4: // Review & Optimize
        return (
          <div className="space-y-6">
            {optimizationScore > 0 && (
              <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className={`w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      optimizationScore >= 80 ? 'bg-green-500/20' :
                      optimizationScore >= 60 ? 'bg-yellow-500/20' :
                      'bg-red-500/20'
                    }`}>
                      <span className={`text-4xl font-bold ${
                        optimizationScore >= 80 ? 'text-green-400' :
                        optimizationScore >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {optimizationScore}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-xl mb-1">Optimization Score</h3>
                    <p className="text-gray-400 text-sm">
                      {optimizationScore >= 80 ? 'Excellent! Your job posting is highly optimized.' :
                       optimizationScore >= 60 ? 'Good, but there\'s room for improvement.' :
                       'Needs work to attract top candidates.'}
                    </p>
                  </div>
                  <Progress value={optimizationScore} className="h-2" />
                </CardContent>
              </Card>
            )}

            {stepSuggestions?.strengths && stepSuggestions.strengths.length > 0 && (
              <Card className="glass-card border-0 bg-green-500/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {stepSuggestions.strengths.map((strength, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {stepSuggestions?.areas_to_improve && stepSuggestions.areas_to_improve.length > 0 && (
              <Card className="glass-card border-0 bg-orange-500/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stepSuggestions.areas_to_improve.map((area, i) => (
                    <div key={i} className="glass-card rounded-lg p-3">
                      <div className="flex items-start gap-2 mb-1">
                        <Badge className={`text-xs border-0 ${
                          area.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                          area.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {area.severity}
                        </Badge>
                        <p className="text-white font-medium text-sm flex-1">{area.area}</p>
                      </div>
                      <p className="text-gray-400 text-xs">{area.suggestion}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {stepSuggestions?.predicted_application_rate && (
              <div className="glass-card rounded-lg p-4 bg-blue-500/10">
                <p className="text-blue-400 font-medium text-sm mb-1">Predicted Application Rate:</p>
                <div className="flex items-center gap-2">
                  <Badge className={`border-0 ${
                    stepSuggestions.predicted_application_rate === 'high' ? 'bg-green-500/20 text-green-400' :
                    stepSuggestions.predicted_application_rate === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {stepSuggestions.predicted_application_rate.toUpperCase()}
                  </Badge>
                  <p className="text-gray-300 text-xs">
                    Based on title, skills, and compensation
                  </p>
                </div>
              </div>
            )}

            <div className="glass-card rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Job Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Title:</span>
                  <span className="text-white">{jobData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Skills:</span>
                  <span className="text-white">{jobData.required_skills.length} specified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Benefits:</span>
                  <span className="text-white">{jobData.benefits.length} listed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Description:</span>
                  <span className="text-white">{jobData.description.length} characters</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep + 1 === 4) {
        generateAISuggestions(4); // Generate final optimization on last step
      }
    } else {
      onComplete(jobData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Job Posting Wizard</h2>
            <p className="text-gray-400 text-sm">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-400 font-semibold">{Math.round(progress)}%</p>
            <p className="text-gray-500 text-xs">Complete</p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div key={i} className={`text-center ${i === currentStep ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center ${
                  i < currentStep ? 'bg-green-500/20 text-green-400' :
                  i === currentStep ? 'bg-indigo-500/20 text-indigo-400' :
                  'bg-white/5 text-gray-500'
                }`}>
                  {i < currentStep ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <p className="text-white text-xs font-medium">{step.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>{steps[currentStep].title}</span>
            <Button
              onClick={() => generateAISuggestions(currentStep)}
              disabled={loading}
              size="sm"
              className="btn-primary text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Suggestions
                </>
              )}
            </Button>
          </CardTitle>
          <p className="text-gray-400 text-sm">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          variant="outline"
          className="glass-card border-0 text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={nextStep}
          className="btn-primary text-white"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Job Post
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}