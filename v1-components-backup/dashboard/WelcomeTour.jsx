import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, TrendingUp, Brain, Rocket } from "lucide-react";

export default function WelcomeTour({ onDismiss }) {
  const features = [
    {
      icon: Target,
      title: "AI-Matched Jobs",
      description: "We've analyzed your profile and found jobs perfect for you"
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Level up by completing jobs, earning badges, and maintaining streaks"
    },
    {
      icon: Brain,
      title: "AI Career Coach",
      description: "Get personalized advice to advance your Roblox career"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="glass-card border-0 max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Welcome to Your Dashboard! 🎉
            </h2>
            <p className="text-gray-400">
              Here's a quick tour of what you can do
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {features.map((item, i) => (
              <div key={i} className="flex items-start gap-4 glass-card rounded-lg p-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={onDismiss} className="w-full btn-primary text-white">
            <Rocket className="w-4 h-4 mr-2" />
            Let's Get Started!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}