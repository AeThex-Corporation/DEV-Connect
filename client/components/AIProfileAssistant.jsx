
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  TrendingUp,
  Target,
  CheckCircle,
  X,
  AlertCircle,
  Lightbulb,
  Brain,
  Award,
  Zap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AIProfileAssistant({ user, onRefresh }) {
  const [suggestions, setSuggestions] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [profileScore, setProfileScore] = useState(0);
  const [marketAlignment, setMarketAlignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSuggestions();
    }
  }, [user?.id]);

  const loadSuggestions = async () => {
    if (!user?.id) return;

    try {
      const userSuggestions = await base44.entities.ProfileOptimizationSuggestion.filter({
        user_id: user.id,
        status: 'pending'
      });
      setSuggestions(userSuggestions);
      calculateProfileScore();
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileScore = () => {
    let score = 0;

    // Basic profile completion
    if (user?.bio) score += 15;
    if (user?.skills && user.skills.length > 0) score += 15;
    if (user?.developer_roles && user.developer_roles.length > 0) score += 10;
    if (user?.roblox_username) score += 10;
    if (user?.location) score += 5;
    if (user?.years_of_experience > 0) score += 10;

    // Portfolio
    if (user?.portfolio_links?.roblox_games) score += 10;
    if (user?.portfolio_links?.github) score += 10;

    // Social proof
    if (user?.verified) score += 10;
    if ((user?.rating || 0) > 4) score += 5;

    setProfileScore(score);
  };

  const analyzeProfile = async () => {
    setAnalyzing(true);

    try {
      // Get current jobs to analyze market demand
      const allJobs = await base44.entities.Job.filter({ status: 'Open' }, '-created_date', 50);

      // Analyze with AI
      const prompt = `Analyze this Roblox developer profile and provide optimization suggestions:

Profile:
- Roles: ${user?.developer_roles?.join(', ') || 'None'}
- Skills: ${user?.skills?.join(', ')}
- Bio: ${user?.bio || 'Missing'}
- Experience: ${user?.experience_level} (${user?.years_of_experience || 0} years)
- Completed Projects: ${user?.completed_projects || 0}

Market (${allJobs.length} jobs):
${allJobs.slice(0, 20).map(j => `- ${j.title}: ${j.required_skills?.join(', ')}`).join('\n')}

Provide specific, actionable suggestions for profile improvement.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            profile_score: { type: "number" },
            critical_gaps: { type: "array", items: { type: "string" } },
            skills_to_add: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  demand: { type: "number" },
                  matching_jobs: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            bio_suggestions: { type: "string" },
            portfolio_tips: { type: "array", items: { type: "string" } },
            market_alignment: {
              type: "object",
              properties: {
                score: { type: "number" },
                trending_skills: { type: "array", items: { type: "string" } },
                in_demand_roles: { type: "array", items: { type: "string" } },
                recommendations: { type: "string" }
              }
            }
          }
        }
      });

      setMarketAlignment(response.market_alignment);

      // Create suggestions in database
      const newSuggestions = [];

      // Skills suggestions
      for (const skillSuggestion of response.skills_to_add || []) {
        const suggestion = await base44.entities.ProfileOptimizationSuggestion.create({
          user_id: user.id,
          suggestion_type: 'skills_to_add',
          priority: skillSuggestion.demand > 7 ? 'high' : 'medium',
          title: `Add "${skillSuggestion.skill}" to your skills`,
          description: skillSuggestion.reason,
          impact_score: skillSuggestion.demand * 10,
          market_demand: skillSuggestion.demand,
          related_jobs_count: skillSuggestion.matching_jobs
        });
        newSuggestions.push(suggestion);
      }

      // Bio enhancement
      if (response.bio_suggestions) {
        const bioSuggestion = await base44.entities.ProfileOptimizationSuggestion.create({
          user_id: user.id,
          suggestion_type: 'bio_enhancement',
          priority: user?.bio ? 'medium' : 'critical',
          title: user?.bio ? 'Enhance your bio for better impact' : 'Add a professional bio',
          description: 'A compelling bio helps you stand out to employers',
          ai_generated_content: response.bio_suggestions,
          impact_score: 85
        });
        newSuggestions.push(bioSuggestion);
      }

      // Portfolio improvements
      for (const tip of response.portfolio_tips || []) {
        const portfolioSuggestion = await base44.entities.ProfileOptimizationSuggestion.create({
          user_id: user.id,
          suggestion_type: 'portfolio_improvement',
          priority: 'high',
          title: 'Improve your portfolio',
          description: tip,
          impact_score: 75
        });
        newSuggestions.push(portfolioSuggestion);
      }

      setSuggestions(newSuggestions);

      alert('✨ Profile analysis complete! Check your suggestions below.');
    } catch (error) {
      console.error('Error analyzing profile:', error);
      alert('Failed to analyze profile. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const applySuggestion = async (suggestion) => {
    try {
      await base44.entities.ProfileOptimizationSuggestion.update(suggestion.id, {
        status: 'applied',
        applied_date: new Date().toISOString()
      });

      await loadSuggestions();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const dismissSuggestion = async (suggestion) => {
    try {
      await base44.entities.ProfileOptimizationSuggestion.update(suggestion.id, {
        status: 'dismissed'
      });
      await loadSuggestions();
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'low': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">AI Profile Assistant</CardTitle>
              <p className="text-gray-400 text-xs">Optimize your profile for better job matches</p>
            </div>
          </div>
          <Button
            onClick={analyzeProfile}
            disabled={analyzing}
            size="sm"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          >
            {analyzing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Profile
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white/5 border-0 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="suggestions" className="relative">
              Suggestions
              {suggestions.length > 0 && (
                <Badge className="ml-2 bg-indigo-500 text-white border-0 text-xs">
                  {suggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="market">Market Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Profile Strength</h3>
                <span className={`text-2xl font-bold ${getScoreColor(profileScore)}`}>
                  {profileScore}%
                </span>
              </div>
              <Progress value={profileScore} className="h-2 mb-2" />
              <p className="text-gray-400 text-xs">
                {profileScore >= 80 && 'Excellent! Your profile is highly competitive.'}
                {profileScore >= 60 && profileScore < 80 && 'Good! A few improvements will make you stand out more.'}
                {profileScore >= 40 && profileScore < 60 && 'Fair. Complete missing sections to attract more opportunities.'}
                {profileScore < 40 && 'Needs work. Follow the suggestions below to improve.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <h4 className="text-white font-semibold text-sm">Profile Completeness</h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Bio</span>
                    {user?.bio ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Skills ({user?.skills?.length || 0})</span>
                    {(user?.skills?.length || 0) > 3 ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Portfolio</span>
                    {user?.portfolio_links?.roblox_games ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Roblox Verified</span>
                    {user?.roblox_username ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h4 className="text-white font-semibold text-sm">Quick Wins</h4>
                </div>
                <div className="space-y-2 text-xs text-gray-300">
                  {!user?.bio && <div>• Add a professional bio (+15%)</div>}
                  {(!user?.skills || user.skills.length < 5) && <div>• Add more skills (+10%)</div>}
                  {!user?.portfolio_links?.github && <div>• Link your GitHub (+10%)</div>}
                  {!user?.roblox_username && <div>• Verify Roblox account (+10%)</div>}
                  {profileScore >= 80 && <div>✨ You're all set! Keep it updated.</div>}
                  {profileScore < 80 && suggestions.length > 0 && <div>• Check suggestions tab for more improvements.</div>}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-3">
            {suggestions.length === 0 ? (
              <div className="bg-white/5 rounded-lg p-8 text-center">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No suggestions yet</p>
                <p className="text-gray-500 text-xs mb-4">Click "Analyze Profile" to get AI-powered recommendations</p>
                <Button
                  onClick={analyzeProfile}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Get Suggestions
                </Button>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                        {suggestion.impact_score && (
                          <Badge className="bg-green-500/20 text-green-400 border-0">
                            +{suggestion.impact_score} impact
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-white font-semibold mb-1">{suggestion.title}</h4>
                      <p className="text-gray-400 text-sm mb-3">{suggestion.description}</p>

                      {suggestion.ai_generated_content && (
                        <div className="bg-indigo-500/10 rounded-lg p-3 mb-3 border border-indigo-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-indigo-400" />
                            <span className="text-indigo-400 text-xs font-semibold">AI Suggestion:</span>
                          </div>
                          <p className="text-gray-300 text-xs">{suggestion.ai_generated_content}</p>
                        </div>
                      )}

                      {suggestion.related_jobs_count > 0 && (
                        <p className="text-green-400 text-xs">
                          📊 {suggestion.related_jobs_count} jobs require this
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => applySuggestion(suggestion)}
                      size="sm"
                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Apply
                    </Button>
                    <Button
                      onClick={() => dismissSuggestion(suggestion)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Market Trends Tab */}
          <TabsContent value="market" className="space-y-4">
            {marketAlignment ? (
              <>
                <div className="bg-white/5 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Market Alignment Score</h3>
                    <span className={`text-2xl font-bold ${getScoreColor(marketAlignment.score * 10)}`}>
                      {marketAlignment.score}/10
                    </span>
                  </div>
                  <Progress value={marketAlignment.score * 10} className="h-2 mb-3" />
                  <p className="text-gray-400 text-sm">{marketAlignment.recommendations}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <h4 className="text-white font-semibold text-sm">Trending Skills</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {marketAlignment.trending_skills?.map((skill, i) => (
                        <Badge key={i} className="bg-green-500/20 text-green-400 border-0">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-semibold text-sm">In-Demand Roles</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {marketAlignment.in_demand_roles?.map((role, i) => (
                        <Badge key={i} className="bg-purple-500/20 text-purple-400 border-0">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/5 rounded-lg p-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No market data yet</p>
                <p className="text-gray-500 text-xs mb-4">Run a profile analysis to see current market trends</p>
                <Button
                  onClick={analyzeProfile}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Now
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
