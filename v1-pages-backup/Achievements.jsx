import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  Trophy,
  Star,
  Lock,
  Zap,
  Target,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function Achievements() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
  };

  const { data: achievements = [] } = useQuery({
    queryKey: ['my-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Achievement.filter({ user_id: user.id }, '-unlocked_at');
    },
    enabled: !!user
  });

  const achievementDefinitions = [
    {
      type: 'first_job',
      title: 'First Steps',
      description: 'Complete your first job',
      icon: '🎯',
      rarity: 'common',
      points: 100,
      category: 'Career'
    },
    {
      type: '5_jobs_completed',
      title: 'Getting Started',
      description: 'Complete 5 jobs',
      icon: '🚀',
      rarity: 'common',
      points: 250,
      category: 'Career'
    },
    {
      type: '10_jobs_completed',
      title: 'Experienced',
      description: 'Complete 10 jobs',
      icon: '💼',
      rarity: 'rare',
      points: 500,
      category: 'Career'
    },
    {
      type: '25_jobs_completed',
      title: 'Professional',
      description: 'Complete 25 jobs',
      icon: '⭐',
      rarity: 'epic',
      points: 1000,
      category: 'Career'
    },
    {
      type: '50_jobs_completed',
      title: 'Veteran',
      description: 'Complete 50 jobs',
      icon: '👑',
      rarity: 'legendary',
      points: 2500,
      category: 'Career'
    },
    {
      type: 'first_5_star_review',
      title: 'Five Star Service',
      description: 'Receive your first 5-star review',
      icon: '⭐',
      rarity: 'common',
      points: 150,
      category: 'Reputation'
    },
    {
      type: '10_five_star_reviews',
      title: 'Highly Rated',
      description: 'Receive 10 five-star reviews',
      icon: '🌟',
      rarity: 'epic',
      points: 750,
      category: 'Reputation'
    },
    {
      type: 'profile_100_complete',
      title: 'Complete Profile',
      description: 'Fill out 100% of your profile',
      icon: '✅',
      rarity: 'common',
      points: 100,
      category: 'Profile'
    },
    {
      type: 'portfolio_5_projects',
      title: 'Portfolio Builder',
      description: 'Add 5 projects to your portfolio',
      icon: '📁',
      rarity: 'common',
      points: 200,
      category: 'Profile'
    },
    {
      type: 'portfolio_10_projects',
      title: 'Showcase Master',
      description: 'Add 10 projects to your portfolio',
      icon: '🎨',
      rarity: 'rare',
      points: 400,
      category: 'Profile'
    },
    {
      type: 'fast_responder_streak_7',
      title: 'Quick Responder',
      description: 'Respond to messages within 1 hour for 7 days',
      icon: '⚡',
      rarity: 'rare',
      points: 300,
      category: 'Activity'
    },
    {
      type: 'fast_responder_streak_30',
      title: 'Lightning Fast',
      description: 'Respond to messages within 1 hour for 30 days',
      icon: '⚡',
      rarity: 'legendary',
      points: 1500,
      category: 'Activity'
    },
    {
      type: 'earned_10k_robux',
      title: 'First Earnings',
      description: 'Earn 10,000 Robux',
      icon: '💰',
      rarity: 'common',
      points: 200,
      category: 'Earnings'
    },
    {
      type: 'earned_100k_robux',
      title: 'High Earner',
      description: 'Earn 100,000 Robux',
      icon: '💎',
      rarity: 'epic',
      points: 1000,
      category: 'Earnings'
    },
    {
      type: 'skill_master',
      title: 'Skill Master',
      description: 'Earn 5 skill certifications',
      icon: '🎓',
      rarity: 'epic',
      points: 800,
      category: 'Skills'
    },
    {
      type: 'community_helper',
      title: 'Community Champion',
      description: 'Help 50 developers in forums',
      icon: '🤝',
      rarity: 'epic',
      points: 600,
      category: 'Community'
    },
    {
      type: 'early_adopter',
      title: 'Early Adopter',
      description: 'Join during beta period',
      icon: '🎖️',
      rarity: 'legendary',
      points: 500,
      category: 'Special'
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked_at);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + (a.points || 0), 0);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const categories = ['All', 'Career', 'Reputation', 'Profile', 'Skills', 'Community', 'Earnings', 'Activity', 'Special'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredDefs = selectedCategory === 'All' 
    ? achievementDefinitions
    : achievementDefinitions.filter(def => def.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Achievements</h1>
            <p className="text-gray-400">Unlock badges and earn rewards</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{unlockedAchievements.length}</p>
              <p className="text-gray-400 text-xs">Unlocked</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalPoints}</p>
              <p className="text-gray-400 text-xs">Total XP</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.round((unlockedAchievements.length / achievementDefinitions.length) * 100)}%
              </p>
              <p className="text-gray-400 text-xs">Complete</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(category => (
          <Button
            key={category}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={
              selectedCategory === category
                ? 'btn-primary text-white'
                : 'glass-card border-0 text-white hover:bg-white/5'
            }
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDefs.map((def) => {
          const userAchievement = achievements.find(a => a.achievement_type === def.type);
          const isUnlocked = userAchievement?.unlocked_at;

          return (
            <Card
              key={def.type}
              className={`glass-card border-0 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20'
                  : 'opacity-60'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                      : 'bg-gray-500/20'
                  }`}>
                    {isUnlocked ? def.icon : <Lock className="w-6 h-6 text-gray-500" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{def.title}</h3>
                      {isUnlocked && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{def.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={getRarityColor(def.rarity)}>
                        {def.rarity}
                      </Badge>
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-0">
                        <Zap className="w-3 h-3 mr-1" />
                        {def.points} XP
                      </Badge>
                    </div>
                  </div>
                </div>

                {userAchievement?.progress !== undefined && !isUnlocked && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-xs text-white">{userAchievement.progress}%</span>
                    </div>
                    <Progress value={userAchievement.progress} className="h-2" />
                  </div>
                )}

                {isUnlocked && userAchievement.unlocked_at && (
                  <p className="text-green-400 text-xs mt-2">
                    Unlocked {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}