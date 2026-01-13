import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Users, Briefcase, GraduationCap, Building2, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  
  // Quiz Logic Flow:
  // Step 0: Intro -> Start
  // Step 1: "Are you looking for paid work?" (EARN)
  // Step 2: "Are you looking for education?" (LEARN)
  // Step 3: "Are you a business looking to hire?" (HIRE)
  // Result: Based on selection

  const handleQuizStart = () => {
    setQuizStarted(true);
    setQuizStep(1);
  };

  const handleAnswer = (answer) => {
    if (quizStep === 1) {
      if (answer === 'yes') {
        // Intent: EARN -> /verify
        navigate('/verify');
      } else {
        setQuizStep(2);
      }
    } else if (quizStep === 2) {
      if (answer === 'yes') {
        // Intent: LEARN -> /dashboard/foundation
        navigate('/dashboard/foundation');
      } else {
        setQuizStep(3);
      }
    } else if (quizStep === 3) {
      if (answer === 'yes') {
        // Intent: HIRE -> External (simulated)
        window.location.href = 'https://aethex.foundation';
      } else {
        // Fallback / Just Browsing
        navigate('/dashboard');
      }
    }
  };

  const questions = [
    {
      step: 1,
      icon: Briefcase,
      title: "Let's find your fit.",
      question: "Are you looking for paid work, contracts, or freelance opportunities?",
      yesLabel: "Yes, I want to earn",
      noLabel: "No, looking for something else"
    },
    {
      step: 2,
      icon: GraduationCap,
      title: "Knowledge is power.",
      question: "Are you here to learn, upskill, or join our University program?",
      yesLabel: "Yes, I want to learn",
      noLabel: "No, not right now"
    },
    {
      step: 3,
      icon: Building2,
      title: "Build with the best.",
      question: "Are you a business owner or recruiter looking to hire talent?",
      yesLabel: "Yes, I want to hire",
      noLabel: "No, just browsing"
    }
  ];

  const currentQuestion = questions.find(q => q.step === quizStep);

  return (
    <>
      <Helmet>
        <title>Devconnect | The Side-by-Side Network</title>
        <meta name="description" content="Join the Side-by-Side Network. Collaboration over competition. Solidarity in code. Find your path today." />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden flex flex-col">
        {/* HomePage now inherits its background from RootLayout */}
        
        <main className="flex-grow flex items-center justify-center px-6 py-12 relative">
          {/* Hero Content / Quiz Container */}
          <div className="w-full max-w-4xl mx-auto relative z-10">
            
            {!quizStarted ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass text-blue-400 text-sm font-medium mb-4 border-glow">
                  <Sparkles className="w-4 h-4" />
                  <span>The Side-by-Side Network</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight text-glow">
                  Collaboration Over <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Competition.</span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  We are a collective of developers, learners, and builders united by solidarity. 
                  Whether you're here to build your career, expand your mind, or grow your business—we stand side-by-side.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                  <Button 
                    size="lg" 
                    onClick={handleQuizStart}
                    className="text-lg px-8 py-6 h-auto bg-white text-black hover:bg-gray-200 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  >
                    Find Your Path <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate('/about')}
                    className="text-lg px-8 py-6 h-auto rounded-xl bg-glass border-white/10 hover:bg-white/10 transition-all"
                  >
                    Our Manifesto
                  </Button>
                </div>

                <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-80">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-xl bg-glass border-glow">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold">Solidarity First</h3>
                    <p className="text-sm text-gray-400">We support each other's growth</p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-xl bg-glass border-glow">
                      <Briefcase className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold">Fair Work</h3>
                    <p className="text-sm text-gray-400">Vetted opportunities only</p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-xl bg-glass border-glow">
                      <GraduationCap className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold">Open Knowledge</h3>
                    <p className="text-sm text-gray-400">Education for everyone</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                  {currentQuestion && (
                    <motion.div
                      key={quizStep}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="bg-glass rounded-3xl p-8 md:p-12 shadow-2xl border-glow"
                    >
                      <div className="flex justify-center mb-8">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${
                          quizStep === 1 ? 'from-blue-500/20 to-cyan-500/20 text-blue-400' :
                          quizStep === 2 ? 'from-green-500/20 to-emerald-500/20 text-green-400' :
                          'from-purple-500/20 to-pink-500/20 text-purple-400'
                        }`}>
                          <currentQuestion.icon className="w-12 h-12" />
                        </div>
                      </div>

                      <div className="text-center mb-10">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Question {quizStep} of 3</span>
                        <h2 className="text-3xl font-bold mt-2 mb-4 text-white">{currentQuestion.title}</h2>
                        <p className="text-xl text-gray-300">{currentQuestion.question}</p>
                      </div>

                      <div className="space-y-4">
                        <button
                          onClick={() => handleAnswer('yes')}
                          className="w-full group flex items-center justify-between p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 transition-all duration-200"
                        >
                          <span className="font-medium text-lg text-white">{currentQuestion.yesLabel}</span>
                          <div className="p-2 rounded-full bg-white/5 group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors">
                            <Check className="w-5 h-5" />
                          </div>
                        </button>

                        <button
                          onClick={() => handleAnswer('no')}
                          className="w-full group flex items-center justify-between p-5 rounded-xl bg-transparent hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-200"
                        >
                          <span className="font-medium text-lg text-gray-400 group-hover:text-gray-300">{currentQuestion.noLabel}</span>
                          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                          </div>
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-8 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-blue-500"
                          initial={{ width: `${((quizStep-1)/3)*100}%` }}
                          animate={{ width: `${(quizStep/3)*100}%` }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
};

export default HomePage;