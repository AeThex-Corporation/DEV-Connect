import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Clock,
  Target,
  CheckCircle,
  Play,
  Star,
  TrendingUp,
  Download,
  Share2
} from "lucide-react";

export default function Certifications() {
  const [user, setUser] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const skillCatalog = [
    {
      skill: "Lua Scripting",
      levels: ["beginner", "intermediate", "advanced", "expert"],
      duration: 45,
      questions: 30,
      description: "Master Lua programming for Roblox development"
    },
    {
      skill: "UI/UX Design",
      levels: ["beginner", "intermediate", "advanced"],
      duration: 30,
      questions: 25,
      description: "Create beautiful and intuitive user interfaces"
    },
    {
      skill: "3D Modeling",
      levels: ["beginner", "intermediate", "advanced"],
      duration: 40,
      questions: 20,
      description: "Build 3D models for Roblox games"
    },
    {
      skill: "Game Design",
      levels: ["beginner", "intermediate", "advanced", "expert"],
      duration: 35,
      questions: 25,
      description: "Design engaging game mechanics and experiences"
    },
    {
      skill: "DataStore Management",
      levels: ["intermediate", "advanced", "expert"],
      duration: 30,
      questions: 20,
      description: "Master data persistence and management"
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const userCerts = await base44.entities.Certification.filter({
        user_id: currentUser.id
      });
      setCertifications(userCerts);

      // Filter available skills (not yet certified)
      const certifiedSkills = userCerts.map(c => `${c.skill_name}_${c.certification_level}`);
      const available = skillCatalog.filter(skill =>
        skill.levels.some(level =>
          !certifiedSkills.includes(`${skill.skill}_${level}`)
        )
      );
      setAvailableSkills(available);
    } catch (error) {
      console.error('Error loading certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (skill, level) => {
    // Navigate to assessment page
    window.location.href = `${createPageUrl('TakeAssessment')}?skill=${encodeURIComponent(skill)}&level=${level}`;
  };

  const getLevelColor = (level) => {
    const colors = {
      'beginner': 'bg-green-500/20 text-green-400 border-green-500/30',
      'intermediate': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'advanced': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'expert': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[level] || colors['beginner'];
  };

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">Skill Certifications</h1>
        <p className="text-gray-400 text-sm">
          Earn verified certifications to showcase your expertise
        </p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="available">
            <Target className="w-4 h-4 mr-2" />
            Available ({availableSkills.length})
          </TabsTrigger>
          <TabsTrigger value="earned">
            <Award className="w-4 h-4 mr-2" />
            Earned ({certifications.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Certifications */}
        <TabsContent value="available" className="space-y-4">
          {availableSkills.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
                <p className="text-gray-400">
                  You've earned certifications in all available skills
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {availableSkills.map((skillInfo, i) => (
                <Card key={i} className="glass-card border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-lg mb-2">{skillInfo.skill}</CardTitle>
                        <p className="text-gray-400 text-sm">{skillInfo.description}</p>
                      </div>
                      <Award className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {skillInfo.duration} min
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Target className="w-3 h-3 mr-1" />
                        {skillInfo.questions} questions
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-400 text-xs font-medium mb-2">Available Levels:</p>
                      <div className="space-y-2">
                        {skillInfo.levels.map(level => {
                          const isCertified = certifications.some(c =>
                            c.skill_name === skillInfo.skill && c.certification_level === level
                          );
                          
                          return (
                            <div key={level} className="flex items-center justify-between p-2 glass-card rounded-lg">
                              <div className="flex items-center gap-2">
                                <Badge className={getLevelColor(level)}>
                                  {level}
                                </Badge>
                                {isCertified && (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                )}
                              </div>
                              {!isCertified && (
                                <Button
                                  size="sm"
                                  onClick={() => startAssessment(skillInfo.skill, level)}
                                  className="btn-primary text-white"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Start
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Earned Certifications */}
        <TabsContent value="earned" className="space-y-4">
          {certifications.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Certifications Yet</h3>
                <p className="text-gray-400 mb-6">
                  Start earning certifications to showcase your skills
                </p>
                <Button
                  onClick={() => document.querySelector('[value="available"]').click()}
                  className="btn-primary text-white"
                >
                  Browse Available Certifications
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {certifications.map((cert) => (
                <Card key={cert.id} className="glass-card border-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{cert.skill_name}</h3>
                          <Badge className={getLevelColor(cert.certification_level)}>
                            {cert.certification_level}
                          </Badge>
                        </div>
                      </div>
                      {cert.verified && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Score</span>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= Math.round(cert.score / 20)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-white font-semibold">{cert.score}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Percentile</span>
                        <div className="flex items-center gap-1 text-indigo-400">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-semibold">Top {100 - cert.percentile}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Issued</span>
                        <span className="text-white">
                          {new Date(cert.issued_date).toLocaleDateString()}
                        </span>
                      </div>

                      {cert.expiry_date && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Expires</span>
                          <span className={
                            new Date(cert.expiry_date) < new Date()
                              ? 'text-red-400'
                              : 'text-white'
                          }>
                            {new Date(cert.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                      {cert.certificate_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                          asChild
                        >
                          <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}