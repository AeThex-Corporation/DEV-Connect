
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  Code,
  Briefcase,
  Target,
  Rocket,
  Star
} from "lucide-react";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    developer_roles: [],
    skills: [],
    experience_level: "Intermediate",
    bio: "",
    location: "",
    payment_preferences: [],
    portfolio_links: {},
    work_status: "Open to Work"
  });

  const roles = ["Scripter", "Builder", "UI/UX Designer", "3D Modeler", "Sound Designer", "Game Designer", "Artist", "Animator"];
  const paymentTypes = ["Robux", "USD", "Percentage", "Fixed Price", "Rev-Share"];
  const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const popularSkills = [
    "Lua", "DataStore2", "ProfileService", "RemoteEvents", "ModuleScripts",
    "Blender", "3D Modeling", "Low Poly", "Texturing", "Rigging",
    "UI Design", "Figma", "Photoshop", "Color Theory", "Typography",
    "Building", "Terrain", "Lighting", "Level Design", "Studio"
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin(createPageUrl("Onboarding"));
        return;
      }

      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check if user already completed onboarding
      if (currentUser.developer_roles?.length > 0) {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const toggleRole = (role) => {
    const roles = profileData.developer_roles || [];
    if (roles.includes(role)) {
      setProfileData({
        ...profileData,
        developer_roles: roles.filter(r => r !== role)
      });
    } else {
      setProfileData({
        ...profileData,
        developer_roles: [...roles, role]
      });
    }
  };

  const toggleSkill = (skill) => {
    const skills = profileData.skills || [];
    if (skills.includes(skill)) {
      setProfileData({
        ...profileData,
        skills: skills.filter(s => s !== skill)
      });
    } else {
      setProfileData({
        ...profileData,
        skills: [...skills, skill]
      });
    }
  };

  const togglePayment = (payment) => {
    const payments = profileData.payment_preferences || [];
    if (payments.includes(payment)) {
      setProfileData({
        ...profileData,
        payment_preferences: payments.filter(p => p !== payment)
      });
    } else {
      setProfileData({
        ...profileData,
        payment_preferences: [...payments, payment]
      });
    }
  };

  const handleComplete = async () => {
    if (profileData.developer_roles.length === 0) {
      alert('Please select at least one role');
      return;
    }

    setSaving(true);
    try {
      await base44.auth.updateMe({
        ...profileData,
        xp_points: 100, // Welcome bonus
        badges: ['early_adopter'],
        last_active: new Date().toISOString()
      });

      // Create welcome notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🎉 Welcome to RobloxDev Hub!',
        message: 'Your profile is set up! Earned 100 XP and the Early Adopter badge. Start browsing jobs now!',
        link: createPageUrl('Dashboard')
      });

      navigate(createPageUrl("Welcome"));
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4 sm:px-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Step {step} of {totalSteps}
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-2">
            Let's Build Your <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-gray-400">This will only take 2 minutes</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-8">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Step Content */}
        <Card className="glass-card border-0 mb-8">
          <CardContent className="p-8">
            {/* Step 1: Roles */}
            {step === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Code className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">What do you do?</h2>
                    <p className="text-gray-400 text-sm">Select all that apply</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {roles.map(role => (
                    <Button
                      key={role}
                      onClick={() => toggleRole(role)}
                      variant={profileData.developer_roles?.includes(role) ? "default" : "outline"}
                      className={profileData.developer_roles?.includes(role)
                        ? "btn-primary text-white justify-start"
                        : "glass-card border-white/20 text-white hover:bg-white/5 justify-start"
                      }
                    >
                      {profileData.developer_roles?.includes(role) && (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {role}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Skills */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Skills</h2>
                    <p className="text-gray-400 text-sm">Pick your top skills</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {popularSkills.map(skill => (
                    <Button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      variant="outline"
                      size="sm"
                      className={profileData.skills?.includes(skill)
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        : "glass-card border-white/20 text-white hover:bg-white/5"
                      }
                    >
                      {profileData.skills?.includes(skill) && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {skill}
                    </Button>
                  ))}
                </div>

                <p className="text-gray-500 text-xs mt-4">
                  Selected: {profileData.skills?.length || 0} skills
                </p>
              </div>
            )}

            {/* Step 3: Experience */}
            {step === 3 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Experience Level</h2>
                    <p className="text-gray-400 text-sm">How would you describe yourself?</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {experienceLevels.map(level => (
                    <Button
                      key={level}
                      onClick={() => setProfileData({ ...profileData, experience_level: level })}
                      variant="outline"
                      className={`w-full justify-start text-left ${
                        profileData.experience_level === level
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "glass-card border-white/20 text-white hover:bg-white/5"
                      }`}
                    >
                      {profileData.experience_level === level && (
                        <CheckCircle className="w-5 h-5 mr-3" />
                      )}
                      <div>
                        <p className="font-semibold">{level}</p>
                        <p className="text-xs opacity-70">
                          {level === 'Beginner' && 'Just starting out in Roblox development'}
                          {level === 'Intermediate' && '1-3 years of experience'}
                          {level === 'Advanced' && '3-5 years, worked on multiple projects'}
                          {level === 'Expert' && '5+ years, industry leader'}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Bio & Details */}
            {step === 4 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Tell Us About You</h2>
                    <p className="text-gray-400 text-sm">Help employers find you</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Bio</label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      placeholder="Tell employers about your experience, projects you've worked on, and what makes you unique..."
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-32"
                    />
                  </div>

                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Location / Timezone</label>
                    <Input
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="e.g., New York, USA (EST) or Remote"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Payment Preferences */}
            {step === 5 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Payment Preferences</h2>
                    <p className="text-gray-400 text-sm">How do you prefer to get paid?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {paymentTypes.map(payment => (
                    <Button
                      key={payment}
                      onClick={() => togglePayment(payment)}
                      variant={profileData.payment_preferences?.includes(payment) ? "default" : "outline"}
                      className={profileData.payment_preferences?.includes(payment)
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        : "glass-card border-white/20 text-white hover:bg-white/5"
                      }
                    >
                      {profileData.payment_preferences?.includes(payment) && (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {payment}
                    </Button>
                  ))}
                </div>

                <div className="mt-6 glass-card rounded-lg p-4 bg-green-500/5">
                  <p className="text-green-400 text-sm">
                    💰 You'll earn <strong>100 XP</strong> and the <strong>Early Adopter badge</strong> for completing your profile!
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            variant="outline"
            className="glass-card border-white/20 text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && profileData.developer_roles?.length === 0}
              className="btn-primary text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={saving || profileData.developer_roles?.length === 0}
              className="btn-primary text-white"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
