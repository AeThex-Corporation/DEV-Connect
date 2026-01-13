import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Brain, 
  Sparkles, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  FileText,
  Save
} from "lucide-react";

export default function AIInterviewAssistant({ job, candidate, interview, onUpdate }) {
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [questions, setQuestions] = useState(interview?.ai_generated_questions || []);
  const [analysis, setAnalysis] = useState(interview?.ai_analysis || null);
  const [candidateResponses, setCandidateResponses] = useState({});
  const [manualRatings, setManualRatings] = useState({
    technical_skills: 3,
    problem_solving: 3,
    communication: 3,
    culture_fit: 3,
    overall: 3
  });
  const [interviewerNotes, setInterviewerNotes] = useState(interview?.interviewer_notes || "");
  const [savingReport, setSavingReport] = useState(false);

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const prompt = `
You are an expert technical interviewer. Generate 10 high-quality interview questions for this position.

Job Details:
- Title: ${job.title}
- Description: ${job.description}
- Required Roles: ${job.required_roles?.join(', ')}
- Required Skills: ${job.required_skills?.map(s => s.skill_name).join(', ')}
- Programming Languages: ${job.programming_languages?.join(', ')}
- Frameworks: ${job.frameworks?.join(', ')}
- Experience Level: ${job.experience_level}

Candidate Profile:
- Name: ${candidate.full_name}
- Roles: ${candidate.developer_roles?.join(', ')}
- Skills: ${candidate.skills?.join(', ')}
- Experience Level: ${candidate.experience_level}
- Years of Experience: ${candidate.years_of_experience}

Generate a diverse set of questions covering:
1. Technical skills (40% - specific to required technologies)
2. Problem-solving abilities (20%)
3. Project experience (20%)
4. Behavioral/culture fit (10%)
5. Scenario-based questions (10%)

For each question provide:
- The question text
- Category (technical/behavioral/project_experience/culture_fit/problem_solving)
- Difficulty (easy/medium/hard)
- Why this question is relevant for this role
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  category: { type: "string" },
                  difficulty: { type: "string" },
                  reasoning: { type: "string" }
                }
              }
            }
          }
        }
      });

      setQuestions(response.questions);

      if (interview) {
        await base44.entities.Interview.update(interview.id, {
          ai_generated_questions: response.questions
        });
      }

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const analyzeResponses = async () => {
    setAnalyzing(true);
    try {
      const responsesText = Object.entries(candidateResponses)
        .map(([qIndex, answer]) => `Q${parseInt(qIndex) + 1}: ${questions[qIndex].question}\nA: ${answer}`)
        .join('\n\n');

      const prompt = `
You are an expert technical interviewer analyzing a candidate's interview performance.

Job Requirements:
- Title: ${job.title}
- Required Skills: ${job.required_skills?.map(s => s.skill_name).join(', ')}
- Programming Languages: ${job.programming_languages?.join(', ')}
- Frameworks: ${job.frameworks?.join(', ')}
- Experience Level: ${job.experience_level}

Candidate's Interview Responses:
${responsesText}

Provide a comprehensive analysis with:

1. STRENGTHS (3-5 key strengths demonstrated)
2. WEAKNESSES (3-5 areas of concern)
3. COMMUNICATION CLARITY ANALYSIS:
   - Clarity score (0-100)
   - How well they articulate ideas
   - Use of technical terminology
   - Response structure and organization
   - Examples of clear vs unclear communication
4. TECHNICAL DEPTH ANALYSIS:
   - Technical depth score (0-100)
   - Understanding of core concepts
   - Practical experience demonstrated
   - Problem-solving approach
   - Areas where depth is lacking
5. Overall score (0-100)
6. Hiring recommendation (strong_yes/yes/maybe/no/strong_no)
7. 5-7 follow-up questions based on their specific answers (probe areas they mentioned, clarify vague responses, challenge technical claims)
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            weaknesses: {
              type: "array",
              items: { type: "string" }
            },
            communication_clarity: {
              type: "object",
              properties: {
                score: { type: "number" },
                articulation: { type: "string" },
                terminology_use: { type: "string" },
                structure: { type: "string" },
                examples: { type: "array", items: { type: "string" } }
              }
            },
            technical_depth: {
              type: "object",
              properties: {
                score: { type: "number" },
                concepts_understanding: { type: "string" },
                practical_experience: { type: "string" },
                problem_solving: { type: "string" },
                lacking_areas: { type: "array", items: { type: "string" } }
              }
            },
            overall_score: { type: "number" },
            recommendation: { type: "string" },
            follow_up_questions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(response);

      if (interview) {
        await base44.entities.Interview.update(interview.id, {
          ai_analysis: response
        });
      }

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error analyzing responses:', error);
      alert('Failed to analyze responses');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveConsolidatedReport = async () => {
    setSavingReport(true);
    try {
      await base44.entities.Interview.update(interview.id, {
        questions: questions.map((q, i) => ({
          question: q.question,
          category: q.category,
          answer: candidateResponses[i] || "",
          rating: null,
          notes: ""
        })),
        ai_analysis: analysis,
        interviewer_notes: interviewerNotes,
        manual_ratings: manualRatings,
        status: 'completed'
      });

      if (onUpdate) onUpdate();
      alert('Interview report saved successfully!');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Failed to save report');
    } finally {
      setSavingReport(false);
    }
  };

  const getRecommendationColor = (rec) => {
    const colors = {
      'strong_yes': 'bg-green-500/20 text-green-400',
      'yes': 'bg-green-500/20 text-green-400',
      'maybe': 'bg-yellow-500/20 text-yellow-400',
      'no': 'bg-red-500/20 text-red-400',
      'strong_no': 'bg-red-500/20 text-red-400'
    };
    return colors[rec] || colors['maybe'];
  };

  const getDifficultyColor = (diff) => {
    const colors = {
      'easy': 'bg-green-500/20 text-green-400',
      'medium': 'bg-yellow-500/20 text-yellow-400',
      'hard': 'bg-red-500/20 text-red-400'
    };
    return colors[diff] || colors['medium'];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-0">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-white text-lg">AI Interview Assistant</CardTitle>
              <Badge className="bg-purple-500/20 text-purple-400 border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Enhanced AI Analysis
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-400 text-sm mb-4">
            AI-powered interview assistance with advanced analysis including communication clarity, technical depth assessment, and dynamic follow-up question generation.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={generateQuestions}
              disabled={generating}
              className="btn-primary text-white"
            >
              {generating ? 'Generating...' : 'Generate Interview Questions'}
            </Button>
            {questions.length > 0 && Object.keys(candidateResponses).length > 0 && (
              <Button
                onClick={analyzeResponses}
                disabled={analyzing}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Responses'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Questions */}
      {questions.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white text-lg">Interview Questions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {questions.map((q, index) => (
              <div key={index} className="glass-card rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-semibold">Q{index + 1}</span>
                    <Badge className={`${getDifficultyColor(q.difficulty)} border-0 text-xs`}>
                      {q.difficulty}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                      {q.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-white mb-2">{q.question}</p>
                <p className="text-gray-500 text-xs mb-3">{q.reasoning}</p>
                
                <Textarea
                  placeholder="Candidate's response..."
                  value={candidateResponses[index] || ''}
                  onChange={(e) => setCandidateResponses({
                    ...candidateResponses,
                    [index]: e.target.value
                  })}
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-20 text-sm"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      {analysis && (
        <>
          <Card className="glass-card border-0">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">AI Analysis & Recommendation</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-lg">{analysis.overall_score}/100</span>
                  <Badge className={`${getRecommendationColor(analysis.recommendation)} border-0`}>
                    {analysis.recommendation.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Communication Clarity */}
              <div className="glass-card rounded-lg p-4 bg-blue-500/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Communication Clarity</h3>
                  </div>
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.communication_clarity.score)}`}>
                    {analysis.communication_clarity.score}/100
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Articulation:</p>
                    <p className="text-gray-300">{analysis.communication_clarity.articulation}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Technical Terminology:</p>
                    <p className="text-gray-300">{analysis.communication_clarity.terminology_use}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Response Structure:</p>
                    <p className="text-gray-300">{analysis.communication_clarity.structure}</p>
                  </div>
                  {analysis.communication_clarity.examples?.length > 0 && (
                    <div>
                      <p className="text-gray-400 mb-1">Examples:</p>
                      <ul className="list-disc list-inside text-gray-300 space-y-1">
                        {analysis.communication_clarity.examples.map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Depth */}
              <div className="glass-card rounded-lg p-4 bg-purple-500/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Technical Depth</h3>
                  </div>
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.technical_depth.score)}`}>
                    {analysis.technical_depth.score}/100
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Concepts Understanding:</p>
                    <p className="text-gray-300">{analysis.technical_depth.concepts_understanding}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Practical Experience:</p>
                    <p className="text-gray-300">{analysis.technical_depth.practical_experience}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Problem Solving:</p>
                    <p className="text-gray-300">{analysis.technical_depth.problem_solving}</p>
                  </div>
                  {analysis.technical_depth.lacking_areas?.length > 0 && (
                    <div>
                      <p className="text-gray-400 mb-1">Areas Lacking Depth:</p>
                      <ul className="list-disc list-inside text-gray-300 space-y-1">
                        {analysis.technical_depth.lacking_areas.map((area, i) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Strengths */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-semibold">Strengths</h3>
                </div>
                <div className="space-y-2">
                  {analysis.strengths.map((strength, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <h3 className="text-white font-semibold">Areas of Concern</h3>
                </div>
                <div className="space-y-2">
                  {analysis.weaknesses.map((weakness, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{weakness}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Questions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">AI-Generated Follow-up Questions</h3>
                  <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                    Based on Responses
                  </Badge>
                </div>
                <div className="space-y-2">
                  {analysis.follow_up_questions.map((question, i) => (
                    <div key={i} className="glass-card rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-semibold text-sm">{i + 1}.</span>
                        <p className="text-gray-300 text-sm">{question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Ratings & Notes */}
          <Card className="glass-card border-0">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-white text-lg">Your Manual Assessment</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Rating Sliders */}
              <div className="space-y-4">
                {Object.entries({
                  technical_skills: 'Technical Skills',
                  problem_solving: 'Problem Solving',
                  communication: 'Communication',
                  culture_fit: 'Culture Fit',
                  overall: 'Overall Impression'
                }).map(([key, label]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white text-sm font-medium">{label}</label>
                      <div className="flex items-center gap-2">
                        {[...Array(manualRatings[key])].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                        {[...Array(5 - manualRatings[key])].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-gray-600" />
                        ))}
                        <span className="text-white font-semibold ml-2">{manualRatings[key]}/5</span>
                      </div>
                    </div>
                    <Slider
                      value={[manualRatings[key]]}
                      onValueChange={(value) => setManualRatings({...manualRatings, [key]: value[0]})}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              {/* Interviewer Notes */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Your Notes & Comments</label>
                <Textarea
                  value={interviewerNotes}
                  onChange={(e) => setInterviewerNotes(e.target.value)}
                  placeholder="Add your personal observations, gut feelings, or any additional context..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-32"
                />
              </div>

              {/* Save Report */}
              <Button
                onClick={saveConsolidatedReport}
                disabled={savingReport}
                className="w-full btn-primary text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingReport ? 'Saving...' : 'Save Consolidated Interview Report'}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}