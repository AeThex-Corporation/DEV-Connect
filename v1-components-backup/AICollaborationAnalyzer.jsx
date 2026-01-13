import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Clock,
  Target,
  Users,
  Zap,
  BarChart
} from 'lucide-react';

export default function AICollaborationAnalyzer({ team, onInsightApplied }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeTeamDynamics = async () => {
    setLoading(true);
    try {
      // Get team collaboration data
      const [tasks, messages, members] = await Promise.all([
        base44.entities.CollabTask.filter({ room_id: team.id }),
        base44.entities.CollabMessage.filter({ room_id: team.id }),
        Promise.all(team.member_ids?.map(id => 
          base44.entities.User.filter({ id }).then(users => users[0])
        ) || [])
      ]);

      const prompt = `You are an AI team collaboration expert. Analyze this team's dynamics and provide actionable insights.

TEAM OVERVIEW:
Name: ${team.name}
Members: ${members.length}
Status: ${team.status}
Type: ${team.room_type}

TEAM MEMBERS:
${members.map((m, i) => `
${i + 1}. ${m?.full_name || 'Unknown'} (${m?.id})
   - Roles: ${m?.developer_roles?.join(', ') || 'None'}
   - Experience: ${m?.experience_level}
   - Reputation: ${m?.forum_reputation || 0}
`).join('\n')}

TASK ANALYSIS (${tasks.length} tasks):
${tasks.map(t => `
- ${t.title} (${t.status})
  Assigned: ${t.assigned_to}
  Priority: ${t.priority}
  Due: ${t.due_date || 'No deadline'}
  Estimated: ${t.estimated_hours || 'N/A'}h
  Actual: ${t.actual_hours || 'N/A'}h
  Blocked by: ${t.blocked_by?.length || 0} tasks
  Comments: ${t.comments?.length || 0}
`).join('\n')}

COMMUNICATION ANALYSIS (${messages.length} messages):
${messages.slice(-50).map(m => `
- From: ${m.sender_id}
  Type: ${m.message_type}
  Content: ${m.content?.substring(0, 100)}
`).join('\n')}

PROVIDE COMPREHENSIVE ANALYSIS:
1. Project velocity and timeline risks
2. Communication quality and sentiment
3. Task distribution and workload balance
4. Bottlenecks and blockers
5. Team morale indicators
6. Actionable recommendations for improvement`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_health_score: {
              type: "number",
              minimum: 0,
              maximum: 100
            },
            velocity_analysis: {
              type: "object",
              properties: {
                current_velocity: { type: "string" },
                tasks_completed_on_time: { type: "number" },
                average_task_completion_days: { type: "number" },
                timeline_risk: { 
                  type: "string",
                  enum: ["low", "medium", "high", "critical"]
                },
                projected_completion: { type: "string" },
                velocity_trend: {
                  type: "string",
                  enum: ["improving", "stable", "declining"]
                }
              }
            },
            communication_insights: {
              type: "object",
              properties: {
                communication_frequency: { type: "string" },
                response_time_average: { type: "string" },
                sentiment_score: {
                  type: "number",
                  minimum: 0,
                  maximum: 10
                },
                sentiment_analysis: { type: "string" },
                collaboration_quality: {
                  type: "string",
                  enum: ["excellent", "good", "fair", "poor"]
                },
                issues_detected: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      issue: { type: "string" },
                      severity: { type: "string" },
                      indicators: {
                        type: "array",
                        items: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            workload_analysis: {
              type: "object",
              properties: {
                distribution_balance: {
                  type: "string",
                  enum: ["balanced", "unbalanced", "severely_unbalanced"]
                },
                member_loads: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      member_id: { type: "string" },
                      task_count: { type: "number" },
                      estimated_hours: { type: "number" },
                      load_level: {
                        type: "string",
                        enum: ["underutilized", "optimal", "overloaded"]
                      },
                      recommendation: { type: "string" }
                    }
                  }
                }
              }
            },
            bottlenecks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["task_blocking", "resource_constraint", "communication_gap", "skill_gap", "unclear_requirements"]
                  },
                  description: { type: "string" },
                  impact: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"]
                  },
                  affected_tasks: {
                    type: "array",
                    items: { type: "string" }
                  },
                  resolution_steps: {
                    type: "array",
                    items: { type: "string" }
                  },
                  estimated_delay_days: { type: "number" }
                }
              }
            },
            morale_indicators: {
              type: "object",
              properties: {
                overall_morale: {
                  type: "string",
                  enum: ["high", "moderate", "low", "concerning"]
                },
                positive_signals: {
                  type: "array",
                  items: { type: "string" }
                },
                warning_signs: {
                  type: "array",
                  items: { type: "string" }
                },
                engagement_level: { type: "string" }
              }
            },
            actionable_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "number" },
                  category: {
                    type: "string",
                    enum: ["process", "communication", "workload", "timeline", "morale"]
                  },
                  recommendation: { type: "string" },
                  expected_impact: { type: "string" },
                  implementation_difficulty: {
                    type: "string",
                    enum: ["easy", "moderate", "challenging"]
                  },
                  timeframe: { type: "string" }
                }
              }
            },
            predictive_insights: {
              type: "object",
              properties: {
                completion_probability: { type: "number" },
                risk_factors: {
                  type: "array",
                  items: { type: "string" }
                },
                success_factors: {
                  type: "array",
                  items: { type: "string" }
                },
                recommended_interventions: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(response);

      // Create notification for team leader
      await base44.entities.Notification.create({
        user_id: team.leader_id,
        type: 'message',
        title: '📊 Team Collaboration Analysis Ready',
        message: `AI has analyzed your team's dynamics. Overall health: ${response.overall_health_score}/100`,
        link: `/teams?analysis=${team.id}`
      });

    } catch (error) {
      console.error('Error analyzing team:', error);
      alert('Failed to analyze team collaboration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRiskColor = (risk) => {
    const colors = {
      'low': 'bg-green-500/20 text-green-400',
      'medium': 'bg-yellow-500/20 text-yellow-400',
      'high': 'bg-orange-500/20 text-orange-400',
      'critical': 'bg-red-500/20 text-red-400'
    };
    return colors[risk] || colors['medium'];
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🤖 AI is analyzing team collaboration...</p>
          <p className="text-gray-400 text-sm">Evaluating tasks, communication, and dynamics</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Collaboration Analyzer
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Get deep insights into your team's collaboration patterns, identify bottlenecks, and receive actionable recommendations
          </p>
          <Button
            onClick={analyzeTeamDynamics}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg px-8 py-6"
          >
            <Brain className="w-5 h-5 mr-2" />
            Analyze Team Dynamics
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-xl mb-1">Team Health Score</h3>
              <p className="text-gray-400 text-sm">AI-powered collaboration analysis</p>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold ${getHealthColor(analysis.overall_health_score)} mb-1`}>
                {analysis.overall_health_score}
              </div>
              <p className="text-gray-400 text-xs">out of 100</p>
            </div>
          </div>
          
          <Progress value={analysis.overall_health_score} className="h-3 mb-2" />
          
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-semibold text-sm">{analysis.velocity_analysis?.velocity_trend}</p>
              <p className="text-gray-400 text-xs">Velocity Trend</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <MessageSquare className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-white font-semibold text-sm">{analysis.communication_insights?.collaboration_quality}</p>
              <p className="text-gray-400 text-xs">Communication</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-semibold text-sm capitalize">{analysis.morale_indicators?.overall_morale}</p>
              <p className="text-gray-400 text-xs">Team Morale</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="velocity" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="velocity">
            <TrendingUp className="w-4 h-4 mr-2" />
            Velocity
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessageSquare className="w-4 h-4 mr-2" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="workload">
            <BarChart className="w-4 h-4 mr-2" />
            Workload
          </TabsTrigger>
          <TabsTrigger value="bottlenecks">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Bottlenecks
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Target className="w-4 h-4 mr-2" />
            Actions
          </TabsTrigger>
        </TabsList>

        {/* Velocity Analysis */}
        <TabsContent value="velocity">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Project Velocity Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-2">Current Velocity</p>
                  <p className="text-white font-semibold text-lg">{analysis.velocity_analysis?.current_velocity}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-2">Timeline Risk</p>
                  <Badge className={`${getRiskColor(analysis.velocity_analysis?.timeline_risk)} border-0`}>
                    {analysis.velocity_analysis?.timeline_risk}
                  </Badge>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-2">Avg Completion Time</p>
                  <p className="text-white font-semibold">{analysis.velocity_analysis?.average_task_completion_days} days</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-2">On-Time Completion</p>
                  <p className="text-white font-semibold">{analysis.velocity_analysis?.tasks_completed_on_time}%</p>
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-400 font-semibold text-sm mb-2">📅 Projected Completion:</p>
                <p className="text-white">{analysis.velocity_analysis?.projected_completion}</p>
              </div>

              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                <p className="text-purple-400 font-semibold text-sm mb-2">🎯 Completion Probability:</p>
                <div className="flex items-center gap-3">
                  <Progress value={analysis.predictive_insights?.completion_probability} className="flex-1" />
                  <span className="text-white font-bold">{analysis.predictive_insights?.completion_probability}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Analysis */}
        <TabsContent value="communication">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Communication Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-2">Sentiment Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={analysis.communication_insights?.sentiment_score * 10} className="flex-1" />
                    <span className="text-white font-bold">{analysis.communication_insights?.sentiment_score}/10</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-2">Response Time</p>
                  <p className="text-white font-semibold">{analysis.communication_insights?.response_time_average}</p>
                </div>
              </div>

              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <p className="text-green-400 font-semibold text-sm mb-2">💬 Sentiment Analysis:</p>
                <p className="text-gray-300 text-sm">{analysis.communication_insights?.sentiment_analysis}</p>
              </div>

              {analysis.communication_insights?.issues_detected?.length > 0 && (
                <div>
                  <p className="text-white font-semibold mb-3">⚠️ Communication Issues:</p>
                  <div className="space-y-3">
                    {analysis.communication_insights.issues_detected.map((issue, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-semibold">{issue.issue}</p>
                          <Badge className={`${getRiskColor(issue.severity)} border-0 text-xs`}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {issue.indicators?.map((indicator, j) => (
                            <p key={j} className="text-gray-400 text-xs">• {indicator}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workload Analysis */}
        <TabsContent value="workload">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 mb-4">
                <p className="text-blue-400 font-semibold text-sm mb-1">Distribution Balance:</p>
                <p className="text-white text-lg capitalize">{analysis.workload_analysis?.distribution_balance}</p>
              </div>

              <div className="space-y-3">
                {analysis.workload_analysis?.member_loads?.map((load, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold">Member {i + 1}</p>
                      <Badge className={`${
                        load.load_level === 'overloaded' ? 'bg-red-500/20 text-red-400' :
                        load.load_level === 'optimal' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      } border-0 text-xs`}>
                        {load.load_level}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                      <div>
                        <span className="text-gray-400">Tasks: </span>
                        <span className="text-white font-semibold">{load.task_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Hours: </span>
                        <span className="text-white font-semibold">{load.estimated_hours}h</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{load.recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bottlenecks */}
        <TabsContent value="bottlenecks">
          <div className="space-y-4">
            {analysis.bottlenecks?.length === 0 ? (
              <Card className="glass-card border-0">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Major Bottlenecks</h3>
                  <p className="text-gray-400">Your team is operating smoothly!</p>
                </CardContent>
              </Card>
            ) : (
              analysis.bottlenecks?.map((bottleneck, i) => (
                <Card key={i} className="glass-card border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={`w-5 h-5 ${
                            bottleneck.impact === 'critical' ? 'text-red-400' :
                            bottleneck.impact === 'high' ? 'text-orange-400' :
                            'text-yellow-400'
                          }`} />
                          <h3 className="text-white font-semibold text-lg capitalize">
                            {bottleneck.type.replace(/_/g, ' ')}
                          </h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{bottleneck.description}</p>
                      </div>
                      <Badge className={`${getRiskColor(bottleneck.impact)} border-0`}>
                        {bottleneck.impact} impact
                      </Badge>
                    </div>

                    <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20 mb-3">
                      <p className="text-orange-400 text-xs font-semibold mb-1">
                        ⏱️ Estimated Delay: {bottleneck.estimated_delay_days} days
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="text-white font-semibold text-sm mb-2">Resolution Steps:</p>
                      <div className="space-y-2">
                        {bottleneck.resolution_steps?.map((step, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <div className="w-5 h-5 bg-indigo-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-indigo-400 text-xs font-bold">{j + 1}</span>
                            </div>
                            <p className="text-gray-300 text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {bottleneck.affected_tasks?.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Affected Tasks:</p>
                        <div className="flex flex-wrap gap-1">
                          {bottleneck.affected_tasks.map((taskId, j) => (
                            <Badge key={j} className="bg-red-500/20 text-red-400 border-0 text-xs">
                              Task {j + 1}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations">
          <div className="space-y-4">
            {analysis.actionable_recommendations?.map((rec, i) => (
              <Card key={i} className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{rec.priority}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs capitalize">
                          {rec.category}
                        </Badge>
                        <Badge className={`${
                          rec.implementation_difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                          rec.implementation_difficulty === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        } border-0 text-xs`}>
                          {rec.implementation_difficulty}
                        </Badge>
                      </div>
                      <p className="text-white font-semibold mb-2">{rec.recommendation}</p>
                      <p className="text-gray-400 text-sm mb-2">{rec.expected_impact}</p>
                      <p className="text-gray-500 text-xs">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Timeframe: {rec.timeframe}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Morale Insights */}
          <Card className="glass-card border-0 mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <CardHeader>
              <CardTitle className="text-white">Team Morale Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-white font-semibold mb-2">✨ Positive Signals:</p>
                <div className="space-y-1">
                  {analysis.morale_indicators?.positive_signals?.map((signal, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{signal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.morale_indicators?.warning_signs?.length > 0 && (
                <div>
                  <p className="text-white font-semibold mb-2">⚠️ Warning Signs:</p>
                  <div className="space-y-1">
                    {analysis.morale_indicators.warning_signs.map((sign, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-300 text-sm">{sign}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <Button
        onClick={analyzeTeamDynamics}
        className="w-full glass-card border-0 text-white hover:bg-white/5"
      >
        <Zap className="w-4 h-4 mr-2" />
        Refresh Analysis
      </Button>
    </div>
  );
}