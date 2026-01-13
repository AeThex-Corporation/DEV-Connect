import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ThumbsUp,
  Users,
  Star,
  CheckCircle
} from "lucide-react";

export default function SkillEndorsements({ userId, skills, onEndorsementsChange }) {
  const [endorsements, setEndorsements] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [endorsing, setEndorsing] = useState(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [user, allEndorsements] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.Endorsement.filter({ endorsee_id: userId })
      ]);
      
      setCurrentUser(user);
      setEndorsements(allEndorsements);
    } catch (error) {
      console.error('Error loading endorsements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndorse = async (skillName) => {
    if (!currentUser) {
      alert('Please log in to endorse skills');
      return;
    }

    if (currentUser.id === userId) {
      alert('You cannot endorse your own skills');
      return;
    }

    setEndorsing(skillName);
    try {
      // Check if already endorsed
      const existing = endorsements.find(
        e => e.skill_name === skillName && e.endorser_id === currentUser.id
      );

      if (existing) {
        // Remove endorsement
        await base44.entities.Endorsement.delete(existing.id);
        await loadData();
        
        if (onEndorsementsChange) {
          onEndorsementsChange();
        }
      } else {
        // Add endorsement
        await base44.entities.Endorsement.create({
          endorser_id: currentUser.id,
          endorsee_id: userId,
          skill_name: skillName,
          relationship: 'other',
          endorsement_strength: 'basic'
        });

        await loadData();
        
        // Create notification for the endorsed user
        await base44.entities.Notification.create({
          user_id: userId,
          type: 'message',
          title: '👍 New Skill Endorsement!',
          message: `${currentUser.full_name} endorsed your ${skillName} skill`,
          link: `/profile?id=${userId}`
        });

        if (onEndorsementsChange) {
          onEndorsementsChange();
        }
      }
    } catch (error) {
      console.error('Error endorsing skill:', error);
      alert('Failed to endorse skill. Please try again.');
    } finally {
      setEndorsing(null);
    }
  };

  const getEndorsementCount = (skillName) => {
    return endorsements.filter(e => e.skill_name === skillName).length;
  };

  const hasEndorsed = (skillName) => {
    if (!currentUser) return false;
    return endorsements.some(
      e => e.skill_name === skillName && e.endorser_id === currentUser.id
    );
  };

  const getTopEndorsers = (skillName) => {
    return endorsements
      .filter(e => e.skill_name === skillName)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!skills || skills.length === 0) {
    return <p className="text-gray-400">No skills added</p>;
  }

  return (
    <div className="space-y-3">
      {skills.map(skill => {
        const endorsementCount = getEndorsementCount(skill);
        const endorsed = hasEndorsed(skill);
        const topEndorsers = getTopEndorsers(skill);
        
        return (
          <Card key={skill} className="glass-card border-0 bg-white/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {skill}
                  </Badge>
                  
                  {endorsementCount > 0 && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Users className="w-3 h-3" />
                      <span>{endorsementCount} endorsement{endorsementCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {currentUser && currentUser.id !== userId && (
                  <Button
                    size="sm"
                    onClick={() => handleEndorse(skill)}
                    disabled={endorsing === skill}
                    className={endorsed 
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0" 
                      : "glass-card border-0 text-white hover:bg-white/5"
                    }
                  >
                    {endorsing === skill ? (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        {endorsed ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <ThumbsUp className="w-3 h-3 mr-1" />
                        )}
                        {endorsed ? 'Endorsed' : 'Endorse'}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Show top endorsers */}
              {topEndorsers.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2">
                    {topEndorsers.map((endorsement, i) => (
                      <div 
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-[#0a0a0a] flex items-center justify-center"
                        title={`Endorsed by user ${endorsement.endorser_id}`}
                      >
                        <ThumbsUp className="w-3 h-3 text-white" />
                      </div>
                    ))}
                  </div>
                  {endorsementCount > 3 && (
                    <span className="text-gray-500 text-xs">+{endorsementCount - 3} more</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {endorsements.length > 0 && (
        <div className="glass-card rounded-lg p-4 bg-indigo-500/5 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <p className="text-white font-semibold text-sm">Total Endorsements</p>
          </div>
          <p className="text-gray-400 text-sm">
            Received {endorsements.length} endorsement{endorsements.length !== 1 ? 's' : ''} across all skills
          </p>
        </div>
      )}
    </div>
  );
}