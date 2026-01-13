import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  MessageSquare,
  HelpCircle,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Award,
  Flame
} from 'lucide-react';

export default function AIForumTrendsAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState(null);

  const analyzeTrends = async () => {
    setLoading(true);
    try {
      const [posts, replies, users] = await Promise.all([
        base44.entities.ForumPost.filter({ status: 'active' }, '-created_date', 200),
        base44.entities.ForumReply.list(),
        base44.entities.User.list()
      ]);

      const prompt = `You are an AI community analyst. Analyze forum activity and provide actionable insights.

FORUM ACTIVITY (${posts.length} posts):
${posts.map(p => `
- ${p.title} (${p.category})
  Author: ${p.author_id}
  Tags: ${p.tags?.join(', ')}
  Views: ${p.views}
  Replies: ${p.replies_count}
  Likes: ${p.likes}
  Status: ${p.status}
  Has Answer: ${p.best_answer_id ? 'Yes' : 'No'}
`).join('\n')}

REPLIES (${replies.length} total):
${replies.slice(0, 100).map(r => `
- Post: ${r.post_id}
  Likes: ${r.likes}
  Best Answer: ${r.is_best_answer}
`).join('\n')}

ANALYZE AND PROVIDE:
1. Trending topics and emerging themes
2. Most common unanswered questions
3. Popular vs underserved categories
4. Users who could be expert contributors
5. Discussion prompts to increase engagement
6. Content gaps to fill`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            trending_topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  post_count: { type: "number" },
                  engagement_score: { type: "number" },
                  trend_direction: {
                    type: "string",
                    enum: ["rising", "stable", "declining"]
                  },
                  related_tags: {
                    type: "array",
                    items: { type: "string" }
                  },
                  why_trending: { type: "string" }
                }
              }
            },
            unanswered_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  post_id: { type: "string" },
                  question_theme: { type: "string" },
                  difficulty: {
                    type: "string",
                    enum: ["beginner", "intermediate", "advanced", "expert"]
                  },
                  views: { type: "number" },
                  potential_experts: {
                    type: "array",
                    items: { type: "string" }
                  },
                  why_unanswered: { type: "string" }
                }
              }
            },
            category_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  post_count: { type: "number" },
                  avg_engagement: { type: "number" },
                  status: {
                    type: "string",
                    enum: ["thriving", "active", "underserved", "dormant"]
                  },
                  opportunities: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            expert_contributors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  expertise_areas: {
                    type: "array",
                    items: { type: "string" }
                  },
                  contribution_score: { type: "number" },
                  best_answers: { type: "number" },
                  recommendation: { type: "string" }
                }
              }
            },
            engagement_prompts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  prompt_title: { type: "string" },
                  prompt_description: { type: "string" },
                  category: { type: "string" },
                  target_audience: { type: "string" },
                  expected_engagement: {
                    type: "string",
                    enum: ["high", "medium", "low"]
                  },
                  suggested_tags: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            content_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap_type: { type: "string" },
                  description: { type: "string" },
                  priority: {
                    type: "string",
                    enum: ["critical", "high", "medium", "low"]
                  },
                  suggested_content: { type: "string" },
                  target_users: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            community_health: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                engagement_trend: {
                  type: "string",
                  enum: ["growing", "stable", "declining"]
                },
                response_rate: { type: "number" },
                avg_time_to_answer_hours: { type: "number" },
                quality_score: { type: "number" },
                recommendations: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Enrich with user data
      const enrichedExperts = response.expert_contributors?.map(exp => ({
        ...exp,
        user: users.find(u => u.id === exp.user_id)
      })).filter(e => e.user);

      setTrends({
        ...response,
        expert_contributors: enrichedExperts
      });

    } catch (error) {
      console.error('Error analyzing trends:', error);
      alert('Failed to analyze forum trends. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createDiscussionPrompt = async (prompt) => {
    try {
      const currentUser = await base44.auth.me();
      
      await base44.entities.ForumPost.create({
        author_id: currentUser.id,
        category: prompt.category || 'General',
        title: prompt.prompt_title,
        content: prompt.prompt_description,
        tags: prompt.suggested_tags || [],
        pinned: true
      });

      alert('✅ Discussion prompt created!');
    } catch (error) {
      console.error('Error creating prompt:', error);
      alert('Failed to create discussion. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🤖 AI is analyzing forum activity...</p>
          <p className="text-gray-400 text-sm">Processing discussions, trends, and engagement</p>
        </CardContent>
      </Card>
    );
  }

  if (!trends) {
    return (
      <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Forum Trends Analyzer
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Discover trending topics, unanswered questions, and opportunities to engage the community
          </p>
          <Button
            onClick={analyzeTrends}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg px-8 py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Analyze Forum Trends
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Health Score */}
      <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-xl mb-1">Community Health</h3>
              <p className="text-gray-400 text-sm capitalize">
                {trends.community_health?.engagement_trend} engagement
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-400 mb-1">
                {trends.community_health?.overall_score}
              </div>
              <p className="text-gray-400 text-xs">out of 100</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <MessageSquare className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-white font-semibold">{trends.community_health?.response_rate}%</p>
              <p className="text-gray-400 text-xs">Response Rate</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <HelpCircle className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-semibold">{trends.community_health?.avg_time_to_answer_hours}h</p>
              <p className="text-gray-400 text-xs">Avg Answer Time</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Award className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-semibold">{trends.community_health?.quality_score}/10</p>
              <p className="text-gray-400 text-xs">Quality Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trends.trending_topics?.map((topic, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{topic.topic}</h4>
                  <p className="text-gray-400 text-sm mb-2">{topic.why_trending}</p>
                </div>
                <Badge className={`${
                  topic.trend_direction === 'rising' ? 'bg-green-500/20 text-green-400' :
                  topic.trend_direction === 'stable' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-orange-500/20 text-orange-400'
                } border-0`}>
                  {topic.trend_direction}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-2">
                <div className="bg-white/5 rounded p-2">
                  <p className="text-gray-400 text-xs mb-1">Posts</p>
                  <p className="text-white font-semibold">{topic.post_count}</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-gray-400 text-xs mb-1">Engagement</p>
                  <p className="text-white font-semibold">{topic.engagement_score}/100</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {topic.related_tags?.map((tag, j) => (
                  <Badge key={j} className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Unanswered Questions */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-yellow-400" />
            Unanswered Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trends.unanswered_questions?.slice(0, 10).map((q, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">{q.question_theme}</h4>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-0 capitalize">
                  {q.difficulty}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm mb-3">{q.why_unanswered}</p>
              
              {q.potential_experts?.length > 0 && (
                <div className="bg-blue-500/10 rounded p-3 border border-blue-500/20">
                  <p className="text-blue-400 font-semibold text-xs mb-2">💡 Potential Experts:</p>
                  <div className="flex flex-wrap gap-2">
                    {q.potential_experts.map((expertId, j) => (
                      <Badge key={j} className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                        User {j + 1}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => window.location.href = createPageUrl('Forum')}
                size="sm"
                className="w-full mt-3 glass-card border-0 text-white hover:bg-white/5"
              >
                View in Forum
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Expert Contributors */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Expert Contributors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trends.expert_contributors?.slice(0, 10).map((expert, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                {expert.user?.avatar_url ? (
                  <img 
                    src={expert.user.avatar_url}
                    alt={expert.user.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{expert.user?.full_name}</h4>
                  <p className="text-gray-400 text-xs">{expert.best_answers} best answers</p>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-0">
                  {expert.contribution_score}/100
                </Badge>
              </div>

              <div className="mb-2">
                <p className="text-gray-400 text-xs mb-1">Expertise:</p>
                <div className="flex flex-wrap gap-1">
                  {expert.expertise_areas?.map((area, j) => (
                    <Badge key={j} className="bg-green-500/20 text-green-400 border-0 text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-blue-400 text-xs">{expert.recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Discussion Prompts */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-400" />
            Suggested Discussion Prompts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trends.engagement_prompts?.map((prompt, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">{prompt.prompt_title}</h4>
                <Badge className={`${
                  prompt.expected_engagement === 'high' ? 'bg-green-500/20 text-green-400' :
                  prompt.expected_engagement === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                } border-0 text-xs`}>
                  {prompt.expected_engagement} engagement
                </Badge>
              </div>
              <p className="text-gray-400 text-sm mb-2">{prompt.prompt_description}</p>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                  {prompt.category}
                </Badge>
                <p className="text-gray-500 text-xs">{prompt.target_audience}</p>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {prompt.suggested_tags?.map((tag, j) => (
                  <Badge key={j} className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => createDiscussionPrompt(prompt)}
                size="sm"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                <MessageSquare className="w-3 h-3 mr-2" />
                Create This Discussion
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Content Gaps */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            Content Gaps to Fill
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trends.content_gaps?.map((gap, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">{gap.gap_type}</h4>
                <Badge className={`${
                  gap.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  gap.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  gap.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                } border-0 text-xs`}>
                  {gap.priority}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm mb-2">{gap.description}</p>
              <div className="bg-green-500/10 rounded p-3 border border-green-500/20">
                <p className="text-green-400 font-semibold text-xs mb-1">Suggested Content:</p>
                <p className="text-gray-300 text-xs">{gap.suggested_content}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={analyzeTrends}
        className="w-full glass-card border-0 text-white hover:bg-white/5"
      >
        Refresh Analysis
      </Button>
    </div>
  );
}