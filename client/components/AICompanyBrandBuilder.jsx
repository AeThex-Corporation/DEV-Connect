import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  Building2,
  Target,
  Users,
  MessageSquare,
  Award,
  TrendingUp,
  CheckCircle,
  Copy
} from 'lucide-react';

export default function AICompanyBrandBuilder({ companyProfile, user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [brandStrategy, setBrandStrategy] = useState(null);

  const generateBrandStrategy = async () => {
    setLoading(true);
    try {
      const [jobs, reviews, hiredDevelopers] = await Promise.all([
        base44.entities.Job.filter({ employer_id: user.id }),
        base44.entities.CompanyReview.filter({ company_profile_id: companyProfile?.id || '' }),
        base44.entities.Application.filter({ status: 'Accepted' })
      ]);

      const prompt = `You are an AI employer branding expert. Create a comprehensive brand strategy for this company to attract top Roblox developers.

COMPANY PROFILE:
Name: ${companyProfile?.company_name || user.full_name}
Industry: ${companyProfile?.industry || 'Not specified'}
Size: ${companyProfile?.company_size || 'Not specified'}
Founded: ${companyProfile?.founded_year || 'Not specified'}
Current Description: ${companyProfile?.description || 'Not provided'}
Mission: ${companyProfile?.mission || 'Not provided'}
Culture Values: ${companyProfile?.culture_values?.join(', ') || 'Not specified'}
Tech Stack: ${companyProfile?.tech_stack?.join(', ') || 'Not specified'}
Perks/Benefits: ${companyProfile?.perks_benefits?.map(p => p.title).join(', ') || 'Not specified'}

CURRENT ACTIVITY:
- Jobs Posted: ${jobs.length}
- Active Jobs: ${jobs.filter(j => j.status === 'Open').length}
- Company Reviews: ${reviews.length}
- Average Rating: ${reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'No reviews'}
- Developers Hired: ${hiredDevelopers.filter(a => jobs.some(j => j.id === a.job_id)).length}

MARKET CONTEXT:
Recent Jobs Posted: ${jobs.slice(0, 5).map(j => `
- ${j.title}: ${j.required_roles?.join(', ')} - ${j.budget_range}
`).join('\n')}

GENERATE COMPREHENSIVE BRANDING STRATEGY including:
1. Compelling company description optimized for developer attraction
2. Clear, inspiring mission statement
3. Unique value propositions for developers
4. Culture highlights that resonate with top talent
5. Interview questions aligned with company values
6. Content strategy for job postings and updates
7. Employer brand positioning`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            company_description: {
              type: "object",
              properties: {
                short_version: { 
                  type: "string",
                  description: "Elevator pitch (2-3 sentences)"
                },
                full_version: { 
                  type: "string",
                  description: "Complete company description"
                },
                tagline: { type: "string" },
                key_differentiators: {
                  type: "array",
                  items: { type: "string" }
                },
                seo_keywords: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            mission_statement: {
              type: "object",
              properties: {
                mission: { type: "string" },
                vision: { type: "string" },
                core_values: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      value: { type: "string" },
                      description: { type: "string" },
                      how_demonstrated: { type: "string" }
                    }
                  }
                }
              }
            },
            developer_value_propositions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: ["growth", "compensation", "culture", "impact", "flexibility", "innovation"]
                  },
                  headline: { type: "string" },
                  description: { type: "string" },
                  proof_points: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            culture_highlights: {
              type: "object",
              properties: {
                work_environment: { type: "string" },
                collaboration_style: { type: "string" },
                decision_making: { type: "string" },
                growth_opportunities: { type: "string" },
                team_dynamics: { type: "string" },
                developer_autonomy: { type: "string" }
              }
            },
            interview_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  category: {
                    type: "string",
                    enum: ["technical", "cultural_fit", "problem_solving", "collaboration", "values_alignment"]
                  },
                  why_ask: { type: "string" },
                  good_answer_indicators: {
                    type: "array",
                    items: { type: "string" }
                  },
                  red_flags: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            job_posting_templates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  opening_hook: { type: "string" },
                  company_pitch: { type: "string" },
                  role_description: { type: "string" },
                  ideal_candidate: { type: "string" },
                  call_to_action: { type: "string" }
                }
              }
            },
            content_strategy: {
              type: "object",
              properties: {
                post_frequency: { type: "string" },
                content_themes: {
                  type: "array",
                  items: { type: "string" }
                },
                suggested_updates: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      content: { type: "string" },
                      category: { type: "string" },
                      timing: { type: "string" }
                    }
                  }
                }
              }
            },
            brand_positioning: {
              type: "object",
              properties: {
                market_position: { type: "string" },
                target_developer_personas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      persona_name: { type: "string" },
                      description: { type: "string" },
                      what_they_value: {
                        type: "array",
                        items: { type: "string" }
                      },
                      how_to_attract: { type: "string" }
                    }
                  }
                },
                competitive_advantages: {
                  type: "array",
                  items: { type: "string" }
                },
                messaging_dos: {
                  type: "array",
                  items: { type: "string" }
                },
                messaging_donts: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "number" },
                  action: { type: "string" },
                  expected_impact: { type: "string" },
                  timeframe: { type: "string" }
                }
              }
            }
          }
        }
      });

      setBrandStrategy(response);

    } catch (error) {
      console.error('Error generating brand strategy:', error);
      alert('Failed to generate brand strategy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyBranding = async (type) => {
    if (!brandStrategy || !companyProfile) return;

    try {
      const updates = {};

      if (type === 'description') {
        updates.description = brandStrategy.company_description.full_version;
        updates.tagline = brandStrategy.company_description.tagline;
      } else if (type === 'mission') {
        updates.mission = brandStrategy.mission_statement.mission;
        updates.culture_values = brandStrategy.mission_statement.core_values.map(v => v.value);
      } else if (type === 'all') {
        updates.description = brandStrategy.company_description.full_version;
        updates.tagline = brandStrategy.company_description.tagline;
        updates.mission = brandStrategy.mission_statement.mission;
        updates.culture_values = brandStrategy.mission_statement.core_values.map(v => v.value);
      }

      await base44.entities.CompanyProfile.update(companyProfile.id, updates);
      
      if (onUpdate) onUpdate();
      alert('✅ Company profile updated successfully!');

    } catch (error) {
      console.error('Error applying branding:', error);
      alert('Failed to update company profile. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('📋 Copied to clipboard!');
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🤖 AI is crafting your brand strategy...</p>
          <p className="text-gray-400 text-sm">Analyzing market positioning and developer preferences</p>
        </CardContent>
      </Card>
    );
  }

  if (!brandStrategy) {
    return (
      <Card className="glass-card border-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Company Brand Builder
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Generate compelling company branding, mission statements, and interview questions to attract top developer talent
          </p>
          <Button
            onClick={generateBrandStrategy}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-lg px-8 py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Brand Strategy
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="description">
            <Building2 className="w-4 h-4 mr-2" />
            Description
          </TabsTrigger>
          <TabsTrigger value="mission">
            <Target className="w-4 h-4 mr-2" />
            Mission
          </TabsTrigger>
          <TabsTrigger value="culture">
            <Users className="w-4 h-4 mr-2" />
            Culture
          </TabsTrigger>
          <TabsTrigger value="interview">
            <MessageSquare className="w-4 h-4 mr-2" />
            Interview
          </TabsTrigger>
          <TabsTrigger value="positioning">
            <TrendingUp className="w-4 h-4 mr-2" />
            Positioning
          </TabsTrigger>
        </TabsList>

        {/* Company Description */}
        <TabsContent value="description">
          <div className="space-y-4">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Company Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold">Tagline:</p>
                    <Button
                      onClick={() => copyToClipboard(brandStrategy.company_description.tagline)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-white font-semibold text-lg italic">
                      "{brandStrategy.company_description.tagline}"
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold">Elevator Pitch:</p>
                    <Button
                      onClick={() => copyToClipboard(brandStrategy.company_description.short_version)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-300 text-sm">{brandStrategy.company_description.short_version}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold">Full Description:</p>
                    <Button
                      onClick={() => copyToClipboard(brandStrategy.company_description.full_version)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <Textarea
                    value={brandStrategy.company_description.full_version}
                    readOnly
                    className="bg-white/5 border-white/10 text-white min-h-[200px]"
                  />
                </div>

                <div>
                  <p className="text-white font-semibold mb-2">Key Differentiators:</p>
                  <div className="space-y-2">
                    {brandStrategy.company_description.key_differentiators?.map((diff, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-300 text-sm">{diff}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => applyBranding('description')}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                >
                  Apply Description & Tagline
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mission & Values */}
        <TabsContent value="mission">
          <div className="space-y-4">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Mission & Vision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold">Mission Statement:</p>
                    <Button
                      onClick={() => copyToClipboard(brandStrategy.mission_statement.mission)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-white">{brandStrategy.mission_statement.mission}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold">Vision Statement:</p>
                    <Button
                      onClick={() => copyToClipboard(brandStrategy.mission_statement.vision)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-white">{brandStrategy.mission_statement.vision}</p>
                  </div>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">Core Values:</p>
                  <div className="space-y-3">
                    {brandStrategy.mission_statement.core_values?.map((value, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-1">{value.value}</h4>
                        <p className="text-gray-400 text-sm mb-2">{value.description}</p>
                        <p className="text-blue-400 text-xs">💡 {value.how_demonstrated}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => applyBranding('mission')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                >
                  Apply Mission & Values
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Culture Highlights */}
        <TabsContent value="culture">
          <div className="space-y-4">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Culture Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(brandStrategy.culture_highlights || {}).map(([key, value], i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4">
                    <p className="text-purple-400 font-semibold text-sm mb-2 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </p>
                    <p className="text-gray-300 text-sm">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Developer Value Propositions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {brandStrategy.developer_value_propositions?.map((vp, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-500/20 text-green-400 border-0 capitalize">
                        {vp.category}
                      </Badge>
                      <h4 className="text-white font-semibold">{vp.headline}</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{vp.description}</p>
                    <div className="space-y-1">
                      {vp.proof_points?.map((point, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-300 text-xs">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interview Questions */}
        <TabsContent value="interview">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Values-Aligned Interview Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {brandStrategy.interview_questions?.map((q, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs mb-2 capitalize">
                        {q.category.replace(/_/g, ' ')}
                      </Badge>
                      <p className="text-white font-semibold mb-2">{q.question}</p>
                      <p className="text-gray-400 text-sm mb-3">{q.why_ask}</p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(q.question)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="bg-green-500/10 rounded p-3 border border-green-500/20">
                      <p className="text-green-400 font-semibold text-xs mb-2">✅ Good Answer Indicators:</p>
                      <ul className="space-y-1">
                        {q.good_answer_indicators?.map((indicator, j) => (
                          <li key={j} className="text-gray-300 text-xs">• {indicator}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-500/10 rounded p-3 border border-red-500/20">
                      <p className="text-red-400 font-semibold text-xs mb-2">🚩 Red Flags:</p>
                      <ul className="space-y-1">
                        {q.red_flags?.map((flag, j) => (
                          <li key={j} className="text-gray-300 text-xs">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Job Posting Templates */}
          <Card className="glass-card border-0 mt-4">
            <CardHeader>
              <CardTitle className="text-white">Job Posting Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {brandStrategy.job_posting_templates?.slice(0, 3).map((template, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3">{template.role}</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-purple-400 font-semibold mb-1">Opening Hook:</p>
                      <p className="text-gray-300">{template.opening_hook}</p>
                    </div>
                    <div>
                      <p className="text-purple-400 font-semibold mb-1">Company Pitch:</p>
                      <p className="text-gray-300">{template.company_pitch}</p>
                    </div>
                    <div>
                      <p className="text-purple-400 font-semibold mb-1">Call to Action:</p>
                      <p className="text-gray-300">{template.call_to_action}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(`${template.opening_hook}\n\n${template.company_pitch}\n\n${template.role_description}\n\n${template.ideal_candidate}\n\n${template.call_to_action}`)}
                    size="sm"
                    className="w-full mt-3 glass-card border-0 text-white hover:bg-white/5"
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy Full Template
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Positioning */}
        <TabsContent value="positioning">
          <div className="space-y-4">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Brand Positioning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <p className="text-blue-400 font-semibold mb-2">Market Position:</p>
                  <p className="text-white">{brandStrategy.brand_positioning?.market_position}</p>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">Competitive Advantages:</p>
                  <div className="space-y-2">
                    {brandStrategy.brand_positioning?.competitive_advantages?.map((adv, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-300 text-sm">{adv}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">Target Developer Personas:</p>
                  <div className="space-y-3">
                    {brandStrategy.brand_positioning?.target_developer_personas?.map((persona, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-purple-400 font-semibold mb-2">{persona.persona_name}</h4>
                        <p className="text-gray-400 text-sm mb-2">{persona.description}</p>
                        <div className="mb-2">
                          <p className="text-gray-500 text-xs mb-1">Values:</p>
                          <div className="flex flex-wrap gap-1">
                            {persona.what_they_value?.map((value, j) => (
                              <Badge key={j} className="bg-green-500/20 text-green-400 border-0 text-xs">
                                {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="bg-blue-500/10 rounded p-2 border border-blue-500/20">
                          <p className="text-blue-400 text-xs font-semibold mb-1">How to Attract:</p>
                          <p className="text-gray-300 text-xs">{persona.how_to_attract}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white font-semibold mb-2">✅ Messaging Do's:</p>
                    <div className="space-y-1">
                      {brandStrategy.brand_positioning?.messaging_dos?.map((item, i) => (
                        <p key={i} className="text-gray-300 text-sm">• {item}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-2">❌ Messaging Don'ts:</p>
                    <div className="space-y-1">
                      {brandStrategy.brand_positioning?.messaging_donts?.map((item, i) => (
                        <p key={i} className="text-gray-300 text-sm">• {item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Plan */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Implementation Action Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {brandStrategy.action_plan?.map((action, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-4 flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 font-bold">{action.priority}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold mb-1">{action.action}</p>
                        <p className="text-gray-400 text-sm mb-1">{action.expected_impact}</p>
                        <p className="text-gray-500 text-xs">Timeframe: {action.timeframe}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => applyBranding('all')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg py-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Apply All Branding Updates
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}