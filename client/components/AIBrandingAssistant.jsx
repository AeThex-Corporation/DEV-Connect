
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
  Palette,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  RefreshCw
} from "lucide-react";

export default function AIBrandingAssistant({ companyProfile, onApply, onClose }) {
  const [loading, setLoading] = useState(false);
  const [activeService, setActiveService] = useState(null);
  
  // Logo Generation
  const [logoPrompt, setLogoPrompt] = useState("");
  const [generatedLogos, setGeneratedLogos] = useState([]);
  const [generatingLogo, setGeneratingLogo] = useState(false);

  // Color Palette
  const [colorPalettes, setColorPalettes] = useState([]);
  const [generatingColors, setGeneratingColors] = useState(false);

  // Copy/Description
  const [copyInput, setCopyInput] = useState({
    keywords: "",
    mission: "",
    industry: companyProfile?.industry || ""
  });
  const [generatedCopy, setGeneratedCopy] = useState(null);
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  const generateLogo = async () => {
    if (!logoPrompt.trim() && !companyProfile?.company_name) {
      alert('Please provide company name or description');
      return;
    }

    setGeneratingLogo(true);
    try {
      const prompt = logoPrompt.trim() || 
        `Modern, professional logo for ${companyProfile?.company_name}, a ${companyProfile?.industry} company. Clean, minimalist design with vibrant colors. Company tagline: ${companyProfile?.tagline || 'innovative and creative'}. Logo should be iconic, memorable, and work on both light and dark backgrounds.`;

      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: prompt
      });

      setGeneratedLogos([url, ...generatedLogos]);
    } catch (error) {
      console.error('Error generating logo:', error);
      alert('Failed to generate logo. Please try again.');
    } finally {
      setGeneratingLogo(false);
    }
  };

  const generateColorPalette = async () => {
    setGeneratingColors(true);
    try {
      const prompt = `
You are a professional brand designer. Generate 5 unique brand color palettes for ${companyProfile?.company_name || 'a company'}.

Company Information:
- Industry: ${companyProfile?.industry || 'Not specified'}
- Mission: ${companyProfile?.mission || 'Not specified'}
- Tagline: ${companyProfile?.tagline || 'Not specified'}
- Target Audience: ${companyProfile?.industry === 'Gaming' ? 'Gamers, developers, studios' : companyProfile?.industry === 'Education' ? 'Students, educators, institutions' : 'General audience'}

Each palette should include:
- Primary color (main brand color)
- Secondary color (supporting color)
- Accent color (for CTAs and highlights)
- Reasoning for why this palette fits the brand

Consider:
- Industry standards and psychological impact of colors
- Brand personality (professional, playful, innovative, trustworthy, etc.)
- Cultural associations and accessibility
- Modern design trends while being timeless

Provide diverse options ranging from bold to subtle.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            palettes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  primary: { type: "string" },
                  secondary: { type: "string" },
                  accent: { type: "string" },
                  description: { type: "string" },
                  personality: { type: "string" },
                  best_for: { type: "string" }
                }
              }
            }
          }
        }
      });

      setColorPalettes(response.palettes || []);
    } catch (error) {
      console.error('Error generating color palettes:', error);
      alert('Failed to generate color palettes. Please try again.');
    } finally {
      setGeneratingColors(false);
    }
  };

  const generateCopy = async () => {
    if (!copyInput.keywords.trim() && !companyProfile?.company_name) {
      alert('Please provide some information about your company');
      return;
    }

    setGeneratingCopy(true);
    try {
      const prompt = `
You are an expert copywriter specializing in brand messaging. Create compelling copy for ${companyProfile?.company_name || 'a company'}.

Company Information:
- Name: ${companyProfile?.company_name || 'Not specified'}
- Industry: ${copyInput.industry || companyProfile?.industry}
- Mission: ${copyInput.mission || companyProfile?.mission || 'Not specified'}
- Keywords/Focus: ${copyInput.keywords}
- Current Description: ${companyProfile?.description || 'None'}
- Current Tagline: ${companyProfile?.tagline || 'None'}

Generate:
1. 5 tagline options (short, memorable, captures essence)
2. 3 company description variations:
   - Short (2-3 sentences, elevator pitch)
   - Medium (4-5 sentences, comprehensive overview)
   - Long (detailed, includes mission, values, what makes them unique)
3. Mission statement (inspiring, clear purpose)
4. Value propositions (3-5 key benefits they offer)

Make the copy:
- Authentic and genuine
- Industry-appropriate
- Action-oriented and engaging
- Clear and concise
- Differentiated from competitors
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            taglines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  tone: { type: "string" }
                }
              }
            },
            descriptions: {
              type: "object",
              properties: {
                short: { type: "string" },
                medium: { type: "string" },
                long: { type: "string" }
              }
            },
            mission_statement: { type: "string" },
            value_propositions: {
              type: "array",
              items: { type: "string" }
            },
            brand_voice_notes: { type: "string" }
          }
        }
      });

      setGeneratedCopy(response);
    } catch (error) {
      console.error('Error generating copy:', error);
      alert('Failed to generate copy. Please try again.');
    } finally {
      setGeneratingCopy(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl my-8">
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-white">AI Branding Assistant</CardTitle>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              Let AI help you create professional branding for your company
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="logo" className="w-full">
              <TabsList className="glass-card border-0 mb-4">
                <TabsTrigger value="logo">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Logo
                </TabsTrigger>
                <TabsTrigger value="colors">
                  <Palette className="w-4 h-4 mr-2" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="copy">
                  <FileText className="w-4 h-4 mr-2" />
                  Copy & Taglines
                </TabsTrigger>
              </TabsList>

              {/* Logo Generation Tab */}
              <TabsContent value="logo">
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Describe Your Logo Vision (Optional)
                    </label>
                    <Textarea
                      value={logoPrompt}
                      onChange={(e) => setLogoPrompt(e.target.value)}
                      placeholder={`E.g., "Modern tech logo with gradient colors" or leave blank for AI to use your company info`}
                      className="bg-white/5 border-white/20 text-white h-20"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Leave blank to auto-generate based on: {companyProfile?.company_name} - {companyProfile?.industry}
                    </p>
                  </div>

                  <Button
                    onClick={generateLogo}
                    disabled={generatingLogo}
                    className="btn-primary text-white"
                  >
                    {generatingLogo ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Generating Logo...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Logo
                      </>
                    )}
                  </Button>

                  {generatedLogos.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-gray-300 text-sm font-medium">Generated Logos:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {generatedLogos.map((logo, i) => (
                          <div key={i} className="glass-card rounded-lg p-3 group">
                            <img 
                              src={logo} 
                              alt={`Generated Logo ${i + 1}`}
                              className="w-full h-32 object-contain bg-white/5 rounded mb-2"
                            />
                            <Button
                              onClick={() => onApply({ logo_url: logo })}
                              size="sm"
                              className="w-full btn-primary text-white"
                            >
                              Use This Logo
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={generateLogo}
                        size="sm"
                        variant="outline"
                        className="glass-card border-0 text-white hover:bg-white/5"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate More
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Color Palette Tab */}
              <TabsContent value="colors">
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    AI will analyze your industry, mission, and brand personality to suggest professional color palettes.
                  </p>

                  <Button
                    onClick={generateColorPalette}
                    disabled={generatingColors}
                    className="btn-primary text-white"
                  >
                    {generatingColors ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Analyzing Brand...
                      </>
                    ) : (
                      <>
                        <Palette className="w-4 h-4 mr-2" />
                        Generate Color Palettes
                      </>
                    )}
                  </Button>

                  {colorPalettes.length > 0 && (
                    <div className="space-y-4">
                      {colorPalettes.map((palette, i) => (
                        <Card key={i} className="glass-card border-0 bg-white/5">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-white font-semibold mb-1">{palette.name}</h4>
                                <p className="text-gray-400 text-xs mb-2">{palette.description}</p>
                                <div className="flex gap-2 mb-2">
                                  <Badge className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                                    {palette.personality}
                                  </Badge>
                                  <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                                    {palette.best_for}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                onClick={() => onApply({
                                  brand_colors: {
                                    primary: palette.primary,
                                    secondary: palette.secondary,
                                    accent: palette.accent
                                  }
                                })}
                                size="sm"
                                className="btn-primary text-white"
                              >
                                Use Palette
                              </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <div 
                                  className="h-16 rounded-lg mb-1"
                                  style={{ backgroundColor: palette.primary }}
                                />
                                <p className="text-gray-400 text-xs">Primary</p>
                                <p className="text-white text-xs font-mono">{palette.primary}</p>
                              </div>
                              <div>
                                <div 
                                  className="h-16 rounded-lg mb-1"
                                  style={{ backgroundColor: palette.secondary }}
                                />
                                <p className="text-gray-400 text-xs">Secondary</p>
                                <p className="text-white text-xs font-mono">{palette.secondary}</p>
                              </div>
                              <div>
                                <div 
                                  className="h-16 rounded-lg mb-1"
                                  style={{ backgroundColor: palette.accent }}
                                />
                                <p className="text-gray-400 text-xs">Accent</p>
                                <p className="text-white text-xs font-mono">{palette.accent}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Copy & Taglines Tab */}
              <TabsContent value="copy">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">Keywords/Focus Areas</label>
                      <Input
                        value={copyInput.keywords}
                        onChange={(e) => setCopyInput({...copyInput, keywords: e.target.value})}
                        placeholder="innovation, collaboration, quality"
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">Industry</label>
                      <Input
                        value={copyInput.industry}
                        onChange={(e) => setCopyInput({...copyInput, industry: e.target.value})}
                        placeholder={companyProfile?.industry}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Mission/Vision (Optional)</label>
                    <Textarea
                      value={copyInput.mission}
                      onChange={(e) => setCopyInput({...copyInput, mission: e.target.value})}
                      placeholder="What drives your company? What impact do you want to make?"
                      className="bg-white/5 border-white/20 text-white h-20"
                    />
                  </div>

                  <Button
                    onClick={generateCopy}
                    disabled={generatingCopy}
                    className="btn-primary text-white"
                  >
                    {generatingCopy ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Crafting Copy...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Copy
                      </>
                    )}
                  </Button>

                  {generatedCopy && (
                    <div className="space-y-4">
                      {/* Taglines */}
                      <Card className="glass-card border-0 bg-white/5">
                        <CardContent className="p-4">
                          <h4 className="text-white font-semibold mb-3">Tagline Options</h4>
                          <div className="space-y-2">
                            {generatedCopy.taglines?.map((tagline, i) => (
                              <div key={i} className="glass-card rounded-lg p-3 flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-white">{tagline.text}</p>
                                  <p className="text-gray-400 text-xs">{tagline.tone}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => copyToClipboard(tagline.text, `tagline-${i}`)}
                                    size="sm"
                                    variant="outline"
                                    className="glass-card border-0 text-white hover:bg-white/5"
                                  >
                                    {copiedText === `tagline-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    onClick={() => onApply({ tagline: tagline.text })}
                                    size="sm"
                                    className="btn-primary text-white"
                                  >
                                    Use
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Descriptions */}
                      <Card className="glass-card border-0 bg-white/5">
                        <CardContent className="p-4">
                          <h4 className="text-white font-semibold mb-3">Company Descriptions</h4>
                          <div className="space-y-3">
                            {['short', 'medium', 'long'].map((length) => (
                              <div key={length}>
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs capitalize">
                                    {length}
                                  </Badge>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => copyToClipboard(generatedCopy.descriptions[length], `desc-${length}`)}
                                      size="sm"
                                      variant="outline"
                                      className="glass-card border-0 text-white hover:bg-white/5"
                                    >
                                      {copiedText === `desc-${length}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                      onClick={() => onApply({ description: generatedCopy.descriptions[length] })}
                                      size="sm"
                                      className="btn-primary text-white"
                                    >
                                      Use
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-gray-300 text-sm glass-card rounded-lg p-3">
                                  {generatedCopy.descriptions[length]}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Mission Statement */}
                      {generatedCopy.mission_statement && (
                        <Card className="glass-card border-0 bg-white/5">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-semibold">Mission Statement</h4>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => copyToClipboard(generatedCopy.mission_statement, 'mission')}
                                  size="sm"
                                  variant="outline"
                                  className="glass-card border-0 text-white hover:bg-white/5"
                                >
                                  {copiedText === 'mission' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                                <Button
                                  onClick={() => onApply({ mission: generatedCopy.mission_statement })}
                                  size="sm"
                                  className="btn-primary text-white"
                                >
                                  Use
                                </Button>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm">{generatedCopy.mission_statement}</p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Value Propositions */}
                      {generatedCopy.value_propositions?.length > 0 && (
                        <Card className="glass-card border-0 bg-white/5">
                          <CardContent className="p-4">
                            <h4 className="text-white font-semibold mb-3">Value Propositions</h4>
                            <div className="space-y-2">
                              {generatedCopy.value_propositions.map((value, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-green-400 mt-1">✓</span>
                                  <p className="text-gray-300 text-sm flex-1">{value}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Brand Voice Notes */}
                      {generatedCopy.brand_voice_notes && (
                        <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                              <div>
                                <h4 className="text-white font-semibold mb-1">Brand Voice Notes</h4>
                                <p className="text-gray-300 text-sm">{generatedCopy.brand_voice_notes}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
