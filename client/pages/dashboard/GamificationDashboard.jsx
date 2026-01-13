import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Trophy, Award, Star, Zap, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const GamificationDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pointsData, setPointsData] = useState({ total_points: 0, level: 1 });
  const [allAchievements, setAllAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // 1. Fetch User Points (Level & XP)
        const { data: points, error: pointsError } = await supabase
          .from('user_points')
          .select('total_points, level')
          .eq('user_id', user.id)
          .maybeSingle();

        if (points) {
          setPointsData(points);
        }

        // 2. Fetch All Available Achievements
        const { data: achievements, error: achError } = await supabase
          .from('achievements')
          .select('*')
          .order('xp_reward', { ascending: true });
        
        if (achievements) {
          setAllAchievements(achievements);
        }

        // 3. Fetch User's Earned Achievements
        const { data: earned, error: earnedError } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', user.id);

        if (earned) {
            const earnedSet = new Set(earned.map(e => e.achievement_id));
            setUserAchievements(earnedSet);
        }

      } catch (error) {
        console.error("Error fetching gamification data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const currentPoints = pointsData.total_points || 0;
  const currentLevel = pointsData.level || 1;
  // Level calculation: Each level is 1000 XP
  const pointsPerLevel = 1000;
  const pointsInCurrentLevel = currentPoints % pointsPerLevel;
  const progressPercentage = (pointsInCurrentLevel / pointsPerLevel) * 100;
  const pointsToNextLevel = pointsPerLevel - pointsInCurrentLevel;

  return (
    <div className="min-h-screen bg-black pt-24 px-4 pb-12">
      <Helmet>
        <title>Gamification & Rewards | Devconnect</title>
      </Helmet>
      
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Achievements & Rewards
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Track your progress, earn XP by completing jobs and courses, and unlock exclusive badges to showcase on your profile.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level Progress Card */}
            <Card className="bg-gray-900 border-gray-800 col-span-1 md:col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                             <span>Level {currentLevel}</span>
                        </div>
                        <span className="text-sm font-normal text-gray-400">{currentPoints} Total XP</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400 uppercase font-semibold">
                            <span>{pointsInCurrentLevel} XP</span>
                            <span>{pointsPerLevel} XP (Next Level)</span>
                        </div>
                        <Progress value={progressPercentage} className="h-4 bg-gray-800" indicatorClassName="bg-gradient-to-r from-blue-600 to-purple-600" />
                        <p className="text-sm text-gray-300 pt-2">
                            You need <span className="text-white font-bold">{pointsToNextLevel} XP</span> to reach Level {currentLevel + 1}.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="bg-gray-900 border-gray-800 flex flex-col justify-center items-center py-6">
                <div className="relative mb-3">
                    <Award className="w-16 h-16 text-purple-500" />
                    <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {userAchievements.size}
                    </div>
                </div>
                <div className="text-2xl font-bold text-white">{userAchievements.size} / {allAchievements.length}</div>
                <div className="text-sm text-gray-400">Badges Unlocked</div>
            </Card>
        </div>

        {/* Achievements Grid */}
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" /> Badges Gallery
            </h2>
            
            {allAchievements.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-xl border border-dashed border-gray-800">
                    <p className="text-gray-500">No achievements available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allAchievements.map((achievement) => {
                        const isUnlocked = userAchievements.has(achievement.id);
                        return (
                            <div 
                                key={achievement.id} 
                                className={cn(
                                    "relative p-5 rounded-xl border transition-all duration-300 flex flex-col items-center text-center gap-3",
                                    isUnlocked 
                                        ? "bg-gray-900/80 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                                        : "bg-gray-900/30 border-gray-800 opacity-70 grayscale hover:grayscale-0 hover:opacity-100"
                                )}
                            >
                                {/* Icon Container */}
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center mb-1 shadow-inner",
                                    isUnlocked ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400" : "bg-gray-800 text-gray-600"
                                )}>
                                    {isUnlocked ? <Award className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                                </div>

                                {/* Content */}
                                <div className="space-y-1">
                                    <h3 className={cn("font-bold text-base", isUnlocked ? "text-white" : "text-gray-400")}>
                                        {achievement.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-2 h-8">
                                        {achievement.description}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="mt-auto pt-3 w-full border-t border-gray-800/50 flex justify-between items-center text-xs">
                                    <span className={cn("font-mono font-bold", isUnlocked ? "text-yellow-500" : "text-gray-600")}>
                                        +{achievement.xp_reward} XP
                                    </span>
                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider", isUnlocked ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-500")}>
                                        {isUnlocked ? "Unlocked" : "Locked"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;