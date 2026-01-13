
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
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Code,
  Briefcase,
  Target,
  Rocket,
  Brain,
  Award,
  TrendingUp,
  Lightbulb
} from "lucide-react";

export default function DeveloperOnboardingWizard({ user }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [portfolioSuggestions, setPortfolioSuggestions] = useState(null);
  const [profileOptimization, setProfileOptimization] = useState(null);
  
  const [profileData, setProfileData] = useState({
    developer_roles: user?.developer_roles || [],
    skills: user?.skills || [],
    experience_level: user?.experience_level || "Intermediate",
    bio: user?.bio || "",
    location: user?.location || "",
    payment_preferences: user?.payment_preferences || [],
    portfolio_links: user?.portfolio_links || {},
    work_status: user?.work_status || "Open to Work",
    years_of_experience: user?.years_of_experience || 0
  });

  const [assessmentAnswers, setAssessmentAnswers] = useState({});

  const navigate = useNavigate();

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  // AI Skill Assessment Questions
  const assessmentQuestions = [
    {
      id: 'lua_experience',
      question: 'How would you rate your Lua scripting experience?',
      type: 'scale',
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    {
      id: 'project_complexity',
      question: 'What\'s the most complex Roblox project you\'ve worked on?',
      type: 'text'
    },
    {
      id: 'datastores',
      question: 'Have you worked with DataStores or ProfileService?',
      type: 'choice',
      options: ['Never used', 'Basic knowledge', 'Proficient', 'Expert']
    },
    {
      id: 'remote_events',
      question: 'How comfortable are you with RemoteEvents and networking?',
      type: 'scale',
      options: ['Not comfortable', 'Somewhat', 'Comfortable', 'Very comfortable']
    },
    {
      id: 'building_tools',
      question: 'What building/modeling tools do you use?',
      type: 'multiple',
      options: ['Roblox Studio', 'Blender', 'Maya', '3DS Max', 'Other 3D software']
    }
  ];

  const runSkillAssessment = async () => {
    try {
      const prompt = `
You are an AI career coach analyzing a Roblox developer's skills based on their self-assessment.

DEVELOPER PROFILE:
- Roles: ${profileData.developer_roles.join(', ')}
- Years Experience: ${profileData.years_of_experience}
- Experience Level: ${profileData.experience_level}

ASSESSMENT RESPONSES:
${Object.entries(assessmentAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}

ANALYZE AND PROVIDE:
1. Skill level verification (is their self-reported level accurate?)
2. Identified strengths (top 3-5 skills they excel at)
3. Skill gaps (what they should learn next)
4. Recommended learning path
5. Market readiness score (0-100)
6. Suggested job types they should apply for

Be encouraging but honest. Provide actionable insights.
`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            verified_level: {
              type: "string",
              enum: ["Beginner", "Intermediate", "Advanced", "Expert"]
            },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            skill_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            learning_recommendations: {
              type: "array",
              items: { type: "string" }
            },
            market_readiness: {
              type: "number"
            },
            recommended_job_types: {
              type: "array",
              items: { type: "string" }
            },
            next_steps: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAssessmentResults(analysis);

      // Create skill assessment record
      await base44.entities.SkillAssessment.create({
        user_id: user.id,
        skill_name: "Roblox Development",
        assessment_type: "multiple_choice",
        score: analysis.market_readiness,
        passed: analysis.market_readiness >= 60,
        difficulty_level: profileData.experience_level.toLowerCase()
      });

    } catch (error) {
      console.error('Error running assessment:', error);
    }
  };

  const generatePortfolioSuggestions = async () => {
    try {
      const prompt = `
You are an AI career coach helping a Roblox developer build an impressive portfolio.

DEVELOPER PROFILE:
- Roles: ${profileData.developer_roles.join(', ')}
- Skills: ${profileData.skills.join(', ')}
- Experience: ${profileData.experience_level}
- Years: ${profileData.years_of_experience}

ASSESSMENT RESULTS:
- Strengths: ${assessmentResults?.strengths?.join(', ')}
- Skill Gaps: ${assessmentResults?.skill_gaps?.map(g => g.skill).join(', ')}

PROVIDE 5 PORTFOLIO PROJECT SUGGESTIONS that will:
1. Showcase their current strengths
2. Help them learn identified skill gaps
3. Be impressive to potential employers
4. Be achievable given their experience level
5. Align with trending Roblox game genres

For each project, include:
- Project name
- Description
- Key features to implement
- Skills demonstrated
- Estimated time to complete
- Why it will impress employers
- Specific implementation tips
`;

      const suggestions = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  key_features: {
                    type: "array",
                    items: { type: "string" }
                  },
                  skills_demonstrated: {
                    type: "array",
                    items: { type: "string" }
                  },
                  estimated_weeks: { type: "number" },
                  difficulty: { type: "string" },
                  why_impressive: { type: "string" },
                  implementation_tips: {
                    type: "array",
                    items: { type: "string" }
                  },
                  market_demand: { type: "string" }
                }
              }
            },
            portfolio_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setPortfolioSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating portfolio suggestions:', error);
    }
  };

  const generateProfileOptimization = async () => {
    try {
      const prompt = `
You are an AI helping optimize a Roblox developer's profile for maximum visibility and job matches.

CURRENT PROFILE:
- Roles: ${profileData.developer_roles.join(', ')}
- Skills: ${profileData.skills.join(', ')}
- Bio: ${profileData.bio}
- Experience: ${profileData.experience_level}
- Work Status: ${profileData.work_status}

PROVIDE OPTIMIZATION RECOMMENDATIONS:
1. Profile completeness score (0-100)
2. Missing critical sections
3. Bio improvement suggestions (make it more compelling)
4. Keywords to add for better search visibility
5. Profile photo/banner recommendations
6. Social proof tips (testimonials, endorsements)
7. Call-to-action suggestions
`;

      const optimization = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            completeness_score: { type: "number" },
            missing_sections: {
              type: "array",
              items: { type: "string" }
            },
            bio_improvements: {
              type: "array",
              items: { type: "string" }
            },
            suggested_bio: { type: "string" },
            seo_keywords: {
              type: "array",
              items: { type: "string" }
            },
            visibility_tips: {
              type: "array",
              items: { type: "string" }
            },
            next_actions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setProfileOptimization(optimization);
    } catch (error) {
      console.error('Error generating profile optimization:', error);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        ...profileData,
        xp_points: (user.xp_points || 0) + 150, // Bonus for completing onboarding
        last_active: new Date().toISOString()
      });

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🎉 Onboarding Complete!',
        message: 'Your profile is optimized! Earned 150 XP. Check your AI-generated portfolio suggestions!',
        link: createPageUrl('Dashboard')
      });

      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Step {step} of {totalSteps}
          </Badge>
          <span className="text-gray-400 text-sm">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <Card className="glass-card border-0 mb-6">
        <CardContent className="p-8">
          {/* Step 1: AI Skill Assessment */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Skill Assessment</h2>
                  <p className="text-gray-400 text-sm">Help us understand your abilities</p>
                </div>
              </div>

              <div className="space-y-6">
                {assessmentQuestions.map((q, i) => (
                  <div key={q.id} className="glass-card rounded-lg p-4">
                    <label className="text-white font-medium text-sm mb-3 block">
                      {i + 1}. {q.question}
                    </label>
                    
                    {q.type === 'scale' || q.type === 'choice' ? (
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map(option => (
                          <Button
                            key={option}
                            onClick={() => setAssessmentAnswers({...assessmentAnswers, [q.id]: option})}
                            variant="outline"
                            className={`${
                              assessmentAnswers[q.id] === option
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'glass-card border-white/20 text-white hover:bg-white/5'
                            }`}
                          >
                            {assessmentAnswers[q.id] === option && <CheckCircle className="w-4 h-4 mr-2" />}
                            {option}
                          </Button>
                        ))}
                      </div>
                    ) : q.type === 'multiple' ? (
                      <div className="flex flex-wrap gap-2">
                        {q.options.map(option => {
                          const selected = assessmentAnswers[q.id]?.includes(option);
                          return (
                            <Button
                              key={option}
                              onClick={() => {
                                const current = assessmentAnswers[q.id] || [];
                                const updated = selected
                                  ? current.filter(o => o !== option)
                                  : [...current, option];
                                setAssessmentAnswers({...assessmentAnswers, [q.id]: updated});
                              }}
                              size="sm"
                              variant="outline"
                              className={`${
                                selected
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : 'glass-card border-white/20 text-white hover:bg-white/5'
                              }`}
                            >
                              {selected && <CheckCircle className="w-3 h-3 mr-1" />}
                              {option}
                            </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <Textarea
                        value={assessmentAnswers[q.id] || ''}
                        onChange={(e) => setAssessmentAnswers({...assessmentAnswers, [q.id]: e.target.value})}
                        placeholder="Tell us about your experience..."
                        className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 glass-card rounded-lg p-4 bg-blue-500/5">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-400 text-sm font-medium">AI-Powered Analysis</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Our AI will analyze your responses to create a personalized learning path and identify your market readiness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Assessment Results */}
          {step === 2 && (
            <div>
              {!assessmentResults ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white">AI is analyzing your responses...</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Your Assessment Results</h2>
                      <p className="text-gray-400 text-sm">Here's what we learned about you</p>
                    </div>
                  </div>

                  {/* Market Readiness Score */}
                  <div className="glass-card rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Market Readiness</h3>
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-lg px-4 py-2">
                        {assessmentResults.market_readiness}/100
                      </Badge>
                    </div>
                    <Progress value={assessmentResults.market_readiness} className="h-3" />
                    <p className="text-gray-400 text-xs mt-2">
                      {assessmentResults.market_readiness >= 80 ? 'Excellent! You\'re ready for senior roles.' :
                       assessmentResults.market_readiness >= 60 ? 'Good! You\'re ready for mid-level positions.' :
                       'Keep learning! Focus on building your skills.'}
                    </p>
                  </div>

                  {/* Verified Level */}
                  <div className="glass-card rounded-lg p-4 mb-4">
                    <p className="text-gray-400 text-sm mb-2">Verified Experience Level:</p>
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-0">
                      {assessmentResults.verified_level}
                    </Badge>
                  </div>

                  {/* Strengths */}
                  <div className="mb-4">
                    <h3 className="text-white font-semibold mb-3">💪 Your Strengths</h3>
                    <div className="space-y-2">
                      {assessmentResults.strengths?.map((strength, i) => (
                        <div key={i} className="flex items-start gap-2 glass-card rounded-lg p-3">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skill Gaps */}
                  {assessmentResults.skill_gaps?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-white font-semibold mb-3">📈 Skills to Develop</h3>
                      <div className="space-y-2">
                        {assessmentResults.skill_gaps.map((gap, i) => (
                          <div key={i} className="glass-card rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white font-medium text-sm">{gap.skill}</p>
                              <Badge className={`${
                                gap.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                gap.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              } border-0 text-xs`}>
                                {gap.priority} priority
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-xs">{gap.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Job Types */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">🎯 Recommended Job Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {assessmentResults.recommended_job_types?.map((job, i) => (
                        <Badge key={i} className="bg-purple-500/20 text-purple-300 border-0">
                          {job}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Portfolio Guidance */}
          {step === 3 && (
            <div>
              {!portfolioSuggestions ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white">Generating personalized portfolio suggestions...</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Portfolio Project Ideas</h2>
                      <p className="text-gray-400 text-sm">AI-generated projects to build</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {portfolioSuggestions.projects?.map((project, i) => (
                      <Card key={i} className="glass-card border-0 bg-white/5">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-white font-semibold text-lg">{project.name}</h3>
                            <Badge className="bg-purple-500/20 text-purple-400 border-0">
                              {project.estimated_weeks}w
                            </Badge>
                          </div>

                          <p className="text-gray-400 text-sm mb-4">{project.description}</p>

                          <div className="mb-3">
                            <p className="text-gray-400 text-xs font-medium mb-2">Key Features:</p>
                            <div className="space-y-1">
                              {project.key_features?.map((feature, j) => (
                                <div key={j} className="flex items-start gap-2">
                                  <Target className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-gray-300 text-xs">{feature}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-gray-400 text-xs font-medium mb-2">Skills Demonstrated:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {project.skills_demonstrated?.map((skill, j) => (
                                <Badge key={j} className="bg-green-500/20 text-green-300 border-0 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="glass-card rounded-lg p-3 bg-yellow-500/5">
                            <p className="text-yellow-400 text-xs font-medium mb-1">💡 Why This Will Impress:</p>
                            <p className="text-gray-300 text-xs">{project.why_impressive}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Portfolio Tips */}
                  <div className="mt-6 glass-card rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                      Portfolio Tips
                    </h3>
                    <div className="space-y-2">
                      {portfolioSuggestions.portfolio_tips?.map((tip, i) => (
                        <p key={i} className="text-gray-300 text-xs">• {tip}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Profile Optimization */}
          {step === 4 && (
            <div>
              {!profileOptimization ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white">Analyzing your profile...</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Profile Optimization</h2>
                      <p className="text-gray-400 text-sm">Make your profile stand out</p>
                    </div>
                  </div>

                  {/* Completeness Score */}
                  <div className="glass-card rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-semibold">Profile Completeness</h3>
                      <Badge className="bg-blue-500/20 text-blue-400 border-0 text-lg px-4 py-2">
                        {profileOptimization.completeness_score}%
                      </Badge>
                    </div>
                    <Progress value={profileOptimization.completeness_score} className="h-3" />
                  </div>

                  {/* Missing Sections */}
                  {profileOptimization.missing_sections?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3">⚠️ Missing Sections</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileOptimization.missing_sections.map((section, i) => (
                          <Badge key={i} className="bg-red-500/20 text-red-400 border-0">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio Improvements */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">✍️ Bio Optimization</h3>
                    <div className="glass-card rounded-lg p-4 mb-4">
                      <p className="text-gray-400 text-xs mb-2">AI-Suggested Bio:</p>
                      <p className="text-white text-sm">{profileOptimization.suggested_bio}</p>
                    </div>
                    <div className="space-y-2">
                      {profileOptimization.bio_improvements?.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 glass-card rounded-lg p-3">
                          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-xs">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEO Keywords */}
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">🔍 SEO Keywords</h3>
                    <p className="text-gray-400 text-xs mb-3">Add these keywords to improve visibility:</p>
                    <div className="flex flex-wrap gap-2">
                      {profileOptimization.seo_keywords?.map((keyword, i) => (
                        <Badge key={i} className="bg-indigo-500/20 text-indigo-300 border-0">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Visibility Tips */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">📈 Visibility Tips</h3>
                    <div className="space-y-2">
                      {profileOptimization.visibility_tips?.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 glass-card rounded-lg p-3">
                          <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-xs">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remaining steps can be the basic profile setup from original onboarding */}
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
              if (step === 1 && !assessmentResults) {
                await runSkillAssessment();
              } else if (step === 2 && !portfolioSuggestions) {
                await generatePortfolioSuggestions();
              } else if (step === 3 && !profileOptimization) {
                await generateProfileOptimization();
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
            disabled={saving}
            className="btn-primary text-white"
          >
            {saving ? 'Saving...' : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Complete Setup
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
