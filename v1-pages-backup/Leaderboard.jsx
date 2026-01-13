import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  TrendingUp,
  Star,
  Zap,
  Award,
  Medal,
  Crown,
  User,
  Briefcase,
  Target,
  Flame
} from "lucide-react";

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [topByXP, setTopByXP] = useState([]);
  const [topByProjects, setTopByProjects] = useState([]);
  const [topByRating, setTopByRating] = useState([]);
  const [topByStreak, setTopByStreak] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      const allUsers = await base44.entities.User.list();
      const developers = allUsers.filter(u => u.developer_roles?.length > 0);

      // Sort by XP
      const byXP = [...developers].sort((a, b) => (b.xp_points || 0) - (a.xp_points || 0)).slice(0, 50);
      setTopByXP(byXP);

      // Sort by completed projects
      const byProjects = [...developers].sort((a, b) => (b.completed_projects || 0) - (a.completed_projects || 0)).slice(0, 50);
      setTopByProjects(byProjects);

      // Sort by rating
      const byRating = [...developers]
        .filter(u => (u.rating || 0) > 0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 50);
      setTopByRating(byRating);

      // Sort by streak
      const byStreak = [...developers].sort((a, b) => (b.streak_days || 0) - (a.streak_days || 0)).slice(0, 50);
      setTopByStreak(byStreak);

    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-400/20 to-slate-400/20 border-gray-400/30';
    if (rank === 3) return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
    return 'from-white/5 to-white/10 border-white/10';
  };

  const LeaderboardList = ({ users, metric, metricLabel, icon: Icon }) => (
    <div className="space-y-3">
      {users.map((dev, index) => {
        const isCurrentUser = dev.id === currentUser?.id;
        const rank = index + 1;
        const rankIcon = getRankIcon(rank);

        return (
          <Card 
            key={dev.id} 
            className={`glass-card border-0 card-hover ${
              isCurrentUser ? 'ring-2 ring-indigo-500' : ''
            } ${rank <= 3 ? `bg-gradient-to-r ${getRankColor(rank)}` : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-12 h-12 glass-card rounded-full flex-shrink-0">
                  {rankIcon || (
                    <span className="text-white font-bold text-lg">#{rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  {dev.avatar_url ? (
                    <img 
                      src={dev.avatar_url} 
                      alt={dev.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={`${createPageUrl('PublicProfile')}?id=${dev.id}`}
                      className="text-white font-semibold hover:text-indigo-400 transition-colors"
                    >
                      {dev.full_name}
                    </a>
                    {isCurrentUser && (
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                        You
                      </Badge>
                    )}
                    {dev.verified && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Level {dev.level || 1}</span>
                    <span>•</span>
                    <span>{dev.developer_roles?.[0] || 'Developer'}</span>
                    {dev.completed_projects > 0 && (
                      <>
                        <span>•</span>
                        <span>{dev.completed_projects} projects</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Metric */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span className="text-2xl font-bold text-white">
                      {metric === 'rating' ? dev[metric]?.toFixed(1) : dev[metric] || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{metricLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold gradient-text">Global Leaderboard</h1>
        </div>
        <p className="text-gray-400">
          Compete with the best developers on Dev-Link
        </p>
      </div>

      {/* Current User Stats */}
      {currentUser && (
        <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Your Stats</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-white text-2xl font-bold">{currentUser.xp_points || 0}</p>
                    <p className="text-gray-400 text-xs">Total XP</p>
                  </div>
                  <div>
                    <p className="text-white text-2xl font-bold">Level {currentUser.level || 1}</p>
                    <p className="text-gray-400 text-xs">Current Level</p>
                  </div>
                  <div>
                    <p className="text-white text-2xl font-bold">{currentUser.completed_projects || 0}</p>
                    <p className="text-gray-400 text-xs">Projects Done</p>
                  </div>
                  <div>
                    <p className="text-white text-2xl font-bold">{currentUser.streak_days || 0}</p>
                    <p className="text-gray-400 text-xs">Day Streak</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => window.location.href = createPageUrl('Profile')}
                className="btn-primary text-white"
              >
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="xp" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="xp">
            <Zap className="w-4 h-4 mr-2" />
            Top XP
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Briefcase className="w-4 h-4 mr-2" />
            Most Projects
          </TabsTrigger>
          <TabsTrigger value="rating">
            <Star className="w-4 h-4 mr-2" />
            Top Rated
          </TabsTrigger>
          <TabsTrigger value="streak">
            <Flame className="w-4 h-4 mr-2" />
            Longest Streak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="xp">
          <LeaderboardList 
            users={topByXP} 
            metric="xp_points" 
            metricLabel="XP Points"
            icon={Zap}
          />
        </TabsContent>

        <TabsContent value="projects">
          <LeaderboardList 
            users={topByProjects} 
            metric="completed_projects" 
            metricLabel="Projects"
            icon={Briefcase}
          />
        </TabsContent>

        <TabsContent value="rating">
          <LeaderboardList 
            users={topByRating} 
            metric="rating" 
            metricLabel="Rating"
            icon={Star}
          />
        </TabsContent>

        <TabsContent value="streak">
          <LeaderboardList 
            users={topByStreak} 
            metric="streak_days" 
            metricLabel="Days"
            icon={Flame}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}