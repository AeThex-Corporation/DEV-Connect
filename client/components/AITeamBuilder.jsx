import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Users,
  UserPlus,
  Shield,
  AlertTriangle,
  TrendingUp,
  Target,
  CheckCircle,
  MessageSquare,
  Award
} from 'lucide-react';

export default function AITeamBuilder({ team, job, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeTeam = async () => {
    setLoading(true);
    try {
      const [allUsers, portfolios, certifications, reviews, tasks, messages] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Portfolio.list(),
        base44.entities.Certification.list(),
        base44.entities.Review.list(),
        team?.id ? base44.entities.CollabTask.filter({ room_id: team.id }) : Promise.resolve([]),
        team?.id ? base44.entities.CollabMessage.filter({ room_id: team.id }) : Promise.resolve([])
      ]);

      const prompt = team ? `You are an AI team dynamics expert. Analyze this existing team and provide insights on optimization and potential issues.

CURRENT TEAM:
Name: ${team.name}
Description: ${team.description || 'No description'}
Status: ${team.status}
Members: ${team.member_ids?.length || 0}
Leader: ${team.leader_id}

TEAM MEMBERS:
${team.member_ids?.map(id => {
  const member = allUsers.find(u => u.id === id);
  if (!member) return '';
  const memberPortfolio = portfolios.filter(p => p.user_id === id);
  const memberCerts = certifications.filter(c => c.user_id === id && c.status === 'active');
  const memberReviews = reviews.filter(r => r.reviewee_id === id);
  const avgRating = memberReviews.length > 0 
    ? (memberReviews.reduce((sum, r) => sum + r.rating, 0) / memberReviews.length).toFixed(1)
    : 'No ratings';

  return `- ${member.full_name} (${member.id})
  Roles: ${member.developer_roles?.join(', ') || 'None'}
  Skills: ${member.skills?.join(', ') || 'None'}
  Experience: ${member.experience_level} (${member.years_of_experience || 0} years)
  Projects: ${member.completed_projects || 0}
  Portfolio: ${memberPortfolio.length} items
  Certifications: ${memberCerts.map(c => c.skill_name).join(', ') || 'None'}
  Rating: ${avgRating}`;
}).join('\n\n')}

TEAM TASKS (${tasks.length} total):
${tasks.slice(0, 20).map(t => `
- ${t.title} (${t.status})
  Assigned to: ${t.assigned_to}
  Priority: ${t.priority}
  Due: ${t.due_date || 'No deadline'}
`).join('\n')}

RECENT COMMUNICATION (${messages.length} messages):
${messages.slice(-30).map(m => `
- From: ${m.sender_id}
  Type: ${m.message_type}
  Content: ${m.content?.substring(0, 100)}
`).join('\n')}

ANALYZE AND PROVIDE:
1. Role optimization suggestions for existing members
2. Skill coverage analysis (gaps and overlaps)
3. Communication pattern analysis
4. Potential conflict indicators
5. Team cohesion score and improvement suggestions
6. Productivity insights` : `You are an AI team composition expert. Build the optimal team for this job by analyzing available developers.

JOB REQUIREMENTS:
Title: ${job?.title || 'Not specified'}
Description: ${job?.description || 'Not specified'}
Required Roles: ${job?.required_roles?.join(', ') || 'Not specified'}
Required Skills: ${job?.required_skills?.join(', ') || 'Not specified'}
Experience Level: ${job?.experience_level || 'Not specified'}
Timeline: ${job?.timeline || 'Not specified'}

AVAILABLE DEVELOPERS (${allUsers.length} total):
${allUsers.filter(u => u.work_status === 'Open to Work' && u.developer_roles?.length > 0).slice(0, 50).map((dev, i) => {
  const devPortfolio = portfolios.filter(p => p.user_id === dev.id);
  const devCerts = certifications.filter(c => c.user_id === dev.id && c.status === 'active');
  const devReviews = reviews.filter(r => r.reviewee_id === dev.id);
  const avgRating = devReviews.length > 0 
    ? (devReviews.reduce((sum, r) => sum + r.rating, 0) / devReviews.length).toFixed(1)
    : '0.0';

  return `${i + 1}. ${dev.full_name} (ID: ${dev.id})
   Roles: ${dev.developer_roles?.join(', ') || 'None'}
   Skills: ${dev.skills?.join(', ') || 'None'}
   Experience: ${dev.experience_level} (${dev.years_of_experience || 0} years)
   Projects: ${dev.completed_projects || 0}
   Portfolio: ${devPortfolio.length} items
   Certifications: ${devCerts.map(c => `${c.skill_name} (${c.certification_level})`).join(', ') || 'None'}
   Rating: ${avgRating}/5
   Work Status: ${dev.work_status}`;
}).join('\n\n')}

RECOMMEND OPTIMAL TEAM COMPOSITION:
1. Suggest 3-7 developers for the team
2. Assign specific roles and responsibilities
3. Explain why each person fits
4. Identify potential synergies and complementary skills
5. Suggest team structure and leadership`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            team_composition: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  developer_id: { type: "string" },
                  recommended_role: { type: "string" },
                  primary_responsibilities: {
                    type: "array",
                    items: { type: "string" }
                  },
                  why_selected: { type: "string" },
                  skill_contribution: {
                    type: "array",
                    items: { type: "string" }
                  },
                  compatibility_score: { type: "number" },
                  leadership_potential: { type: "boolean" }
                }
              }
            },
            skill_analysis: {
              type: "object",
              properties: {
                coverage_score: { type: "number" },
                covered_skills: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            communication_analysis: {
              type: "object",
              properties: {
                overall_health: { 
                  type: "string",
                  enum: ["excellent", "good", "fair", "concerning"]
                }
              }
            },
            team_cohesion: {
              type: "object",
              properties: {
                cohesion_score: { type: "number" }
              }
            }
          }
        }
      });

      // Enrich with actual user data
      const enrichedComposition = response.team_composition?.map(rec => {
        const developer = allUsers.find(u => u.id === rec.developer_id);
        return { ...rec, developer };
      }).filter(r => r.developer);

      setAnalysis({
        ...response,
        team_composition: enrichedComposition
      });

    } catch (error) {
      console.error('Error analyzing team:', error);
      alert('Failed to analyze team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🤖 AI is analyzing team dynamics...</p>
          <p className="text-gray-400 text-sm">Evaluating skills, communication, and synergies</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {team ? 'Optimize Your Team' : 'Build Your Dream Team'}
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            {team 
              ? 'Get AI-powered insights on team dynamics, communication patterns, and optimization opportunities'
              : 'Let AI recommend the perfect team composition based on skills, experience, and synergies'}
          </p>
          <Button
            onClick={analyzeTeam}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg px-8 py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {team ? 'Analyze Team' : 'Build Team'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Scores */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white mb-1">
              {analysis.skill_analysis?.coverage_score || 0}/100
            </p>
            <p className="text-gray-400 text-xs">Skill Coverage</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white mb-1 capitalize">
              {analysis.communication_analysis?.overall_health || 'N/A'}
            </p>
            <p className="text-gray-400 text-xs">Communication Health</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white mb-1">
              {analysis.team_cohesion?.cohesion_score || 0}/100
            </p>
            <p className="text-gray-400 text-xs">Team Cohesion</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-white">Recommended Team Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.team_composition?.map((member, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  {member.developer?.avatar_url ? (
                    <img 
                      src={member.developer.avatar_url}
                      alt={member.developer.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-bold">{member.developer?.full_name}</h3>
                      {member.leadership_potential && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Leader
                        </Badge>
                      )}
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                        {member.compatibility_score}% Match
                      </Badge>
                    </div>

                    <p className="text-purple-400 font-semibold text-sm mb-2">{member.recommended_role}</p>

                    <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 mb-3">
                      <p className="text-gray-300 text-sm">{member.why_selected}</p>
                    </div>

                    <div>
                      <p className="text-white font-semibold text-xs mb-2">Responsibilities:</p>
                      <div className="space-y-1">
                        {member.primary_responsibilities?.map((resp, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-gray-300 text-xs">{resp}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-white font-semibold text-xs mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.skill_contribution?.map((skill, j) => (
                          <Badge key={j} className="bg-green-500/20 text-green-400 border-0 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {analysis.skill_analysis?.covered_skills?.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Covered Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.skill_analysis.covered_skills.map((skill, i) => (
                <Badge key={i} className="bg-green-500/20 text-green-400 border-0">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}