
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Target,
  BookOpen,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap,
  Calendar,
  ExternalLink,
  PlayCircle,
  Clock
} from "lucide-react";
import { awardXP } from "./GamificationSystem";

export default function AILearningPathGenerator({ user }) {
  const [loading, setLoading] = useState(false);
  const [learningPaths, setLearningPaths] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [mentorshipOpportunities, setMentorshipOpportunities] = useState([]);

  useEffect(() => {
    if (user) {
      loadExistingPaths();
    }
  }, [user]);

  const loadExistingPaths = async () => {
    try {
      const paths = await base44.entities.LearningPath.filter({ user_id: user.id });
      setLearningPaths(paths);
      if (paths.length > 0) {
        setActivePath(paths[0]);
      }
    } catch (error) {
      console.error('Error loading paths:', error);
    }
  };

  const generateLearningPath = async (targetRole, targetLevel) => {
    setLoading(true);
    try {
      // Get user's certifications
      const certifications = await base44.entities.Certification.filter({ user_id: user.id });
      
      // Get trending jobs to understand market demand
      const jobs = await base44.entities.Job.filter({ status: "Open" }, "-created_date", 100);

      const prompt = `
You are an AI learning path architect for Roblox developers. Create a comprehensive, personalized learning roadmap.

DEVELOPER PROFILE:
- Current Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
- Current Skills: ${user.skills?.join(', ') || 'Not specified'}
- Experience Level: ${user.experience_level || 'Not specified'}
- Certifications: ${certifications.map(c => `${c.skill_name} (${c.certification_level} - ${c.score}%)`).join(', ')}
- Target Role: ${targetRole}
- Target Level: ${targetLevel}

MARKET ANALYSIS (100 Recent Jobs):
${jobs.slice(0, 20).map(j => `- ${j.title}: Roles: ${j.required_roles?.join(', ')}, Skills: ${j.required_skills?.join(', ')}`).join('\n')}

CREATE A DETAILED LEARNING PATH WITH:

1. SKILL GAP ANALYSIS:
   - Identify specific skills needed for target role
   - Rate priority (critical/high/medium/low)
   - Calculate market demand percentage
   - Estimate time to proficiency

2. PHASE-BY-PHASE LEARNING PLAN:
   - Foundation Phase (Weeks 1-4)
   - Skill Building Phase (Weeks 5-12)
   - Advanced Mastery Phase (Weeks 13-24)
   - Expert Specialization Phase (Weeks 25-36)

3. CURATED RESOURCES:
   - Roblox official documentation links
   - YouTube tutorials (real channels)
   - Community resources
   - Practice projects for each phase

4. MILESTONE PROJECTS:
   - 4-6 hands-on projects
   - Increasing difficulty
   - Skills practiced in each
   - Estimated completion time

5. CERTIFICATION ROADMAP:
   - Which certifications to pursue and when
   - Preparation resources
   - Expected difficulty

6. MENTORSHIP RECOMMENDATIONS:
   - What type of mentor to seek
   - Topics to discuss in sessions
   - When to seek mentorship

Return structured, actionable JSON.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            path_overview: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                estimated_weeks: { type: "number" },
                difficulty: { type: "string" }
              }
            },
            skill_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  current_level: { type: "number" },
                  target_level: { type: "number" },
                  priority: { type: "string" },
                  market_demand: { type: "number" },
                  time_to_proficiency_weeks: { type: "number" },
                  why_important: { type: "string" }
                }
              }
            },
            learning_phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase_name: { type: "string" },
                  weeks: { type: "string" },
                  focus_areas: { type: "array", items: { type: "string" } },
                  resources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        type: { type: "string" },
                        url: { type: "string" },
                        duration: { type: "string" },
                        difficulty: { type: "string" }
                      }
                    }
                  },
                  practice_exercises: { type: "array", items: { type: "string" } }
                }
              }
            },
            milestone_projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  project_name: { type: "string" },
                  description: { type: "string" },
                  skills_practiced: { type: "array", items: { type: "string" } },
                  estimated_weeks: { type: "number" },
                  difficulty: { type: "string" },
                  deliverables: { type: "array", items: { type: "string" } },
                  success_criteria: { type: "array", items: { type: "string" } }
                }
              }
            },
            certification_roadmap: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  certification: { type: "string" },
                  level: { type: "string" },
                  recommended_week: { type: "number" },
                  preparation_time: { type: "string" },
                  prerequisites: { type: "array", items: { type: "string" } }
                }
              }
            },
            mentorship_guidance: {
              type: "object",
              properties: {
                mentor_profile: { type: "string" },
                session_frequency: { type: "string" },
                discussion_topics: { type: "array", items: { type: "string" } },
                when_to_seek: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      // Validate and provide fallbacks for the response
      const pathOverview = response.path_overview || {};
      const pathTitle = pathOverview.title || `${targetRole} Learning Path`;
      const estimatedWeeks = pathOverview.estimated_weeks || 24;
      const skillGaps = response.skill_gaps || [];
      const learningPhases = response.learning_phases || [];
      const milestoneProjects = response.milestone_projects || [];
      const certificationRoadmap = response.certification_roadmap || [];

      // Create learning path entity with validated data
      const newPath = await base44.entities.LearningPath.create({
        user_id: user.id,
        path_name: pathTitle,
        target_role: targetRole,
        current_level: user.experience_level?.toLowerCase() || 'beginner',
        target_level: targetLevel,
        skill_gaps: skillGaps,
        recommended_resources: learningPhases.flatMap(phase => phase.resources || []),
        suggested_projects: milestoneProjects,
        milestones: learningPhases.map(phase => ({
          title: phase.phase_name || 'Learning Phase',
          description: `Focus: ${(phase.focus_areas || []).join(', ') || 'Skills development'}`,
          completed: false
        })),
        estimated_duration_weeks: estimatedWeeks,
        progress_percentage: 0,
        ai_recommendations: certificationRoadmap.length > 0 
          ? `Certification roadmap: ${certificationRoadmap.map(c => c.certification).join(', ')}`
          : 'Complete learning phases to unlock certifications'
      });

      // Award XP for creating learning path
      await awardXP(user.id, 50, 'Created personalized learning path');

      // Find potential mentors
      if (response.mentorship_guidance) {
        await findMentors(response.mentorship_guidance);
      }

      setActivePath(newPath);
      await loadExistingPaths();

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🎓 Learning Path Created!',
        message: `Your personalized ${targetRole} learning roadmap is ready. Estimated time: ${estimatedWeeks} weeks.`,
        link: createPageUrl('Profile')
      });

    } catch (error) {
      console.error('Error generating learning path:', error);
      alert('Failed to generate learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const findMentors = async (mentorshipGuidance) => {
    try {
      // Find users who could be mentors
      const potentialMentors = await base44.entities.User.list();
      const qualified = potentialMentors.filter(u => 
        u.id !== user.id &&
        u.experience_level === 'Expert' &&
        u.completed_projects >= 10
      ).slice(0, 5);

      setMentorshipOpportunities(qualified);
    } catch (error) {
      console.error('Error finding mentors:', error);
    }
  };

  const updateMilestone = async (milestoneIndex, completed) => {
    if (!activePath) return;

    try {
      const updatedMilestones = [...activePath.milestones];
      updatedMilestones[milestoneIndex] = {
        ...updatedMilestones[milestoneIndex],
        completed: completed,
        completed_date: completed ? new Date().toISOString().split('T')[0] : null
      };

      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const progress = Math.round((completedCount / updatedMilestones.length) * 100);

      await base44.entities.LearningPath.update(activePath.id, {
        milestones: updatedMilestones,
        progress_percentage: progress,
        last_updated: new Date().toISOString()
      });

      if (completed) {
        await awardXP(user.id, 100, `Completed learning milestone: ${updatedMilestones[milestoneIndex].title}`);
      }

      await loadExistingPaths();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const requestMentorship = async (mentorId) => {
    try {
      await base44.entities.MentorshipRequest.create({
        mentee_id: user.id,
        mentor_id: mentorId,
        focus_areas: activePath?.skill_gaps?.map(g => g.skill_name) || [],
        message: `Hi! I'm following a learning path to become a ${activePath?.target_role} and would love your guidance.`,
        goals: `Advance from ${activePath?.current_level} to ${activePath?.target_level}`,
        commitment_level: 'regular',
        preferred_meeting_frequency: 'bi-weekly'
      });

      alert('Mentorship request sent!');
    } catch (error) {
      console.error('Error requesting mentorship:', error);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Analyzing your profile and generating personalized learning path...</p>
          <p className="text-gray-400 text-sm mt-2">This may take up to 30 seconds</p>
        </CardContent>
      </Card>
    );
  }

  if (!activePath) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">AI Learning Path Generator</h3>
            <p className="text-gray-400">
              Get a personalized roadmap to advance your Roblox development career
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Skill Gap Analysis</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Curated Resources</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Mentor Matching</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold">Choose Your Goal:</h4>
            {['Advanced Scripter', 'UI/UX Expert', '3D Modeling Master', 'Full-Stack Game Developer'].map(role => (
              <Button
                key={role}
                onClick={() => generateLearningPath(role, 'advanced')}
                className="w-full btn-primary text-white justify-between"
              >
                <span>{role}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-white font-bold text-2xl mb-1">{activePath.path_name}</h2>
              <p className="text-gray-400">
                {activePath.current_level} → {activePath.target_level}
              </p>
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 border-0">
              {activePath.estimated_duration_weeks} weeks
            </Badge>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Overall Progress</span>
              <span className="text-white font-bold">{activePath.progress_percentage}%</span>
            </div>
            <Progress value={activePath.progress_percentage} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{activePath.skill_gaps?.length || 0}</p>
              <p className="text-gray-400 text-xs">Skills to Learn</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{activePath.suggested_projects?.length || 0}</p>
              <p className="text-gray-400 text-xs">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {activePath.milestones?.filter(m => m.completed).length || 0}/{activePath.milestones?.length || 0}
              </p>
              <p className="text-gray-400 text-xs">Milestones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="roadmap" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="roadmap">
            <Target className="w-4 h-4 mr-2" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Zap className="w-4 h-4 mr-2" />
            Skills ({activePath.skill_gaps?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Award className="w-4 h-4 mr-2" />
            Projects ({activePath.suggested_projects?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="mentors">
            <Users className="w-4 h-4 mr-2" />
            Mentors ({mentorshipOpportunities.length})
          </TabsTrigger>
        </TabsList>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-4">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Learning Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePath.milestones?.map((milestone, i) => (
                <div key={i} className={`glass-card rounded-lg p-4 ${milestone.completed ? 'bg-green-500/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => updateMilestone(i, !milestone.completed)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        milestone.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-500 hover:border-indigo-500'
                      }`}
                    >
                      {milestone.completed && <CheckCircle className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${milestone.completed ? 'text-green-400' : 'text-white'}`}>
                        {milestone.title}
                      </h4>
                      <p className="text-gray-400 text-sm">{milestone.description}</p>
                      {milestone.completed_date && (
                        <p className="text-green-400 text-xs mt-1">
                          ✓ Completed {new Date(milestone.completed_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          {activePath.skill_gaps?.map((gap, i) => (
            <Card key={i} className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{gap.skill_name}</h3>
                    <p className="text-gray-400 text-sm">{gap.why_important}</p>
                  </div>
                  <Badge className={`${
                    gap.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    gap.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  } border-0`}>
                    {gap.priority}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Market Demand</p>
                    <Progress value={gap.market_demand} className="h-2 mb-1" />
                    <p className="text-white text-sm font-bold">{gap.market_demand}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Current Level</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(level => (
                        <div key={level} className={`h-2 flex-1 rounded ${level <= gap.current_level ? 'bg-indigo-500' : 'bg-gray-700'}`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Time to Learn</p>
                    <p className="text-white text-sm font-bold flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {gap.time_to_proficiency_weeks}w
                    </p>
                  </div>
                </div>

                <Button size="sm" className="btn-primary text-white">
                  <BookOpen className="w-3 h-3 mr-2" />
                  View Resources
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {activePath.suggested_projects?.map((project, i) => (
            <Card key={i} className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{project.project_name}</h3>
                    <p className="text-gray-400 text-sm">{project.description}</p>
                  </div>
                  <Badge className={`${
                    project.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    project.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  } border-0`}>
                    {project.difficulty}
                  </Badge>
                </div>

                <div className="mb-3">
                  <p className="text-gray-400 text-xs mb-2">Skills Practiced:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills_practiced?.map((skill, j) => (
                      <Badge key={j} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {project.success_criteria && (
                  <div className="mb-3">
                    <p className="text-gray-400 text-xs mb-2">Success Criteria:</p>
                    <div className="space-y-1">
                      {project.success_criteria.map((criteria, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Target className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-xs">{criteria}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-xs flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Estimated: {project.estimated_weeks} weeks
                  </p>
                  <Button size="sm" className="btn-primary text-white">
                    Start Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-4">
          <Card className="glass-card border-0 bg-purple-500/5">
            <CardContent className="p-4">
              <p className="text-purple-400 text-sm">
                💡 Based on your learning path, we recommend finding a mentor who specializes in {activePath.target_role}
              </p>
            </CardContent>
          </Card>

          {mentorshipOpportunities.map((mentor, i) => (
            <Card key={i} className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{mentor.full_name}</h3>
                    <p className="text-gray-400 text-sm">{mentor.developer_roles?.join(', ')}</p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                    Expert
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    {mentor.completed_projects} projects
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {mentor.rating?.toFixed(1)} rating
                  </div>
                </div>

                <Button
                  onClick={() => requestMentorship(mentor.id)}
                  size="sm"
                  className="w-full btn-primary text-white"
                >
                  <Users className="w-3 h-3 mr-2" />
                  Request Mentorship
                </Button>
              </CardContent>
            </Card>
          ))}

          {mentorshipOpportunities.length === 0 && (
            <Card className="glass-card border-0">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No mentors available at the moment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
