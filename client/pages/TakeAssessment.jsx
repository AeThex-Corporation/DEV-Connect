import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  Star,
  TrendingUp,
  ArrowRight,
  Brain
} from "lucide-react";
import { awardXP, awardBadge } from "../components/GamificationSystem";

// Question banks for different skills and levels
const QUESTION_BANKS = {
  "Lua Scripting": {
    beginner: [
      {
        question: "What is the correct way to declare a variable in Lua?",
        options: ["var x = 5", "local x = 5", "int x = 5", "let x = 5"],
        correct: 1,
        explanation: "In Lua, variables are declared using 'local' keyword for local scope or just the name for global scope."
      },
      {
        question: "Which of these is NOT a valid Lua data type?",
        options: ["string", "number", "boolean", "integer"],
        correct: 3,
        explanation: "Lua has 'number' which handles both integers and floats, but not a separate 'integer' type."
      },
      {
        question: "How do you create a comment in Lua?",
        options: ["// comment", "# comment", "-- comment", "/* comment */"],
        correct: 2,
        explanation: "Lua uses double dashes (--) for single-line comments."
      },
      {
        question: "What does the # operator do in Lua?",
        options: ["Multiplication", "Division", "Gets length of table/string", "Modulo"],
        correct: 2,
        explanation: "The # operator returns the length of a string or table in Lua."
      },
      {
        question: "Which function is used to print output in Roblox Lua?",
        options: ["console.log()", "print()", "echo()", "output()"],
        correct: 1,
        explanation: "print() is the standard function for outputting text in Lua."
      }
    ],
    intermediate: [
      {
        question: "What is the purpose of metatables in Lua?",
        options: [
          "To store metadata about tables",
          "To change behavior of tables and enable operator overloading",
          "To create table backups",
          "To optimize table performance"
        ],
        correct: 1,
        explanation: "Metatables allow you to modify the behavior of tables, including operator overloading and implementing OOP patterns."
      },
      {
        question: "What does the 'pairs()' function do?",
        options: [
          "Creates pairs of values",
          "Iterates over all key-value pairs in a table",
          "Compares two tables",
          "Pairs remote events"
        ],
        correct: 1,
        explanation: "pairs() is used to iterate over all key-value pairs in a table in Lua."
      },
      {
        question: "In Roblox, what is a RemoteEvent used for?",
        options: [
          "Scheduling delayed code",
          "Communication between client and server",
          "Detecting player events",
          "Creating remote animations"
        ],
        correct: 1,
        explanation: "RemoteEvents enable client-server communication in Roblox games."
      },
      {
        question: "What is the difference between ':' and '.' when calling methods?",
        options: [
          "No difference",
          ": automatically passes self as first parameter",
          ": is faster",
          ". is deprecated"
        ],
        correct: 1,
        explanation: "The colon (:) automatically passes self as the first parameter, useful for object-oriented programming."
      },
      {
        question: "Which service manages player data in Roblox?",
        options: ["PlayerService", "DataStoreService", "StorageService", "SaveService"],
        correct: 1,
        explanation: "DataStoreService is used for persistent data storage in Roblox."
      }
    ],
    advanced: [
      {
        question: "What is the best practice for handling DataStore errors?",
        options: [
          "Ignore them",
          "Use pcall() and implement retry logic",
          "Only save once per session",
          "Use global variables"
        ],
        correct: 1,
        explanation: "pcall() catches errors gracefully, and retry logic ensures data isn't lost during temporary failures."
      },
      {
        question: "What is the purpose of ModuleScripts in Roblox?",
        options: [
          "To create game modules",
          "To share code between scripts and improve organization",
          "To create mods",
          "To optimize performance"
        ],
        correct: 1,
        explanation: "ModuleScripts allow code reuse and better organization by returning a table or function that can be required by other scripts."
      },
      {
        question: "Which is most efficient for frequent table operations?",
        options: [
          "table.insert() and table.remove()",
          "Direct index assignment",
          "pairs() iteration",
          "ipairs() iteration"
        ],
        correct: 1,
        explanation: "Direct index assignment (table[key] = value) is faster than built-in functions for most operations."
      },
      {
        question: "What is the difference between BindableEvent and RemoteEvent?",
        options: [
          "No difference",
          "BindableEvent is for same-side communication, RemoteEvent crosses client-server boundary",
          "BindableEvent is deprecated",
          "RemoteEvent is faster"
        ],
        correct: 1,
        explanation: "BindableEvents communicate within the same context (server-to-server or client-to-client), while RemoteEvents communicate between client and server."
      },
      {
        question: "What is the recommended way to prevent exploiters from manipulating remote events?",
        options: [
          "Don't use remote events",
          "Validate all data on the server and never trust the client",
          "Use secure remotes",
          "Encrypt the data"
        ],
        correct: 1,
        explanation: "Always validate and sanitize data on the server. Never trust client input."
      }
    ]
  },
  "UI/UX Design": {
    beginner: [
      {
        question: "What does UI stand for?",
        options: ["User Integration", "User Interface", "Universal Interface", "Unified Input"],
        correct: 1,
        explanation: "UI stands for User Interface - the visual elements users interact with."
      },
      {
        question: "What is UX?",
        options: ["User Experience", "User Execution", "Universal Experience", "Unified Exchange"],
        correct: 0,
        explanation: "UX stands for User Experience - how users feel and interact with a product."
      },
      {
        question: "Which Roblox GUI object is used to create buttons?",
        options: ["TextLabel", "TextButton", "Frame", "ImageLabel"],
        correct: 1,
        explanation: "TextButton is the primary GUI object for creating clickable buttons."
      },
      {
        question: "What property controls transparency in Roblox GUI?",
        options: ["Opacity", "BackgroundTransparency", "Visibility", "Alpha"],
        correct: 1,
        explanation: "BackgroundTransparency property controls how see-through a GUI element is (0-1)."
      },
      {
        question: "Which layout object automatically arranges children in a grid?",
        options: ["UIListLayout", "UIGridLayout", "UITableLayout", "UIPageLayout"],
        correct: 1,
        explanation: "UIGridLayout arranges children in a grid pattern with specified rows/columns."
      }
    ],
    intermediate: [
      {
        question: "What is the purpose of UIScale?",
        options: [
          "To change color scale",
          "To proportionally scale GUI size",
          "To scale images",
          "To create responsive layouts"
        ],
        correct: 1,
        explanation: "UIScale changes the size of a GUI object and its descendants proportionally."
      },
      {
        question: "Which constraint is best for responsive design?",
        options: ["UIAspectRatioConstraint", "UISizeConstraint", "UITextSizeConstraint", "All of the above"],
        correct: 3,
        explanation: "All these constraints help create responsive designs for different screen sizes."
      },
      {
        question: "What is the recommended way to handle different screen sizes?",
        options: [
          "Use only Offset size",
          "Use only Scale size",
          "Combine Scale and Offset appropriately",
          "Use fixed pixel values"
        ],
        correct: 2,
        explanation: "Combining Scale (percentage-based) and Offset (pixel-based) creates the most flexible responsive designs."
      },
      {
        question: "What is a good practice for button feedback?",
        options: [
          "No feedback needed",
          "Change color or size on hover/click",
          "Only play sound",
          "Disable button after click"
        ],
        correct: 1,
        explanation: "Visual feedback like color or size changes helps users understand their interactions."
      },
      {
        question: "What is the Z-Index property used for?",
        options: [
          "3D positioning",
          "Controlling layering order of overlapping GUIs",
          "Zoom level",
          "Z-axis rotation"
        ],
        correct: 1,
        explanation: "ZIndex determines which GUI elements appear in front when overlapping."
      }
    ],
    advanced: [
      {
        question: "What is the best approach for creating smooth UI animations?",
        options: [
          "Use wait() loops",
          "Use TweenService for interpolated animations",
          "Manually update position every frame",
          "Use spawn() functions"
        ],
        correct: 1,
        explanation: "TweenService provides smooth, performance-efficient animations with easing functions."
      },
      {
        question: "How should you optimize GUIs for mobile devices?",
        options: [
          "Make everything smaller",
          "Increase touch target sizes and use mobile-friendly layouts",
          "Remove all animations",
          "Use only text"
        ],
        correct: 1,
        explanation: "Mobile optimization requires larger touch targets (44x44 minimum) and consideration for various screen sizes."
      },
      {
        question: "What is the recommended approach for loading screens?",
        options: [
          "Block all input until loaded",
          "Show progress indicator and allow interaction when ready",
          "Just show 'Loading...' text",
          "No loading screen needed"
        ],
        correct: 1,
        explanation: "Good loading screens show progress, don't block unnecessarily, and provide feedback to users."
      },
      {
        question: "How do you prevent UI elements from blocking clicks to the game world?",
        options: [
          "Set Visible to false",
          "Set Active to false",
          "Set Modal to false",
          "Use ZIndex"
        ],
        correct: 1,
        explanation: "Setting Active to false allows clicks to pass through GUI elements to the 3D world."
      },
      {
        question: "What is the best practice for designing accessible UIs?",
        options: [
          "Use only images",
          "Provide sufficient contrast, readable fonts, and clear hierarchy",
          "Make everything bright colors",
          "Use small text to fit more"
        ],
        correct: 1,
        explanation: "Accessible design includes good contrast ratios, readable text sizes, and clear visual hierarchy."
      }
    ]
  },
  "3D Modeling": {
    beginner: [
      {
        question: "What is a polygon in 3D modeling?",
        options: [
          "A color",
          "A flat surface with 3+ vertices",
          "A texture",
          "A lighting effect"
        ],
        correct: 1,
        explanation: "A polygon is a flat surface defined by vertices (usually triangles or quads in 3D modeling)."
      },
      {
        question: "What does 'Low Poly' mean?",
        options: [
          "Bad quality model",
          "Model with few polygons for better performance",
          "Small model",
          "Simple colors"
        ],
        correct: 1,
        explanation: "Low poly models use fewer polygons, which improves performance while maintaining visual quality."
      },
      {
        question: "Which file format is commonly used for Roblox models?",
        options: [".fbx", ".obj", ".blend", ".rbxm"],
        correct: 3,
        explanation: ".rbxm (Roblox Model) is the native format for Roblox 3D models."
      },
      {
        question: "What is UV mapping used for?",
        options: [
          "Creating animations",
          "Applying textures to 3D models",
          "Lighting models",
          "Exporting models"
        ],
        correct: 1,
        explanation: "UV mapping defines how 2D textures wrap around 3D geometry."
      },
      {
        question: "What is the purpose of normals in 3D modeling?",
        options: [
          "To name objects",
          "To determine which direction a surface faces for lighting",
          "To create animations",
          "To set colors"
        ],
        correct: 1,
        explanation: "Normals are vectors that define surface direction, crucial for proper lighting and shading."
      }
    ],
    intermediate: [
      {
        question: "What is the difference between MeshParts and Unions in Roblox?",
        options: [
          "No difference",
          "MeshParts use external meshes, Unions combine parts in Roblox",
          "Unions are deprecated",
          "MeshParts are slower"
        ],
        correct: 1,
        explanation: "MeshParts import external 3D meshes, while Unions combine multiple parts within Roblox Studio."
      },
      {
        question: "What is LOD in 3D modeling?",
        options: [
          "Level of Detail - different quality versions for different distances",
          "Lighting on Demand",
          "Load on Demand",
          "Layer of Depth"
        ],
        correct: 0,
        explanation: "LOD (Level of Detail) uses simpler models at greater distances to improve performance."
      },
      {
        question: "Why is proper topology important?",
        options: [
          "It's not important",
          "For clean deformation, UV mapping, and efficient polygon use",
          "Only for animation",
          "Only for texturing"
        ],
        correct: 1,
        explanation: "Good topology ensures models deform properly, texture cleanly, and use polygons efficiently."
      },
      {
        question: "What is ambient occlusion?",
        options: [
          "A type of texture",
          "Soft shadows in crevices and contact points",
          "A modeling technique",
          "An animation method"
        ],
        correct: 1,
        explanation: "Ambient occlusion adds realistic soft shadows where surfaces meet, enhancing depth perception."
      },
      {
        question: "What is the recommended polygon count for Roblox game assets?",
        options: [
          "No limit",
          "As low as possible while maintaining quality",
          "Always use millions",
          "Exactly 1000 polygons"
        ],
        correct: 1,
        explanation: "Balance visual quality with performance - use as few polygons as needed for the desired look."
      }
    ]
  }
};

