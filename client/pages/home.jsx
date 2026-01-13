import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Code,
  Users,
  Briefcase,
  Shield,
  TrendingUp,
  Target,
  Star,
  CheckCircle,
  ArrowRight,
  Crown,
  Eye,
  Zap,
  Trophy
} from "lucide-react";
import Footer from "../components/Footer";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVisits: 0,
    verifiedDevelopers: 0,
    legendDevelopers: 0,
    diamondDevelopers: 0,
    waitlistCount: 0
  });

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get all verified users
      const verifiedUsers = await base44.entities.User.filter({
        roblox_verified: true
      });

      // Calculate total visits from verified users
      let totalVisits = 0;
      let legendCount = 0;
      let diamondCount = 0;

      verifiedUsers.forEach(user => {
        if (user.roblox_stats_summary?.total_visits) {
          totalVisits += user.roblox_stats_summary.total_visits;
        }
        if (user.roblox_reputation_tier === 'Legend') legendCount++;
        if (user.roblox_reputation_tier === 'Diamond') diamondCount++;
      });

      // Get waitlist count
      const waitlistSignups = await base44.entities.WaitlistSignup.list();

      setStats({
        totalVisits,
        verifiedDevelopers: verifiedUsers.length,
        legendDevelopers: legendCount,
        diamondDevelopers: diamondCount,
        waitlistCount: waitlistSignups.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const features = [
    { icon: Briefcase, title: "Job Board", description: "Browse and apply for Roblox development opportunities" },
    { icon: Users, title: "Developer Profiles", description: "Showcase your portfolio and skills" },
    { icon: Shield, title: "Verified Profiles", description: "Build trust with verified developer profiles" },
    { icon: TrendingUp, title: "Reputation System", description: "Build your reputation based on real Roblox game stats" },
    { icon: Target, title: "AI Job Matching", description: "Get matched with perfect opportunities using AI" },
    { icon: Star, title: "Teams & Collaboration", description: "Form teams and collaborate on projects" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        .glass-card { background-color: rgba(255, 255, 255, 0.05); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .gradient-text { background-image: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .card-hover { transition: all 0.2s ease; }
        .card-hover:hover { transform: translateY(-5px); background-color: rgba(255, 255, 255, 0.1); }
        @keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.4; } }
        .animate-pulse { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 px-4 py-2 text-sm mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              🚀 Launching Q1 2026
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              The Job Board for <span className="gradient-text">Roblox Developers</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Connect with top studios and talented developers. Build your reputation based on real Roblox game stats.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {isAuthenticated ? (
                <Button
                  onClick={() => window.location.href = createPageUrl("Dashboard")}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg px-8 py-6"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => window.location.href = createPageUrl("Waitlist")}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg px-8 py-6"
                  >
                    Join Waitlist
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                    variant="outline"
                    className="glass-card border-white/20 text-white hover:bg-white/5 text-lg px-8 py-6"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            <Card className="glass-card border-0 card-hover">
              <CardContent className="p-6 text-center">
                <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{formatNumber(stats.totalVisits)}</p>
                <p className="text-gray-400 text-sm">Total Game Visits</p>
                <p className="text-gray-500 text-xs mt-1">from verified devs</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 card-hover">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stats.verifiedDevelopers}</p>
                <p className="text-gray-400 text-sm">Verified Devs</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 card-hover">
              <CardContent className="p-6 text-center">
                <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stats.legendDevelopers}</p>
                <p className="text-gray-400 text-sm">Legend Tier</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 card-hover">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stats.diamondDevelopers}</p>
                <p className="text-gray-400 text-sm">Diamond Tier</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 card-hover">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stats.waitlistCount}</p>
                <p className="text-gray-400 text-sm">On Waitlist</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why <span className="gradient-text">Devconnect</span>?
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to find jobs or hire developers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="glass-card border-0 card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reputation System Showcase */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Build Your <span className="gradient-text">Reputation</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            Your Roblox game stats automatically build your reputation score
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card border-0 border-l-4 border-yellow-500">
              <CardContent className="p-6 text-center">
                <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Legend</h3>
                <p className="text-gray-400 text-sm">800+ Reputation Score</p>
                <p className="text-gray-500 text-xs mt-2">Elite developers with proven track records</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 border-l-4 border-cyan-500">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Diamond</h3>
                <p className="text-gray-400 text-sm">650+ Reputation Score</p>
                <p className="text-gray-500 text-xs mt-2">Top-tier developers with multiple hits</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 border-l-4 border-gray-300">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Platinum+</h3>
                <p className="text-gray-400 text-sm">500+ Reputation Score</p>
                <p className="text-gray-500 text-xs mt-2">Rising stars with successful games</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <CardContent className="p-12 text-center">
              <Zap className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join {stats.waitlistCount > 0 ? `${stats.waitlistCount}+ developers` : 'developers'} preparing for launch
              </p>
              {!isAuthenticated && (
                <Button
                  onClick={() => window.location.href = createPageUrl("Waitlist")}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg px-8 py-6"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Join the Waitlist
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}