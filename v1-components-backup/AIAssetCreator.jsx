import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Image as ImageIcon,
  Code,
  FileText,
  Copy,
  Check,
  Download,
  Wand2
} from "lucide-react";

export default function AIAssetCreator({ onAssetCreated }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [codePrompt, setCodePrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [assetDetails, setAssetDetails] = useState({
    name: "",
    category: "",
    purpose: ""
  });
  const [generatedDescription, setGeneratedDescription] = useState(null);

  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      alert('Please enter an image description');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `High-quality Roblox game asset: ${imagePrompt}. Professional, game-ready, detailed, vibrant colors, clean design.`
      });

      setGeneratedImage(result.url);

      // Award XP for using AI tool
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        xp_points: (user.xp_points || 0) + 25
      });

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🎨 AI Image Generated!',
        message: 'You earned 25 XP for using AI tools',
        metadata: { xp_gained: 25 }
      });

    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    if (!codePrompt.trim()) {
      alert('Please describe the code you need');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate clean, well-commented Roblox Lua code for: ${codePrompt}
        
Requirements:
- Use modern Lua best practices
- Include helpful comments
- Follow Roblox coding standards
- Make it production-ready
- Include error handling where appropriate

Provide ONLY the code, no explanations.`,
        response_json_schema: {
          type: "object",
          properties: {
            code: { type: "string" },
            language: { type: "string" },
            description: { type: "string" },
            usage_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setGeneratedCode(result);

      // Award XP
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        xp_points: (user.xp_points || 0) + 25
      });

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '💻 AI Code Generated!',
        message: 'You earned 25 XP for using AI tools',
        metadata: { xp_gained: 25 }
      });

    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async () => {
    if (!assetDetails.name.trim() || !assetDetails.category.trim()) {
      alert('Please fill in asset name and category');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a compelling marketplace asset listing for a Roblox ${assetDetails.category}.

Asset Name: ${assetDetails.name}
Purpose/Features: ${assetDetails.purpose}

Generate:
1. A catchy title (optimize for searchability)
2. A detailed, professional description (2-3 paragraphs)
3. Key features list (5-7 bullet points)
4. SEO-friendly tags (8-10 tags)
5. Suggested pricing tier (budget/mid-tier/premium with reasoning)

Make it compelling to potential buyers while being honest and accurate.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            key_features: {
              type: "array",
              items: { type: "string" }
            },
            tags: {
              type: "array",
              items: { type: "string" }
            },
            pricing_suggestion: {
              type: "object",
              properties: {
                tier: { type: "string" },
                reasoning: { type: "string" }
              }
            }
          }
        }
      });

      setGeneratedDescription(result);

      // Award XP
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        xp_points: (user.xp_points || 0) + 25
      });

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '✨ AI Description Generated!',
        message: 'You earned 25 XP for using AI tools',
        metadata: { xp_gained: 25 }
      });

    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-white font-semibold text-xl">AI Asset Creation Tools</h2>
              <p className="text-gray-400 text-sm">Powered by AI to help you create amazing assets faster</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="image" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="image">
            <ImageIcon className="w-4 h-4 mr-2" />
            Generate Images
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code className="w-4 h-4 mr-2" />
            Generate Code
          </TabsTrigger>
          <TabsTrigger value="description">
            <FileText className="w-4 h-4 mr-2" />
            Write Descriptions
          </TabsTrigger>
        </TabsList>

        {/* Image Generation */}
        <TabsContent value="image">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">AI Image Generator</CardTitle>
              <p className="text-gray-400 text-sm">Create custom assets from text descriptions</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Describe Your Image
                </label>
                <Textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="E.g., A futuristic sci-fi weapon with glowing blue accents, cyberpunk style..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 min-h-24"
                />
              </div>

              <Button
                onClick={generateImage}
                disabled={loading}
                className="w-full btn-primary text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              {generatedImage && (
                <div className="glass-card rounded-lg p-4 space-y-3">
                  <img
                    src={generatedImage}
                    alt="Generated asset"
                    className="w-full rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                      asChild
                    >
                      <a href={generatedImage} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                      onClick={() => copyToClipboard(generatedImage)}
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      Copy URL
                    </Button>
                  </div>
                </div>
              )}

              <div className="glass-card rounded-lg p-4 bg-blue-500/5">
                <p className="text-blue-400 text-sm font-medium mb-2">💡 Pro Tips:</p>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Be specific about style, colors, and materials</li>
                  <li>• Mention "Roblox game asset" for better results</li>
                  <li>• Include lighting preferences (glowing, neon, etc.)</li>
                  <li>• Specify if you want isometric or perspective view</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Generation */}
        <TabsContent value="code">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">AI Code Generator</CardTitle>
              <p className="text-gray-400 text-sm">Generate Roblox Lua scripts instantly</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Describe What You Need
                </label>
                <Textarea
                  value={codePrompt}
                  onChange={(e) => setCodePrompt(e.target.value)}
                  placeholder="E.g., A proximity prompt system that awards points when players touch a part..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 min-h-24"
                />
              </div>

              <Button
                onClick={generateCode}
                disabled={loading}
                className="w-full btn-primary text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>

              {generatedCode && (
                <div className="space-y-4">
                  <div className="glass-card rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-purple-500/20 text-purple-400 border-0">
                        {generatedCode.language || 'Lua'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedCode.code)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
                      <code className="text-gray-300 text-sm">{generatedCode.code}</code>
                    </pre>
                  </div>

                  {generatedCode.description && (
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-white font-medium mb-2">How It Works:</p>
                      <p className="text-gray-300 text-sm">{generatedCode.description}</p>
                    </div>
                  )}

                  {generatedCode.usage_tips && generatedCode.usage_tips.length > 0 && (
                    <div className="glass-card rounded-lg p-4">
                      <p className="text-white font-medium mb-2">Usage Tips:</p>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {generatedCode.usage_tips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="glass-card rounded-lg p-4 bg-purple-500/5">
                <p className="text-purple-400 text-sm font-medium mb-2">💡 Pro Tips:</p>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Specify if it's a server script or local script</li>
                  <li>• Mention specific Roblox services you want to use</li>
                  <li>• Describe the expected behavior clearly</li>
                  <li>• Request error handling if needed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Description Writer */}
        <TabsContent value="description">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">AI Description Writer</CardTitle>
              <p className="text-gray-400 text-sm">Create compelling asset listings automatically</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Asset Name</label>
                <Input
                  value={assetDetails.name}
                  onChange={(e) => setAssetDetails({...assetDetails, name: e.target.value})}
                  placeholder="E.g., Advanced Admin Commands System"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Category</label>
                <Input
                  value={assetDetails.category}
                  onChange={(e) => setAssetDetails({...assetDetails, category: e.target.value})}
                  placeholder="E.g., Script, UI Kit, Model, etc."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Key Features / Purpose (Optional)
                </label>
                <Textarea
                  value={assetDetails.purpose}
                  onChange={(e) => setAssetDetails({...assetDetails, purpose: e.target.value})}
                  placeholder="Briefly describe what it does and its main features..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 min-h-20"
                />
              </div>

              <Button
                onClick={generateDescription}
                disabled={loading}
                className="w-full btn-primary text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Description
                  </>
                )}
              </Button>

              {generatedDescription && (
                <div className="space-y-4">
                  <div className="glass-card rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-semibold">Suggested Title</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedDescription.title)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-gray-300">{generatedDescription.title}</p>
                  </div>

                  <div className="glass-card rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-semibold">Description</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedDescription.description)}
                        className="text-gray-400 hover:text-white"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{generatedDescription.description}</p>
                  </div>

                  <div className="glass-card rounded-lg p-4">
                    <p className="text-white font-semibold mb-3">Key Features</p>
                    <ul className="text-gray-300 space-y-2">
                      {generatedDescription.key_features?.map((feature, i) => (
                        <li key={i}>✓ {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-card rounded-lg p-4">
                    <p className="text-white font-semibold mb-3">Suggested Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedDescription.tags?.map((tag, i) => (
                        <Badge key={i} className="bg-indigo-500/20 text-indigo-300 border-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {generatedDescription.pricing_suggestion && (
                    <div className="glass-card rounded-lg p-4 bg-green-500/5">
                      <p className="text-green-400 font-semibold mb-2">
                        💰 Pricing Suggestion: {generatedDescription.pricing_suggestion.tier}
                      </p>
                      <p className="text-gray-300 text-sm">
                        {generatedDescription.pricing_suggestion.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}