export default function TakeAssessment() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const skill = urlParams.get('skill');
  const level = urlParams.get('level');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (assessmentStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [assessmentStarted, timeRemaining]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Check if skill and level are valid
      if (!skill || !level || !QUESTION_BANKS[skill]?.[level]) {
        alert('Invalid assessment parameters');
        window.location.href = createPageUrl('Certifications');
        return;
      }

      // Load questions for this skill and level
      const questionBank = QUESTION_BANKS[skill][level];
      setQuestions(questionBank);
      
      // Set time based on number of questions (2 minutes per question)
      setTimeRemaining(questionBank.length * 120);
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = () => {
    setAssessmentStarted(true);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAutoSubmit = async () => {
    if (!submitting) {
      await submitAssessment();
    }
  };

  const submitAssessment = async () => {
    setSubmitting(true);
    try {
      // Calculate score
      let correctAnswers = 0;
      questions.forEach((q, index) => {
        if (selectedAnswers[index] === q.correct) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / questions.length) * 100);
      
      // Calculate percentile (simulated - in production would compare to all users)
      const percentile = Math.min(95, Math.max(5, score - 10 + Math.random() * 20));

      // Determine if passed (70% or higher)
      const passed = score >= 70;

      if (passed) {
        // Generate certificate URL (simulated)
        const certificateUrl = `https://certificates.robloxdevhub.com/${user.id}/${skill}/${level}/${Date.now()}`;
        
        // Create certification record
        await base44.entities.Certification.create({
          user_id: user.id,
          skill_name: skill,
          certification_level: level,
          score: score,
          percentile: Math.round(percentile),
          certificate_url: certificateUrl,
          verification_code: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          issued_date: new Date().toISOString().split('T')[0],
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
          status: 'active',
          verified: true,
          display_on_profile: true
        });

        // Award XP based on level
        const xpRewards = {
          'beginner': 100,
          'intermediate': 200,
          'advanced': 300,
          'expert': 500
        };
        await awardXP(user.id, xpRewards[level], `Earned ${skill} ${level} certification`);

        // Award skill master badge if they have certifications in 3+ skills
        const allCerts = await base44.entities.Certification.filter({ user_id: user.id });
        const uniqueSkills = new Set(allCerts.map(c => c.skill_name));
        if (uniqueSkills.size >= 3) {
          await awardBadge(user.id, 'SKILL_MASTER');
        }

        // Create notification
        await base44.entities.Notification.create({
          user_id: user.id,
          type: 'message',
          title: '🎉 Certification Earned!',
          message: `Congratulations! You earned ${skill} ${level} certification with ${score}% score (Top ${100 - Math.round(percentile)}%)`,
          link: createPageUrl('Certifications')
        });
      }

      setResults({
        score,
        percentile: Math.round(percentile),
        passed,
        correctAnswers,
        totalQuestions: questions.length,
        certificateUrl: passed ? `https://certificates.robloxdevhub.com/${user.id}/${skill}/${level}/${Date.now()}` : null
      });

      setAssessmentComplete(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!assessmentStarted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Card className="glass-card border-0">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {skill} Assessment
              </h1>
              <Badge className={`${
                level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                level === 'advanced' ? 'bg-purple-500/20 text-purple-400' :
                'bg-yellow-500/20 text-yellow-400'
              } border-0 text-lg px-4 py-1 capitalize`}>
                {level} Level
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="glass-card rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                  Assessment Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Questions</p>
                    <p className="text-white font-semibold">{questions.length} Questions</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Time Limit</p>
                    <p className="text-white font-semibold">{formatTime(timeRemaining)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Passing Score</p>
                    <p className="text-white font-semibold">70% or Higher</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Format</p>
                    <p className="text-white font-semibold">Multiple Choice</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-lg p-6 bg-blue-500/5">
                <h3 className="text-white font-semibold mb-3">Instructions</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>Answer all questions to the best of your ability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>You can navigate between questions before submitting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>The assessment will auto-submit when time runs out</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>You'll see your results immediately after completion</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => window.location.href = createPageUrl('Certifications')}
                  variant="outline"
                  className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={startAssessment}
                  className="flex-1 btn-primary text-white"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assessmentComplete && results) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Card className={`glass-card border-0 ${results.passed ? 'bg-gradient-to-br from-green-500/10 to-blue-500/10' : 'bg-gradient-to-br from-red-500/10 to-orange-500/10'}`}>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                results.passed 
                  ? 'bg-gradient-to-br from-green-500 to-blue-500' 
                  : 'bg-gradient-to-br from-red-500 to-orange-500'
              }`}>
                {results.passed ? (
                  <Trophy className="w-12 h-12 text-white" />
                ) : (
                  <XCircle className="w-12 h-12 text-white" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {results.passed ? 'Congratulations!' : 'Keep Learning!'}
              </h1>
              <p className="text-gray-300">
                {results.passed 
                  ? 'You have earned your certification!' 
                  : 'You can retake the assessment anytime'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="glass-card border-0">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Your Score</p>
                  <p className="text-4xl font-bold text-white mb-1">{results.score}%</p>
                  <p className="text-gray-400 text-xs">
                    {results.correctAnswers} / {results.totalQuestions} correct
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Percentile</p>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                    <p className="text-4xl font-bold text-white">
                      {100 - results.percentile}%
                    </p>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Top {100 - results.percentile} percentile
                  </p>
                </CardContent>
              </Card>
            </div>

            {results.passed && (
              <div className="glass-card rounded-lg p-6 mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="text-white font-semibold">Certification Earned!</h3>
                    <p className="text-gray-400 text-sm">
                      {skill} - {level.charAt(0).toUpperCase() + level.slice(1)} Level
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.open(results.certificateUrl, '_blank')}
                    variant="outline"
                    size="sm"
                    className="glass-card border-0 text-white hover:bg-white/5"
                  >
                    Download Certificate
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(results.certificateUrl);
                      alert('Certificate URL copied!');
                    }}
                    variant="outline"
                    size="sm"
                    className="glass-card border-0 text-white hover:bg-white/5"
                  >
                    Share Certificate
                  </Button>
                </div>
              </div>
            )}

            <div className="glass-card rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Review Your Answers</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.map((q, index) => {
                  const isCorrect = selectedAnswers[index] === q.correct;
                  const wasAnswered = selectedAnswers[index] !== undefined;
                  
                  return (
                    <div key={index} className="glass-card rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : wasAnswered ? (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium mb-2">{q.question}</p>
                          {wasAnswered && (
                            <p className={`text-sm mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                              Your answer: {q.options[selectedAnswers[index]]}
                            </p>
                          )}
                          {!isCorrect && (
                            <p className="text-blue-400 text-sm mb-1">
                              Correct answer: {q.options[q.correct]}
                            </p>
                          )}
                          <p className="text-gray-400 text-xs">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => window.location.href = createPageUrl('Certifications')}
                className="flex-1 btn-primary text-white"
              >
                Back to Certifications
              </Button>
              {!results.passed && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                >
                  Retake Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="glass-card rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">{skill} Assessment</h2>
            <p className="text-gray-400 text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining < 300 ? 'bg-red-500/20' : 'bg-blue-500/20'
          }`}>
            <Clock className={`w-4 h-4 ${timeRemaining < 300 ? 'text-red-400' : 'text-blue-400'}`} />
            <span className={`font-bold ${timeRemaining < 300 ? 'text-red-400' : 'text-white'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{answeredCount} / {questions.length} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="glass-card border-0 mb-6">
        <CardContent className="p-8">
          <h3 className="text-white text-xl font-semibold mb-6">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'bg-indigo-500/20 border-2 border-indigo-500'
                    : 'glass-card border-2 border-transparent hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-400'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
          className="glass-card border-0 text-white hover:bg-white/5"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                index === currentQuestion
                  ? 'bg-indigo-500 text-white'
                  : selectedAnswers[index] !== undefined
                  ? 'bg-green-500/20 text-green-400'
                  : 'glass-card text-gray-400'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <Button
            onClick={submitAssessment}
            disabled={submitting || answeredCount < questions.length}
            className="btn-primary text-white"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="btn-primary text-white"
          >
            Next
          </Button>
        )}
      </div>

      {answeredCount < questions.length && (
        <div className="mt-4 text-center">
          <p className="text-yellow-400 text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Please answer all questions before submitting
          </p>
        </div>
      )}
    </div>
  );
}