import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Rocket,
  Target,
  Users,
  Briefcase,
  TrendingUp,
  Gift,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Welcome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      // Redirect to home if not authenticated
      window.location.href = createPageUrl("home");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Target,
      title: "Browse Jobs",
      description: "Find your perfect project",
      action: () => window.location.href = createPageUrl("Jobs"),
      color: "indigo"
    },
    {
      icon: Users,
      title: "Complete Profile",
      description: "Stand out to employers",
      action: () => window.location.href = createPageUrl("Profile"),
      color: "purple"
    },
    {
      icon: Briefcase,
      title: "View Dashboard",
      description: "See your personalized feed",
      action: () => window.location.href = createPageUrl("Dashboard"),
      color: "blue"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Success Banner */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="gradient-text">Dev-Link</span>! 🎉
          </h1>
          
          <p className="text-xl text-gray-400 mb-6">
            {user?.full_name}, your profile is all set up!
          </p>

          {/* Rewards Earned */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Card className="glass-card border-0 inline-block">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">+100 XP</p>
                  <p className="text-gray-400 text-xs">Welcome Bonus</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 inline-block">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Early Adopter</p>
                  <p className="text-gray-400 text-xs">Badge Unlocked</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            What would you like to do first?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <Card
                key={i}
                className="glass-card border-0 card-hover cursor-pointer"
                onClick={action.action}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 bg-${action.color}-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <action.icon className={`w-7 h-7 text-${action.color}-400`} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {action.description}
                  </p>
                  <Button size="sm" className="btn-primary text-white w-full">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <Card className="glass-card border-0 mb-8">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-400" />
              Next Steps to Boost Your Profile
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 glass-card rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Profile Created ✓</p>
                  <p className="text-gray-400 text-xs">You earned 100 XP</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 glass-card rounded-lg opacity-70">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Add Portfolio Projects</p>
                  <p className="text-gray-400 text-xs">Earn 50 XP per project</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 glass-card rounded-lg opacity-70">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Complete a Skill Assessment</p>
                  <p className="text-gray-400 text-xs">Get verified and earn 200 XP</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 glass-card rounded-lg opacity-70">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Apply to Your First Job</p>
                  <p className="text-gray-400 text-xs">Start your journey and earn 75 XP</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => window.location.href = createPageUrl("Dashboard")}
            size="lg"
            className="btn-primary text-white text-lg px-8 py-6"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
          <p className="text-gray-500 text-sm mt-4">
            You can always return to your dashboard from the navigation menu
          </p>
        </div>
      </div>
    </div>
  );
}