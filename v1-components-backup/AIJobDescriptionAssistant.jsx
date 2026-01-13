import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  Target,
  BookOpen
} from "lucide-react";

export default function AIJobDescriptionAssistant({ onApply, initialData = {} }) {
  const [jobTitle, setJobTitle] = useState(initialData.title || "");
  const [keyResponsibilities, setKeyResponsibilities] = useState("");
  const [currentDescription, setCurrentDescription] = useState(initialData.description || "");
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");

  const generateJobDescription = async () => {
    if (!jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }

    setGenerating(true);
    try {
      const prompt = `
You are an expert recruiter and job posting specialist for Roblox development roles.

Create a compelling, professional job description for the following role:

JOB TITLE: ${jobTitle}
KEY RESPONSIBILITIES: ${keyResponsibilities || 'Not specified'}

Generate a complete job description that includes:

1. ENGAGING OVERVIEW: A brief, exciting introduction (2-3 sentences) that sells the opportunity
2. DETAILED DESCRIPTION: Comprehensive role description (3-4 paragraphs)
3. KEY RESPONSIBILITIES: Bulleted list of main duties
4. REQUIRED SKILLS: Technical skills needed
5. PREFERRED SKILLS: Nice-to-have skills
6. EXPERIENCE LEVEL: Recommended experience level
7. SUGGESTED ROLES: Relevant developer roles for this position
8. PROJECT SCOPE: Estimated project scope
9. TONE: Professional yet friendly, exciting but realistic

Make it appealing to talented Roblox developers while being clear about expectations.
Use engaging language that highlights the opportunity for growth and impact.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overview: {
              type: "string",
              description: "Brief exciting introduction"
            },
            full_description: {
              type: "string",
              description: "Complete detailed job description"
            },
            key_responsibilities: {
              type: "array",
              items: { type: "string" },
              description: "List of main responsibilities"
            },
            required_skills: {
              type: "array",
              items: { type: "string" },
              description: "Essential technical skills"
            },
            preferred_skills: {
              type: "array",
              items: { type: "string" },
              description: "Nice-to-have skills"
            },
            experience_level: {
              type: "string",
              enum: ["Beginner", "Intermediate", "Advanced", "Expert"]
            },
            suggested_roles: {
              type: "array",
              items: { 
                type: "string",
                enum: ["Scripter", "Builder", "UI/UX Designer", "3D Modeler", "Sound Designer", "Game Designer", "Artist", "Animator", "VFX Designer"]
              }
            },
            project_scope: {
              type: "string",
              enum: ["Small Task", "Part-time Project", "Full-time Project", "Long-term Partnership"]
            },
            why_exciting: {
              type: "array",
              items: { type: "string" },
              description: "Reasons why this opportunity is exciting"
            },
            estimated_timeline: {
              type: "string",
              description: "Suggested timeline"
            }
          }
        }
      });

      setGeneratedContent(response);
      setSuggestions(response);
      setActiveTab("review");
    } catch (error) {
      console.error('Error generating job description:', error);
      alert('Failed to generate job description. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const refineDescription = async () => {
    if (!currentDescription.trim()) {
      alert('Please enter a job description to refine');
      return;
    }

    setRefining(true);
    try {
      const prompt = `
You are an expert editor specializing in job postings for Roblox developers.

Analyze and improve this job description:

"${currentDescription}"

JOB TITLE: ${jobTitle}

Provide:

1. IMPROVED VERSION: A refined, more compelling version of the description
2. TONE ANALYSIS: Assessment of current tone (professional/casual/etc.)
3. CLARITY SCORE: How clear the description is (0-100)
4. IMPROVEMENTS MADE: List of specific improvements
5. MISSING ELEMENTS: What important information might be missing
6. KEYWORD OPTIMIZATION: Important keywords to include for better visibility
7. SUGGESTED SKILLS: Skills that should be highlighted based on the description
8. RECOMMENDED CHANGES: Specific suggestions for further improvement

Make the description:
- More engaging and exciting
- Clear and specific about expectations
- Professional yet approachable
- Optimized to attract top talent
- Free of jargon unless necessary
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            improved_description: {
              type: "string"
            },
            tone_analysis: {
              type: "string"
            },
            clarity_score: {
              type: "number"
            },
            improvements_made: {
              type: "array",
              items: { type: "string" }
            },
            missing_elements: {
              type: "array",
              items: { type: "string" }
            },
            keyword_optimization: {
              type: "array",
              items: { type: "string" }
            },
            suggested_skills: {
              type: "array",
              items: { type: "string" }
            },
            recommended_changes: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedContent({
        ...generatedContent,
        full_description: response.improved_description
      });
      setSuggestions(response);
      setActiveTab("review");
    } catch (error) {
      console.error('Error refining description:', error);
      alert('Failed to refine description. Please try again.');
    } finally {
      setRefining(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyToJobForm = () => {
    if (generatedContent) {
      onApply({
        title: jobTitle,
        description: generatedContent.full_description,
        required_roles: generatedContent.suggested_roles || [],
        required_skills: generatedContent.required_skills || [],
        experience_level: generatedContent.experience_level,
        project_scope: generatedContent.project_scope,
        timeline: generatedContent.estimated_timeline
      });
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <CardTitle className="text-white">AI Job Description Assistant</CardTitle>
        </div>
        <p className="text-gray-400 text-sm">
          Let AI help you create a compelling job posting that attracts top talent
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-card border-0 mb-6">
            <TabsTrigger value="generate">
              <Wand2 className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="refine">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refine Existing
            </TabsTrigger>
            {generatedContent && (
              <TabsTrigger value="review">
                <Check className="w-4 h-4 mr-2" />
                Review
              </TabsTrigger>
            )}
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Job Title *
              </label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Lua Scripter for RPG Game"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Key Responsibilities (Optional)
              </label>
              <Textarea
                value={keyResponsibilities}
                onChange={(e) => setKeyResponsibilities(e.target.value)}
                placeholder="e.g., Implement combat system, optimize server performance, create admin commands..."
                className="bg-white/5 border-white/20 text-white h-24"
              />
              <p className="text-gray-500 text-xs mt-1">
                Optional: Provide key responsibilities to get a more tailored description
              </p>
            </div>

            <Button
              onClick={generateJobDescription}
              disabled={generating || !jobTitle.trim()}
              className="w-full btn-primary text-white"
            >
              {generating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Job Description
                </>
              )}
            </Button>
          </TabsContent>

          {/* Refine Tab */}
          <TabsContent value="refine" className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Job Title *
              </label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Enter job title"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Current Description *
              </label>
              <Textarea
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                placeholder="Paste your current job description here..."
                className="bg-white/5 border-white/20 text-white h-40"
              />
            </div>

            <Button
              onClick={refineDescription}
              disabled={refining || !currentDescription.trim() || !jobTitle.trim()}
              className="w-full btn-primary text-white"
            >
              {refining ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Refining...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refine Description
                </>
              )}
            </Button>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            {generatedContent && (
              <>
                {/* Generated Description */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Generated Description</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(generatedContent.full_description)}
                      className="glass-card border-0 text-white hover:bg-white/5"
                    >
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="glass-card rounded-lg p-4 bg-white/5">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {generatedContent.full_description}
                    </p>
                  </div>
                </div>

                {/* Overview */}
                {generatedContent.overview && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Quick Overview</h3>
                    <div className="glass-card rounded-lg p-4 bg-indigo-500/10">
                      <p className="text-gray-300 text-sm">{generatedContent.overview}</p>
                    </div>
                  </div>
                )}

                {/* Why Exciting */}
                {generatedContent.why_exciting && generatedContent.why_exciting.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-green-400" />
                      <h3 className="text-white font-semibold">Why This is Exciting</h3>
                    </div>
                    <div className="space-y-2">
                      {generatedContent.why_exciting.map((reason, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-sm">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Responsibilities */}
                {generatedContent.key_responsibilities && generatedContent.key_responsibilities.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Key Responsibilities</h3>
                    <div className="space-y-2">
                      {generatedContent.key_responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0 mt-2"></div>
                          <p className="text-gray-300 text-sm">{resp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                <div className="grid md:grid-cols-2 gap-4">
                  {generatedContent.required_skills && generatedContent.required_skills.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.required_skills.map((skill, i) => (
                          <Badge key={i} className="bg-red-500/20 text-red-300 border-0">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedContent.preferred_skills && generatedContent.preferred_skills.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Preferred Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.preferred_skills.map((skill, i) => (
                          <Badge key={i} className="bg-blue-500/20 text-blue-300 border-0">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestions from Refine */}
                {suggestions?.clarity_score !== undefined && (
                  <div className="glass-card rounded-lg p-4 bg-purple-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <h3 className="text-white font-semibold">AI Analysis</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Clarity Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                              style={{ width: `${suggestions.clarity_score}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-bold text-sm">{suggestions.clarity_score}/100</span>
                        </div>
                      </div>

                      {suggestions.tone_analysis && (
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Tone Analysis</p>
                          <p className="text-gray-300 text-sm">{suggestions.tone_analysis}</p>
                        </div>
                      )}

                      {suggestions.improvements_made && suggestions.improvements_made.length > 0 && (
                        <div>
                          <p className="text-gray-400 text-xs mb-2">Improvements Made</p>
                          <div className="space-y-1">
                            {suggestions.improvements_made.map((imp, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <Check className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-300 text-xs">{imp}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {suggestions.missing_elements && suggestions.missing_elements.length > 0 && (
                        <div>
                          <p className="text-yellow-400 text-xs mb-2">Consider Adding</p>
                          <div className="space-y-1">
                            {suggestions.missing_elements.map((elem, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-300 text-xs">{elem}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid md:grid-cols-3 gap-3">
                  {generatedContent.experience_level && (
                    <div className="glass-card rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Experience Level</p>
                      <Badge className="bg-purple-500/20 text-purple-300 border-0">
                        {generatedContent.experience_level}
                      </Badge>
                    </div>
                  )}

                  {generatedContent.project_scope && (
                    <div className="glass-card rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Project Scope</p>
                      <Badge className="bg-blue-500/20 text-blue-300 border-0">
                        {generatedContent.project_scope}
                      </Badge>
                    </div>
                  )}

                  {generatedContent.estimated_timeline && (
                    <div className="glass-card rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Timeline</p>
                      <Badge className="bg-green-500/20 text-green-300 border-0">
                        {generatedContent.estimated_timeline}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Suggested Roles */}
                {generatedContent.suggested_roles && generatedContent.suggested_roles.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Recommended Roles</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.suggested_roles.map((role, i) => (
                        <Badge key={i} className="bg-indigo-500/20 text-indigo-300 border-0">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={applyToJobForm}
                    className="flex-1 btn-primary text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Use This Description
                  </Button>
                  <Button
                    onClick={() => {
                      setGeneratedContent(null);
                      setSuggestions(null);
                      setActiveTab("generate");
                    }}
                    variant="outline"
                    className="glass-card border-0 text-white hover:bg-white/5"
                  >
                    Start Over
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}