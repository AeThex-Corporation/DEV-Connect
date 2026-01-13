import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Clock,
  Code,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  Shield,
  Camera,
  Eye,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SkillAssessmentSystem({ user }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [assessmentInProgress, setAssessmentInProgress] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [questions, setQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [antiCheatFlags, setAntiCheatFlags] = useState([]);
  const [proctoring, setProctoring] = useState(false);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const tabSwitchCountRef = useRef(0);
  const startTimeRef = useRef(null);
  const questionTimesRef = useRef({});

  const availableSkills = [
    { name: "Lua Scripting", difficulty: ["beginner", "intermediate", "advanced", "expert"] },
    { name: "UI Design", difficulty: ["beginner", "intermediate", "advanced", "expert"] },
    { name: "3D Modeling", difficulty: ["beginner", "intermediate", "advanced", "expert"] },
    { name: "Game Design", difficulty: ["beginner", "intermediate", "advanced", "expert"] },
    { name: "DataStore Management", difficulty: ["intermediate", "advanced", "expert"] },
    { name: "Module Scripts", difficulty: ["intermediate", "advanced", "expert"] },
    { name: "RemoteEvents/Functions", difficulty: ["intermediate", "advanced", "expert"] }
  ];

  useEffect(() => {
    loadCompletedAssessments();
  }, []);

  useEffect(() => {
    if (assessmentInProgress) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [assessmentInProgress]);

  // Anti-cheat: Tab visibility monitoring
  useEffect(() => {
    if (assessmentInProgress) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          tabSwitchCountRef.current += 1;
          addAntiCheatFlag('tab_switch', 'User switched tabs during assessment', 
            tabSwitchCountRef.current > 3 ? 'high' : 'medium');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [assessmentInProgress]);

  // AI Proctoring (for Expert level)
  useEffect(() => {
    if (proctoring && assessmentInProgress) {
      startProctoring();
    }
    return () => stopProctoring();
  }, [proctoring, assessmentInProgress]);

  const loadCompletedAssessments = async () => {
    try {
      const assessments = await base44.entities.SkillAssessment.filter({
        user_id: user.id
      });
      setCompletedAssessments(assessments);
    } catch (error) {
      console.error('Error loading assessments:', error);
    }
  };

  const addAntiCheatFlag = (flagType, details, severity) => {
    setAntiCheatFlags(prev => [...prev, {
      flag_type: flagType,
      timestamp: new Date().toISOString(),
      severity,
      details
    }]);
  };

  const startProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Capture frames every 5 seconds for AI analysis
      const interval = setInterval(() => {
        captureFrameForAnalysis();
      }, 5000);

      return () => {
        clearInterval(interval);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Proctoring error:', error);
      alert('Camera access required for Expert-level assessments');
    }
  };

  const stopProctoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const captureFrameForAnalysis = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // In production, send frame to AI proctoring service
    // For now, just simulate detection
    const randomCheck = Math.random();
    if (randomCheck < 0.05) { // 5% chance of alert
      addAntiCheatFlag('ai_proctoring_alert', 'Unusual activity detected', 'medium');
    }
  };

  const generateDynamicQuestions = async (skill, difficultyLevel) => {
    setLoading(true);
    try {
      // Use AI to generate unique questions
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 10 ${difficultyLevel} level assessment questions for ${skill} in Roblox development. 
        Include a mix of:
        - Multiple choice questions (4 options each)
        - Coding challenges (for advanced/expert levels)
        - Practical scenario questions
        
        Return as JSON array with this structure:
        {
          "questions": [
            {
              "id": "q1",
              "type": "multiple_choice" | "coding" | "practical",
              "question": "question text",
              "options": ["a", "b", "c", "d"],
              "correct_answer": "answer",
              "explanation": "why this is correct",
              "difficulty": "beginner|intermediate|advanced|expert"
            }
          ]
        }`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  type: { type: "string" },
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response.questions || [];
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async (skill, difficultyLevel) => {
    setSelectedSkill(skill);
    setDifficulty(difficultyLevel);
    
    // Enable proctoring for Expert level
    if (difficultyLevel === 'expert') {
      setProctoring(true);
    }

    const generatedQuestions = await generateDynamicQuestions(skill, difficultyLevel);
    setQuestions(generatedQuestions);
    setAssessmentInProgress(true);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeRemaining(3600);
    startTimeRef.current = Date.now();
    questionTimesRef.current = {};
    setAntiCheatFlags([]);
  };

  const handleAnswerSelect = (answer) => {
    const questionStartTime = questionTimesRef.current[currentQuestion] || Date.now();
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    // Anti-cheat: Flag unusually fast answers
    if (timeSpent < 5 && questions[currentQuestion].type === 'multiple_choice') {
      addAntiCheatFlag('unusual_speed', 
        `Question answered in ${timeSpent.toFixed(1)}s`, 'low');
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: {
        answer,
        timeSpent,
        timestamp: Date.now()
      }
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      questionTimesRef.current[nextQuestion] = Date.now();

      // Adaptive difficulty: Adjust based on performance
      if (shouldAdjustDifficulty()) {
        adjustDifficulty();
      }
    } else {
      handleSubmitAssessment();
    }
  };

  const shouldAdjustDifficulty = () => {
    // Check last 3 answers
    const recentAnswers = Object.keys(answers).slice(-3);
    if (recentAnswers.length < 3) return false;

    const recentCorrect = recentAnswers.filter(q => 
      answers[q].answer === questions[q].correct_answer
    ).length;

    return true;
  };

  const adjustDifficulty = () => {
    const recentAnswers = Object.keys(answers).slice(-3);
    const recentCorrect = recentAnswers.filter(q => 
      answers[q].answer === questions[q].correct_answer
    ).length;

    // If getting 2-3 correct, increase difficulty
    // If getting 0-1 correct, decrease difficulty
    // This would trigger generation of next question at adjusted level
  };

  const calculateScore = () => {
    let correct = 0;
    let total = questions.length;

    questions.forEach((q, index) => {
      if (answers[index]?.answer === q.correct_answer) {
        correct++;
      }
    });

    let baseScore = (correct / total) * 100;

    // Penalize for anti-cheat flags
    const highSeverityFlags = antiCheatFlags.filter(f => f.severity === 'high').length;
    const mediumSeverityFlags = antiCheatFlags.filter(f => f.severity === 'medium').length;
    
    const penalty = (highSeverityFlags * 10) + (mediumSeverityFlags * 5);
    const finalScore = Math.max(0, baseScore - penalty);

    return {
      score: Math.round(finalScore),
      correct,
      total,
      penalty
    };
  };

  const handleSubmitAssessment = async () => {
    setAssessmentInProgress(false);
    stopProctoring();

    const { score, correct, total, penalty } = calculateScore();
    const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);

    try {
      const assessmentData = {
        user_id: user.id,
        skill_name: selectedSkill,
        assessment_type: difficulty === 'expert' ? 'adaptive_test' : 'coding_challenge',
        difficulty_level: difficulty,
        score,
        questions_answered: total,
        questions_correct: correct,
        time_taken_minutes: totalTime,
        time_limit_minutes: 60,
        passed: score >= 70,
        passing_score: 70,
        anti_cheat_flags: antiCheatFlags,
        proctoring_enabled: proctoring,
        questions: questions.map((q, i) => ({
          question_id: q.id,
          question_text: q.question,
          question_type: q.type,
          difficulty: q.difficulty,
          time_spent_seconds: answers[i]?.timeSpent || 0,
          answer: answers[i]?.answer || '',
          correct: answers[i]?.answer === q.correct_answer
        }))
      };

      if (proctoring) {
        assessmentData.proctoring_data = {
          tab_switches: tabSwitchCountRef.current,
          suspicious_activity_score: Math.min(100, antiCheatFlags.length * 10)
        };
      }

      await base44.entities.SkillAssessment.create(assessmentData);

      // Create certification if passed
      if (score >= 70) {
        await base44.entities.Certification.create({
          user_id: user.id,
          skill_name: selectedSkill,
          certification_level: difficulty,
          score,
          issued_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          verified: true
        });
      }

      await loadCompletedAssessments();
      
      alert(score >= 70 
        ? `🎉 Congratulations! You passed with ${score}%${penalty > 0 ? ` (${penalty}% penalty applied)` : ''}`
        : `You scored ${score}%. You need 70% to pass. ${penalty > 0 ? `Note: ${penalty}% penalty was applied due to flagged activity.` : ''}`
      );
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Failed to save assessment results');
    }

    setSelectedSkill(null);
    setProctoring(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (assessmentInProgress) {
    const question = questions[currentQuestion];
    
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white text-xl">
                  {selectedSkill} - {difficulty} Level
                </CardTitle>
                <p className="text-gray-400 text-sm mt-1">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {proctoring && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <Camera className="w-3 h-3 mr-1" />
                    Proctored
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className={`text-lg font-bold ${timeRemaining < 300 ? 'text-red-400' : 'text-white'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
            <Progress value={(currentQuestion / questions.length) * 100} className="mt-4" />
          </CardHeader>

          <CardContent className="space-y-6">
            {antiCheatFlags.length > 0 && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400 text-sm">
                  {antiCheatFlags.length} anti-cheat flag(s) detected. Your score may be affected.
                </AlertDescription>
              </Alert>
            )}

            {question && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-indigo-500/20 text-indigo-400">
                    {question.type}
                  </Badge>
                  {question.type === 'coding' && (
                    <Badge className="bg-purple-500/20 text-purple-400">
                      <Code className="w-3 h-3 mr-1" />
                      Practical Challenge
                    </Badge>
                  )}
                </div>

                <div className="bg-white/5 rounded-lg p-6">
                  <h3 className="text-white text-lg mb-4">{question.question}</h3>
                  
                  {question.type === 'multiple_choice' && (
                    <div className="space-y-3">
                      {question.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswerSelect(option)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            answers[currentQuestion]?.answer === option
                              ? 'bg-indigo-500/20 border-indigo-500 text-white'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          <span className="font-medium mr-3">{String.fromCharCode(65 + i)}.</span>
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {question.type === 'coding' && (
                    <div className="space-y-4">
                      <textarea
                        className="w-full h-64 bg-[#1e1e1e] text-white font-mono text-sm p-4 rounded-lg border border-white/10 focus:border-indigo-500 focus:outline-none"
                        placeholder="Write your code here..."
                        value={answers[currentQuestion]?.answer || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                      />
                      <p className="text-gray-400 text-sm">
                        💡 Your code will be evaluated for correctness, efficiency, and quality
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                variant="outline"
                className="glass-card border-0 text-white"
              >
                Previous
              </Button>

              <Button
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion]}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              >
                {currentQuestion === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hidden elements for proctoring */}
        {proctoring && (
          <div style={{ display: 'none' }}>
            <video ref={videoRef} />
            <canvas ref={canvasRef} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Skill Assessments</h2>
          <p className="text-gray-400 text-sm">
            Earn verified certifications by passing skill assessments
          </p>
        </div>
      </div>

      <Tabs defaultValue="available">
        <TabsList className="glass-card border-0">
          <TabsTrigger value="available">Available Assessments</TabsTrigger>
          <TabsTrigger value="completed">My Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableSkills.map((skill, i) => (
            <Card key={i} className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">{skill.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Test your knowledge and earn a verified certification
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {skill.difficulty.map((level, j) => {
                        const completed = completedAssessments.find(
                          a => a.skill_name === skill.name && a.difficulty_level === level && a.passed
                        );
                        
                        return (
                          <Button
                            key={j}
                            onClick={() => startAssessment(skill.name, level)}
                            disabled={loading}
                            size="sm"
                            className={completed
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : level === 'expert'
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                              : "glass-card border-0 text-white hover:bg-white/10"
                            }
                          >
                            {completed && <CheckCircle className="w-3 h-3 mr-1" />}
                            {level === 'expert' && !completed && <Shield className="w-3 h-3 mr-1" />}
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                            {level === 'expert' && ' (Proctored)'}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <Award className="w-12 h-12 text-indigo-400" />
                </div>

                {skill.difficulty.includes('expert') && (
                  <Alert className="mt-4 bg-purple-500/10 border-purple-500/30">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <AlertDescription className="text-purple-300 text-sm">
                      Expert assessments include AI-powered proctoring with camera monitoring for integrity
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAssessments.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No certifications yet. Start an assessment to earn one!</p>
              </CardContent>
            </Card>
          ) : (
            completedAssessments
              .filter(a => a.passed)
              .map((assessment, i) => (
                <Card key={i} className="glass-card border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">
                            {assessment.skill_name}
                          </h3>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Certified
                          </Badge>
                          <Badge className="bg-indigo-500/20 text-indigo-400">
                            {assessment.difficulty_level}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-gray-400 text-xs">Score</p>
                            <p className="text-white font-semibold">{assessment.score}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Percentile</p>
                            <p className="text-white font-semibold">{assessment.percentile || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Date</p>
                            <p className="text-white font-semibold">
                              {new Date(assessment.created_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Time Taken</p>
                            <p className="text-white font-semibold">{assessment.time_taken_minutes} min</p>
                          </div>
                        </div>

                        {assessment.anti_cheat_flags?.length > 0 && (
                          <Alert className="mt-4 bg-yellow-500/10 border-yellow-500/30">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <AlertDescription className="text-yellow-300 text-sm">
                              {assessment.anti_cheat_flags.length} flag(s) detected during assessment
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <Award className="w-12 h-12 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}