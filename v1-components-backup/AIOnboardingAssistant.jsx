import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Sparkles,
  ChevronRight,
  Target,
  Users,
  Briefcase,
  BookOpen,
  Award,
  MessageSquare
} from 'lucide-react';

export default function AIOnboardingAssistant({ user, onDismiss }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generatePersonalizedOnboarding();
    }
  }, [user]);

  const generatePersonalizedOnboarding = async () => {
    setLoading(true);
    try {
      const [portfolio, applications, jobs] = await Promise.all([
        base44.entities.Portfolio.filter({ user_id: user.id }),
        base44.entities.Application.filter({ applicant_id: user.id }),
        base44.entities.Job.filter({ status: 'Open' }, '-created_date', 10)
      ]);

      const isDeveloper = user.developer_roles?.length > 0;
      const isEmployer = user.role === 'admin' || user.company_name;

      const prompt = `You are an AI onboarding assistant. Create a personalized onboarding flow for this user.

USER PROFILE:
Name: ${user.full_name}
Email: ${user.email}
Type: ${isDeveloper ? 'Developer' : isEmployer ? 'Employer' : 'Mixed'}
Roles: ${user.developer_roles?.join(', ') || 'Not specified'}
Experience: ${user.experience_level || 'Not specified'}
XP: ${user.xp_points || 0}

CURRENT STATE:
- Portfolio Projects: ${portfolio.length}
- Applications Sent: ${applications.length}
- Profile Completion: ${user.bio ? 'Has bio' : 'No bio'}

PLATFORM CONTEXT:
- Available Jobs: ${jobs.length}

Create a 5-step onboarding flow that:
1. Introduces key platform features (AI Talent Scout, Project Generator, etc.)
2. Guides them to complete essential profile sections
3. Shows them how to ${isDeveloper ? 'find jobs' : 'post jobs and find developers'}
4. Encourages exploration of AI features
5. Helps them achieve their first success (application/hire)

Make it dynamic based on their role and current state.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  icon: {
                    type: "string",
                    enum: ["target", "users", "briefcase", "sparkles", "award", "book", "message"]
                  },
                  action_label: { type: "string" },
                  action_url: { type: "string" },
                  tips: {
                    type: "array",
                    items: { type: "string" }
                  },
                  why_important: { type: "string" },
                  estimated_time: { type: "string" }
                }
              }
            },
            welcome_message: { type: "string" },
            quick_wins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  xp_reward: { type: "number" }
                }
              }
            }
          }
        }
      });

      setTips(response.steps || []);
      
    } catch (error) {
      console.error('Error generating onboarding:', error);
      // Fallback to basic onboarding
      setTips([
        {
          step_number: 1,
          title: "Complete Your Profile",
          description: "Add your skills, bio, and portfolio to attract opportunities",
          icon: "users",
          action_label: "Go to Profile",
          action_url: "Profile",
          tips: ["Add at least 3 skills", "Write a compelling bio", "Upload portfolio projects"],
          why_important: "A complete profile gets 5x more views",
          estimated_time: "5 minutes"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      'target': Target,
      'users': Users,
      'briefcase': Briefcase,
      'sparkles': Sparkles,
      'award': Award,
      'book': BookOpen,
      'message': MessageSquare
    };
    return icons[iconName] || Target;
  };

  const handleNext = () => {
    if (currentStep < tips.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleAction = () => {
    const step = tips[currentStep];
    if (step.action_url) {
      window.location.href = createPageUrl(step.action_url);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    
    // Award XP for completing onboarding
    base44.auth.updateMe({
      xp_points: (user.xp_points || 0) + 100
    });
    
    if (onDismiss) onDismiss();
  };

  if (loading) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-96">
        <Card className="glass-card border-0 shadow-2xl">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-white text-sm">Personalizing your experience...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tips.length === 0) return null;

  const step = tips[currentStep];
  const Icon = getIcon(step.icon);
  const progress = ((currentStep + 1) / tips.length) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="glass-card border-0 shadow-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-t-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">AI Guide</span>
              </div>
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">
                Step {currentStep + 1} of {tips.length}
              </span>
              <Badge className="bg-white/20 text-white border-0 text-xs">
                {step.estimated_time}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-white/10">
            <div
              className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
            </div>

            {step.why_important && (
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 mb-4">
                <p className="text-blue-400 font-semibold text-xs mb-1">Why this matters:</p>
                <p className="text-gray-300 text-xs">{step.why_important}</p>
              </div>
            )}

            {step.tips && step.tips.length > 0 && (
              <div className="mb-4">
                <p className="text-white font-semibold text-sm mb-2">Quick Tips:</p>
                <ul className="space-y-1">
                  {step.tips.map((tip, i) => (
                    <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {step.action_url && (
                <Button
                  onClick={handleAction}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                >
                  {step.action_label}
                </Button>
              )}
              <Button
                onClick={handleNext}
                variant="outline"
                className={`${step.action_url ? '' : 'flex-1'} glass-card border-0 text-white hover:bg-white/5`}
              >
                {currentStep < tips.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  'Finish'
                )}
              </Button>
            </div>

            {/* Skip Option */}
            <button
              onClick={handleComplete}
              className="w-full text-center text-gray-500 text-xs mt-3 hover:text-gray-400 transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}