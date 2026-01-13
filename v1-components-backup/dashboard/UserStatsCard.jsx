import React from "react";
import { createPageUrl } from "@/utils";
import { getLevelInfo } from "@/components/utils/helpers";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy } from "lucide-react";

export default function UserStatsCard({ user, achievements = [] }) {
  const levelInfo = getLevelInfo(user?.xp_points || 0);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="gradient-text">{user?.full_name}</span>
            </h1>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              <Trophy className="w-3 h-3 mr-1" />
              Level {levelInfo.level}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm">
            {user?.xp_points || 0} XP • {user?.completed_projects || 0} projects completed
          </p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="glass-card rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">Level Progress</span>
          <span className="text-gray-400 text-xs">
            {user?.xp_points || 0} / {levelInfo.nextLevelXP} XP
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${levelInfo.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Recent Badges */}
      {achievements.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-white text-sm font-medium">Recent Achievements:</span>
          {achievements.slice(-3).map(achievement => (
            <Badge 
              key={achievement.id}
              className={`${
                achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              } border-0`}
            >
              {achievement.icon} {achievement.title}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}