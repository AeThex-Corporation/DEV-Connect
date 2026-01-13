
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Video,
  FileText,
  Code,
  TrendingUp,
  Award,
  Users,
  MessageSquare,
  Search,
  Filter,
  Clock,
  Star,
  CheckCircle,
  Play,
  Bookmark,
  ExternalLink,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LearningHub() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [myLearningPath, setMyLearningPath] = useState(null);
  const [generatingPath, setGeneratingPath] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: resources = [], isLoading: loadingResources } = useQuery({
    queryKey: ['learning-resources'],
    queryFn: () => base44.entities.LearningResource.list('-created_date', 50)
  });

  const { data: myProgress = [] } = useQuery({
    queryKey: ['my-learning-progress', user?.id],
    queryFn: () => user ? base44.entities.UserLearningProgress.filter({ user_id: user.id }) : [],
    enabled: !!user
  });

  const { data: forumPosts = [] } = useQuery({
    queryKey: ['forum-posts'],
    queryFn: () => base44.entities.ForumPost.filter({ category: 'Questions' }, '-created_date', 10)
  });

  const { data: learningPaths = [] } = useQuery({
    queryKey: ['my-learning-paths', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.LearningPath.filter({ user_id: user.id }, '-created_date');
    },
    enabled: !!user
  });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesType;
  });

  const getProgressForResource = (resourceId) => {
    return myProgress.find(p => p.resource_id === resourceId);
  };

  const toggleBookmark = async (resource) => {
    const progress = getProgressForResource(resource.id);
    
    if (progress) {
      await base44.entities.UserLearningProgress.update(progress.id, {
        bookmarked: !progress.bookmarked
      });
    } else {
      await base44.entities.UserLearningProgress.create({
        user_id: user.id,
        resource_id: resource.id,
        bookmarked: true
      });
    }
  };

  const startResource = async (resource) => {
    const progress = getProgressForResource(resource.id);
    
    if (!progress) {
      await base44.entities.UserLearningProgress.create({
        user_id: user.id,
        resource_id: resource.id,
        status: 'in_progress',
        started_date: new Date().toISOString()
      });
    }
    
    window.open(resource.url, '_blank');
  };

  const markComplete = async (resource) => {
    const progress = getProgressForResource(resource.id);
    
    if (progress) {
      await base44.entities.UserLearningProgress.update(progress.id, {
        status: 'completed',
        progress_percentage: 100,
        completed_date: new Date().toISOString()
      });
    } else {
      await base44.entities.UserLearningProgress.create({
        user_id: user.id,
        resource_id: resource.id,
        status: 'completed',
        progress_percentage: 100,
        completed_date: new Date().toISOString()
      });
    }
  };

  const generatePersonalizedPath = async () => {
    if (!user) return;
    
    setGeneratingPath(true);
    
    try {
      // Get market data
      const allJobs = await base44.entities.Job.filter({ status: 'Open' });
      
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized learning path for this Roblox developer:

Profile:
- Current Roles: ${user.developer_roles?.join(', ') || 'None'}
- Current Skills: ${user.skills?.join(', ') || 'None'}
- Experience Level: ${user.experience_level || 'Beginner'}
- Years of Experience: ${user.years_of_experience || 0}
- Primary Interest: ${user.primary_interest || 'Finding Jobs'}
- Career Goal: ${user.career_goal || 'Not specified'}

Market Demand (${allJobs.length} open jobs):
${allJobs.slice(0, 30).map(j => `- ${j.title}: ${j.required_roles?.join(', ')}, ${j.required_skills?.join(', ')}`).join('\n')}

Create a comprehensive 3-6 month learning path with:
1. Identified skill gaps based on their goals and market demand
2. Recommended resources in order of priority
3. Suggested hands-on projects to practice
4. Clear milestones to track progress
5. Estimated timeline

Focus on skills that will maximize their job opportunities and career growth.`,
        response_json_schema: {
          type: "object",
          properties: {
            path_name: { type: "string" },
            target_role: { type: "string" },
            target_level: { type: "string" },
            estimated_duration_weeks: { type: "number" },
            skill_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  current_level: { type: "number" },
                  target_level: { type: "number" },
                  priority: { type: "string" },
                  market_demand: { type: "number" }
                }
              }
            },
            recommended_resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  type: { type: "string" },
                  url: { type: "string" },
                  duration: { type: "string" },
                  difficulty: { type: "string" },
                  skills_covered: { type: "array", items: { type: "string" } }
                }
              }
            },
            suggested_projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  project_name: { type: "string" },
                  description: { type: "string" },
                  skills_practiced: { type: "array", items: { type: "string" } },
                  estimated_weeks: { type: "number" },
                  difficulty: { type: "string" }
                }
              }
            },
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            ai_recommendations: { type: "string" }
          }
        }
      });

      // Create learning path
      const newPath = await base44.entities.LearningPath.create({
        user_id: user.id,
        path_name: analysis.path_name,
        target_role: analysis.target_role,
        current_level: user.experience_level || 'beginner',
        target_level: analysis.target_level,
        skill_gaps: analysis.skill_gaps,
        recommended_resources: analysis.recommended_resources,
        suggested_projects: analysis.suggested_projects,
        milestones: analysis.milestones.map(m => ({ ...m, completed: false })),
        estimated_duration_weeks: analysis.estimated_duration_weeks,
        progress_percentage: 0,
        ai_recommendations: analysis.ai_recommendations,
        last_updated: new Date().toISOString()
      });

      setMyLearningPath(newPath);
      alert('✨ Your personalized learning path is ready!');
    } catch (error) {
      console.error('Error generating learning path:', error);
      alert('Failed to generate learning path. Please try again.');
    } finally {
      setGeneratingPath(false);
    }
  };

  const categories = ['Scripting', 'Building', 'UI Design', '3D Modeling', 'Game Design', 'Sound Design', 'Animation', 'VFX', 'Monetization', 'Marketing'];
  
  const typeIcons = {
    'Tutorial': Code,
    'Article': FileText,
    'Video': Video,
    'Course': BookOpen,
    'Documentation': FileText,
    'Tool': Zap,
    'Template': Target
  };

  const completedCount = myProgress.filter(p => p.status === 'completed').length;
  const inProgressCount = myProgress.filter(p => p.status === 'in_progress').length;

  useEffect(() => {
    if (learningPaths.length > 0) {
      setMyLearningPath(learningPaths[0]);
    }
  }, [learningPaths]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Learning Hub</h1>
              <p className="text-gray-400">Master Roblox development with curated resources</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-xs">Completed</span>
                </div>
                <p className="text-2xl font-bold text-white">{completedCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-xs">In Progress</span>
                </div>
                <p className="text-2xl font-bold text-white">{inProgressCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bookmark className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-400 text-xs">Bookmarked</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {myProgress.filter(p => p.bookmarked).length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="path" className="w-full">
          <TabsList className="bg-white/5 border-0 mb-6">
            <TabsTrigger value="path">
              <Target className="w-4 h-4 mr-2" />
              My Learning Path
            </TabsTrigger>
            <TabsTrigger value="resources">
              <BookOpen className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="my-learning">
              <TrendingUp className="w-4 h-4 mr-2" />
              My Progress
            </TabsTrigger>
            <TabsTrigger value="community">
              <Users className="w-4 h-4 mr-2" />
              Community Q&A
            </TabsTrigger>
            <TabsTrigger value="spotlights">
              <Award className="w-4 h-4 mr-2" />
              Developer Spotlights
            </TabsTrigger>
          </TabsList>

          {/* NEW: Learning Path Tab */}
          <TabsContent value="path" className="space-y-6">
            {!myLearningPath ? (
              <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Get Your AI-Powered Learning Path
                  </h2>
                  <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                    Our AI will analyze your profile, career goals, and current market trends to create a personalized roadmap for your skill development.
                  </p>
                  <Button
                    onClick={generatePersonalizedPath}
                    disabled={generatingPath}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg px-8 py-6"
                  >
                    {generatingPath ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Generating Your Path...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate My Learning Path
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Path Overview */}
                <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-2xl mb-2">
                          {myLearningPath.path_name}
                        </CardTitle>
                        <p className="text-gray-400">
                          Target: {myLearningPath.target_role} • {myLearningPath.target_level} Level
                        </p>
                      </div>
                      <Button
                        onClick={generatePersonalizedPath}
                        size="sm"
                        variant="outline"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">Overall Progress</span>
                        <span className="text-white">{myLearningPath.progress_percentage}%</span>
                      </div>
                      <Progress value={myLearningPath.progress_percentage} className="h-3" />
                      <p className="text-gray-400 text-sm mt-2">
                        Estimated Duration: {myLearningPath.estimated_duration_weeks} weeks
                      </p>
                    </div>

                    <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                      <p className="text-blue-400 font-semibold text-sm mb-2">🤖 AI Recommendations:</p>
                      <p className="text-gray-300 text-sm">{myLearningPath.ai_recommendations}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Skill Gaps */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Skill Gaps to Fill</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {myLearningPath.skill_gaps?.map((gap, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold">{gap.skill_name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                gap.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-0' :
                                gap.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-0' :
                                gap.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-0' :
                                'bg-blue-500/20 text-blue-400 border-0'
                              }>
                                {gap.priority} priority
                              </Badge>
                              <Badge className="bg-green-500/20 text-green-400 border-0">
                                {gap.market_demand}/10 demand
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>Current: Level {gap.current_level}</span>
                            <span>→</span>
                            <span>Target: Level {gap.target_level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Resources */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Recommended Learning Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {myLearningPath.recommended_resources?.map((resource, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-indigo-400 font-bold">{i + 1}.</span>
                              <h4 className="text-white font-semibold">{resource.title}</h4>
                              <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                                {resource.type}
                              </Badge>
                              <Badge variant="outline" className="border-white/10 text-gray-400 text-xs">
                                {resource.difficulty}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>⏱️ {resource.duration}</span>
                              <span>📚 {resource.skills_covered?.join(', ')}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => window.open(resource.url, '_blank')}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Suggested Projects */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Hands-On Projects to Build</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {myLearningPath.suggested_projects?.map((project, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">{project.project_name}</h4>
                          <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                              {project.difficulty}
                            </Badge>
                            <span className="text-gray-400 text-xs">~{project.estimated_weeks} weeks</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {project.skills_practiced?.map(skill => (
                              <Badge key={skill} className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Milestones */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Learning Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {myLearningPath.milestones?.map((milestone, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg border ${
                            milestone.completed
                              ? 'bg-green-500/10 border-green-500/20'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {milestone.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">{milestone.title}</h4>
                              <p className="text-gray-400 text-sm">{milestone.description}</p>
                              {milestone.completed && milestone.completed_date && (
                                <p className="text-green-400 text-xs mt-2">
                                  ✓ Completed {new Date(milestone.completed_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search resources..."
                      className="pl-10 bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Tutorial">Tutorial</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="Course">Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingResources ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No resources found</p>
                </div>
              ) : (
                filteredResources.map((resource) => {
                  const progress = getProgressForResource(resource.id);
                  const TypeIcon = typeIcons[resource.type] || FileText;
                  
                  return (
                    <Card key={resource.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                      <CardContent className="p-4">
                        {resource.thumbnail_url && (
                          <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-white/5">
                            <img 
                              src={resource.thumbnail_url} 
                              alt={resource.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TypeIcon className="w-4 h-4 text-indigo-400" />
                              <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                                {resource.type}
                              </Badge>
                              {resource.curated && (
                                <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Curated
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-white font-semibold mb-1 line-clamp-2">{resource.title}</h3>
                            <p className="text-gray-400 text-xs line-clamp-2 mb-2">{resource.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                          <Badge variant="outline" className="border-white/10 text-gray-400">
                            {resource.difficulty}
                          </Badge>
                          {resource.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{resource.duration_minutes} min</span>
                            </div>
                          )}
                          {resource.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span>{resource.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {progress && progress.status !== 'not_started' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-400">
                                {progress.status === 'completed' ? 'Completed' : 'In Progress'}
                              </span>
                              <span className="text-xs text-white">{progress.progress_percentage}%</span>
                            </div>
                            <Progress value={progress.progress_percentage} className="h-1" />
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => startResource(resource)}
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            {progress?.status === 'completed' ? 'Review' : progress?.status === 'in_progress' ? 'Continue' : 'Start'}
                          </Button>
                          <Button
                            onClick={() => toggleBookmark(resource)}
                            size="sm"
                            variant="ghost"
                            className={progress?.bookmarked ? 'text-yellow-400' : 'text-gray-400'}
                          >
                            <Bookmark className={`w-4 h-4 ${progress?.bookmarked ? 'fill-yellow-400' : ''}`} />
                          </Button>
                          {progress?.status !== 'completed' && progress?.status === 'in_progress' && (
                            <Button
                              onClick={() => markComplete(resource)}
                              size="sm"
                              variant="ghost"
                              className="text-green-400"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* My Progress Tab */}
          <TabsContent value="my-learning" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white mb-1">{completedCount}</p>
                  <p className="text-gray-400 text-sm">Resources Completed</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <Play className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white mb-1">{inProgressCount}</p>
                  <p className="text-gray-400 text-sm">In Progress</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-6 text-center">
                  <Clock className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white mb-1">
                    {Math.round(myProgress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) / 60)}
                  </p>
                  <p className="text-gray-400 text-sm">Hours Learned</p>
                </CardContent>
              </Card>
            </div>

            {myProgress.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">Start Your Learning Journey</h3>
                  <p className="text-gray-400 mb-4">Browse resources and start learning to track your progress</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myProgress.map((progress) => {
                  const resource = resources.find(r => r.id === progress.resource_id);
                  if (!resource) return null;

                  return (
                    <Card key={progress.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={
                                progress.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-400 border-0'
                                  : 'bg-blue-500/20 text-blue-400 border-0'
                              }>
                                {progress.status === 'completed' ? 'Completed' : 'In Progress'}
                              </Badge>
                              <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                                {resource.type}
                              </Badge>
                            </div>
                            <h4 className="text-white font-semibold mb-1">{resource.title}</h4>
                            <p className="text-gray-400 text-xs mb-3">{resource.category}</p>

                            <div className="flex items-center gap-2 mb-2">
                              <Progress value={progress.progress_percentage} className="flex-1 h-2" />
                              <span className="text-xs text-white">{progress.progress_percentage}%</span>
                            </div>

                            {progress.completed_date && (
                              <p className="text-green-400 text-xs">
                                ✓ Completed {new Date(progress.completed_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          <Button
                            onClick={() => window.open(resource.url, '_blank')}
                            size="sm"
                            className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Community Q&A Tab */}
          <TabsContent value="community" className="space-y-4">
            <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="text-white font-bold text-lg">Community Q&A Forum</h3>
                    <p className="text-gray-400 text-sm">Ask questions, share knowledge, help each other grow</p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask a Question
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {forumPosts.map((post) => (
                <Card key={post.id} className="glass-card border-0 hover:border-white/20 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{post.title}</h4>
                        <p className="text-gray-400 text-xs line-clamp-2 mb-2">{post.content}</p>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{post.replies_count} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span>{post.likes} likes</span>
                          </div>
                          <Badge className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-blue-500/20 text-center">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Join Our Discord Community</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get instant help, share your work, and network with other Roblox developers
              </p>
              <Button 
                onClick={() => window.open('https://discord.gg/athx', '_blank')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Join Discord Server
              </Button>
            </div>
          </TabsContent>

          {/* Developer Spotlights Tab */}
          <TabsContent value="spotlights" className="space-y-4">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="text-white font-bold text-lg">Developer Spotlights</h3>
                    <p className="text-gray-400 text-sm">Success stories from our community</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {[
              {
                name: "Alex Chen",
                role: "Full-Stack Scripter",
                achievement: "Landed a $50K job through Dev-Link",
                story: "After completing 3 skill certifications and optimizing my profile with AI suggestions, I got matched with my dream studio. The escrow system made the whole process smooth and secure.",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
                stats: { jobs: 12, rating: 4.9, earnings: "50K+" }
              },
              {
                name: "Sarah Martinez",
                role: "UI/UX Designer",
                achievement: "Grew from freelancer to studio co-founder",
                story: "Started taking small UI jobs, built my portfolio, and eventually met my co-founders through the collaboration tools. We now run a successful game studio together.",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
                stats: { jobs: 25, rating: 5.0, earnings: "75K+" }
              },
              {
                name: "Marcus Johnson",
                role: "3D Modeler & Builder",
                achievement: "From beginner to expert in 6 months",
                story: "The learning resources and mentorship program helped me go from basic building to creating professional 3D assets. Now I'm teaching others!",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
                stats: { jobs: 8, rating: 4.8, earnings: "30K+" }
              }
            ].map((spotlight, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={spotlight.avatar}
                      alt={spotlight.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-bold">{spotlight.name}</h4>
                      <p className="text-gray-400 text-sm mb-1">{spotlight.role}</p>
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                        {spotlight.achievement}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 italic">"{spotlight.story}"</p>

                  <div className="grid grid-cols-3 gap-4 bg-white/5 rounded-lg p-3">
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">{spotlight.stats.jobs}</p>
                      <p className="text-gray-400 text-xs">Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {spotlight.stats.rating}
                      </p>
                      <p className="text-gray-400 text-xs">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">${spotlight.stats.earnings}</p>
                      <p className="text-gray-400 text-xs">Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
