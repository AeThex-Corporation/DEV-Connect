import React from "react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "../components/Footer";
import {
  Rocket,
  Users,
  Target,
  Heart,
  Sparkles,
  Code
} from "lucide-react";

export default function About() {
  const team = [
    {
      name: "MrPiglr",
      role: "Founder & CEO",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MrPiglr",
      bio: "Founder with 14+ years of Roblox development experience"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        .glass-card {
          background-color: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gradient-text {
          background-image: linear-gradient(to right, #6366f1, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .card-hover {
          transition: all 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d9d1f385dfdd1e5c5c92d0/c5979f609_Gemini_Generated_Image_q227rdq227rdq2271.png"
                alt="Devconnect Logo"
                className="w-10 h-10"
              />
              <span className="text-white font-bold text-xl">Devconnect</span>
            </div>
            <Button onClick={() => window.location.href = createPageUrl("Waitlist")} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              Join Waitlist
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="gradient-text">Devconnect</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            We're building the future of Roblox development by connecting talented creators with amazing opportunities.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 text-lg mb-4">
                To empower Roblox developers and studios by creating the most comprehensive platform for collaboration, opportunity, and growth.
              </p>
              <p className="text-gray-400 text-lg">
                We believe every developer deserves access to tools and opportunities that help them succeed in the Roblox ecosystem.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-white font-semibold text-xl mb-6 text-center">What We're Building</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Job Marketplace</p>
                    <p className="text-gray-400 text-sm">Connect developers with Roblox studios and projects</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Collaboration Tools</p>
                    <p className="text-gray-400 text-sm">Real-time tools for team development</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Skill Development</p>
                    <p className="text-gray-400 text-sm">Certifications, resources, and mentorship</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">AI-Powered Matching</p>
                    <p className="text-gray-400 text-sm">Smart job and talent recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our <span className="gradient-text">Values</span>
            </h2>
            <p className="text-gray-400 text-lg">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card border-0 p-8 card-hover">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Community First</h3>
              <p className="text-gray-400">
                We build for developers, by developers. Your feedback shapes our platform.
              </p>
            </Card>

            <Card className="glass-card border-0 p-8 card-hover">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Passion for Quality</h3>
              <p className="text-gray-400">
                We're committed to excellence in every feature and every interaction.
              </p>
            </Card>

            <Card className="glass-card border-0 p-8 card-hover">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">Innovation</h3>
              <p className="text-gray-400">
                We constantly push boundaries to bring you cutting-edge tools and features.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Meet the <span className="gradient-text">Founder</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Building the future of Roblox development
            </p>
          </div>

          <div className="flex justify-center">
            <Card className="glass-card border-0 p-6 text-center card-hover max-w-xs">
              <img 
                src={team[0].avatar} 
                alt={team[0].name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-white font-semibold text-lg mb-1">{team[0].name}</h3>
              <p className="text-indigo-400 text-sm mb-3">{team[0].role}</p>
              <p className="text-gray-400 text-sm">{team[0].bio}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Join Us on This Journey
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Be part of the platform that's revolutionizing Roblox development
              </p>
              <Button 
                onClick={() => window.location.href = createPageUrl("Waitlist")}
                size="lg" 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg px-8 py-6"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Join the Waitlist
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer isAuthenticated={false} />
    </div>
  );
}