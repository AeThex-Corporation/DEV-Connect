import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, ShieldCheck, Code2, Terminal, Database, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/db';

const VerifyGatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    githubUrl: '',
    portfolioUrl: '',
    linkedinUrl: '',
    bio: '',
    experience: '',
    rate: '',
    availability: 'Full-time',
    skills: []
  });

  const [quizAnswers, setQuizAnswers] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleQuizAnswer = (questionId, answer, questionText) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: { id: questionId, answer, question: questionText }
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to submit your verification.",
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    
    const responseList = Object.values(quizAnswers);
    
    const result = await api.createContractorApplication(user.id, formData, responseList);

    setLoading(false);

    if (result.success) {
      toast({
        title: "Application Submitted!",
        description: "We've received your verification request. We'll be in touch shortly.",
      });
      navigate('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: result.error.message || "Something went wrong. Please try again.",
      });
    }
  };

  const steps = [
    {
      title: "Professional Profile",
      description: "Let's start with the basics. Where can we see your work?",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">GitHub URL</label>
              <Input 
                name="githubUrl" 
                placeholder="https://github.com/username" 
                value={formData.githubUrl}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Portfolio / Personal Site</label>
              <Input 
                name="portfolioUrl" 
                placeholder="https://yourwebsite.com" 
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">LinkedIn (Optional)</label>
            <Input 
              name="linkedinUrl" 
              placeholder="https://linkedin.com/in/username" 
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Professional Bio</label>
            <Textarea 
              name="bio" 
              placeholder="Tell us about your background, what you love to build, and your preferred stack." 
              value={formData.bio}
              onChange={handleInputChange}
              className="bg-white/5 border-white/10 min-h-[100px]"
            />
          </div>
        </div>
      )
    },
    {
      title: "Skills & Experience",
      description: "What is your technical expertise?",
      content: (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-3 block">Primary Skills</label>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'Python', 'TypeScript', 'Rust', 'Go', 'Solidity', 'AWS', 'Supabase', 'Design'].map(skill => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    formData.skills.includes(skill)
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Years of Experience</label>
              <Input 
                name="experience" 
                placeholder="e.g., 3 years" 
                value={formData.experience}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Target Hourly Rate ($USD)</label>
              <Input 
                name="rate" 
                placeholder="e.g., 60-80" 
                value={formData.rate}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Technical Verification",
      description: "A quick check to verify your problem-solving approach.",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="font-medium text-white mb-3">1. You encounter a race condition in a React `useEffect` fetching data. How do you fix it?</p>
              <Textarea 
                placeholder="Explain your approach briefly..." 
                className="bg-black/20 border-white/10 text-sm"
                onChange={(e) => handleQuizAnswer('q1', e.target.value, 'Race condition in useEffect')}
              />
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="font-medium text-white mb-3">2. Explain how you would secure a public API endpoint in a serverless environment.</p>
              <Textarea 
                placeholder="Explain your approach briefly..." 
                className="bg-black/20 border-white/10 text-sm"
                onChange={(e) => handleQuizAnswer('q2', e.target.value, 'Securing serverless API')}
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <Helmet>
        <title>Verify Identity | Devconnect</title>
      </Helmet>

      <div className="min-h-screen pt-24 px-4 pb-12 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <div className="text-center mb-10">
            <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 text-blue-400 mb-4 ring-1 ring-blue-500/50">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Identity Verification</h1>
            <p className="text-gray-400">Join the verified talent pool to unlock paid opportunities.</p>
          </div>

          <div className="bg-glass border-glow rounded-2xl p-8 md:p-10 relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
              <motion.div 
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>

            <div className="mb-8 mt-2">
              <h2 className="text-2xl font-bold text-white">{steps[step].title}</h2>
              <p className="text-gray-400">{steps[step].description}</p>
            </div>

            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {steps[step].content}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between pt-8 border-t border-white/10 mt-8">
              <Button
                variant="ghost"
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-gray-400 hover:text-white"
              >
                Back
              </Button>
              
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(s => s + 1)} className="bg-white text-black hover:bg-gray-200">
                  Next Step <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                >
                  {loading ? "Submitting..." : "Complete Verification"}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
             <div className="flex flex-col items-center gap-2">
               <Code2 className="w-5 h-5 text-gray-400" />
               <span>Skill Assessment</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <Terminal className="w-5 h-5 text-gray-400" />
               <span>Code Review</span>
             </div>
             <div className="flex flex-col items-center gap-2">
               <Database className="w-5 h-5 text-gray-400" />
               <span>Background Check</span>
             </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default VerifyGatePage;