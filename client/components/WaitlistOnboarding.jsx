import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  CheckCircle,
  ArrowRight,
  Target,
  Share2,
  Rocket,
  Crown,
  X,
  Trophy,
  Users,
  Briefcase
} from 'lucide-react';

export default function WaitlistOnboarding({ onComplete, mySignup }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const steps = [
    {
      title: "Welcome to Devconnect! 🎉",
      description: "You're on the waitlist for the future of Roblox development",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Devconnect is the premier platform connecting Roblox developers and studios. Here's what makes us special:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold text-sm">AI Job Matching</span>
              </div>
              <p className="text-gray-400 text-xs">Get matched with perfect opportunities automatically</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold text-sm">Skill Verification</span>
              </div>
              <p className="text-gray-400 text-xs">Prove your expertise with certifications</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-white font-semibold text-sm">Real-Time Collaboration</span>
              </div>
              <p className="text-gray-400 text-xs">Code together with built-in tools</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold text-sm">Secure Escrow</span>
              </div>
              <p className="text-gray-400 text-xs">Get paid safely with milestone protection</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Queue Position",
      description: "You're in line - here's how to move up faster",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-6 text-center border border-green-500/20">
            <p className="text-gray-300 mb-2">Current Position</p>
            <p className="text-5xl font-bold text-white mb-3">#{mySignup?.position_in_queue || '?'}</p>
            <Progress 
              value={Math.max(0, 100 - ((mySignup?.position_in_queue || 0) / 100) * 100)} 
              className="h-2"
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-400" />
              3 Ways to Skip the Line:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-xs">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Complete Missions</p>
                  <p className="text-gray-400 text-xs">Each mission = +5 spots forward</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-bold text-xs">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Refer Friends</p>
                  <p className="text-gray-400 text-xs">Each referral = +10 spots forward</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400 font-bold text-xs">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Join Discord Community</p>
                  <p className="text-gray-400 text-xs">Connect early and get insider updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Complete Missions",
      description: "Easy tasks that boost your position",
      icon: Trophy,
      content: (
        <div className="space-y-3">
          <p className="text-gray-300 text-sm mb-4">
            Check the <strong className="text-white">"Missions"</strong> tab to complete these quick tasks. Each one moves you up 5 spots!
          </p>
          
          <div className="space-y-2">
            {[
              { icon: '💬', title: 'Join Discord Server', reward: '+5 spots', time: '1 min' },
              { icon: '🐦', title: 'Follow on Twitter', reward: '+5 spots', time: '30 sec' },
              { icon: '🎥', title: 'Watch Demo Video', reward: '+5 spots', time: '3 min' },
              { icon: '✍️', title: 'Complete Profile Info', reward: '+5 spots', time: '2 min' }
            ].map((mission, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mission.icon}</span>
                  <div>
                    <p className="text-white font-medium text-sm">{mission.title}</p>
                    <p className="text-gray-400 text-xs">{mission.time}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-0">
                  {mission.reward}
                </Badge>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg p-4 border border-indigo-500/20">
            <p className="text-indigo-400 text-xs font-semibold mb-1">💡 Pro Tip</p>
            <p className="text-gray-300 text-xs">
              Complete all 4 missions and you'll jump <strong className="text-white">20 spots</strong> in the queue!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Share & Earn",
      description: "Your referral link is your secret weapon",
      icon: Share2,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Check the <strong className="text-white">"Referrals"</strong> tab to get your unique referral link.
          </p>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-6 text-center border border-green-500/20">
            <p className="text-gray-300 text-sm mb-2">Each friend who joins:</p>
            <p className="text-4xl font-bold text-green-400 mb-3">+10 Spots</p>
            <p className="text-gray-400 text-xs">Share on Discord, Twitter, or directly copy your link</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">Best Places to Share:</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Roblox development Discord servers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Twitter Roblox dev community</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">DevForum (allowed in appropriate threads)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Your Roblox game group</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Premium Features Preview",
      description: "Get excited about what's coming",
      icon: Crown,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-sm mb-4">
            When we launch, you'll have access to premium features that will supercharge your career:
          </p>

          <div className="space-y-3">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-4 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-indigo-400" />
                <h4 className="text-white font-semibold">Devconnect Pro - $9.99/mo</h4>
              </div>
              <ul className="space-y-1 text-xs text-gray-300 ml-7">
                <li>• Unlimited job applications</li>
                <li>• AI job matching</li>
                <li>• 10 portfolio projects</li>
                <li>• Verified developer badge</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-purple-400" />
                <h4 className="text-white font-semibold">Premium - $29.99/mo</h4>
              </div>
              <ul className="space-y-1 text-xs text-gray-300 ml-7">
                <li>• Everything in Pro</li>
                <li>• Monthly 1-on-1 strategy call</li>
                <li>• Advanced profile analytics</li>
                <li>• Featured in search results</li>
                <li>• Custom profile URL</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg p-4 border border-yellow-500/20">
            <p className="text-yellow-400 text-xs font-semibold mb-1">🎁 Early Access Bonus</p>
            <p className="text-gray-300 text-xs">
              Waitlist members get <strong className="text-white">14-day free trial</strong> of Premium when we launch!
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setShowOnboarding(false);
    if (onComplete) onComplete();
  };

  if (!showOnboarding) return null;

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="max-w-2xl w-full bg-[#0a0a0a] border-white/20 shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button
              onClick={handleComplete}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-1 mb-6" />

          {/* Content */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <StepIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{currentStepData.title}</h2>
            <p className="text-gray-400 text-sm">{currentStepData.description}</p>
          </div>

          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              variant="ghost"
              className="text-gray-400"
            >
              Back
            </Button>

            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep
                      ? 'bg-indigo-500 w-6'
                      : i < currentStep
                      ? 'bg-green-500'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}