import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle,
  Target,
  BarChart
} from 'lucide-react';

export default function AIAssetOptimizer({ asset, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeAsset = async () => {
    setLoading(true);
    try {
      // Get similar assets and market data
      const [allAssets, reviews] = await Promise.all([
        base44.entities.Asset.filter({ 
          status: 'active',
          category: asset.category 
        }),
        base44.entities.AssetReview.list()
      ]);

      const similarAssets = allAssets.filter(a => 
        a.id !== asset.id && 
        a.category === asset.category
      );

      const assetReviews = reviews.filter(r => r.asset_id === asset.id);

      const prompt = `You are an AI marketplace optimization expert. Analyze this asset listing and provide comprehensive improvement suggestions.

ASSET BEING ANALYZED:
Title: ${asset.title}
Description: ${asset.description}
Category: ${asset.category}
Current Price: ${asset.price} ${asset.currency}
Tags: ${asset.tags?.join(', ') || 'None'}
Downloads: ${asset.downloads || 0}
Rating: ${asset.rating?.toFixed(1) || 'No ratings'}
Reviews: ${asset.review_count || 0}

SIMILAR ASSETS IN MARKETPLACE (${similarAssets.length} total):
${similarAssets.slice(0, 20).map((a, i) => `
${i + 1}. ${a.title}
   Price: ${a.price} ${a.currency}
   Downloads: ${a.downloads || 0}
   Rating: ${a.rating?.toFixed(1) || '0.0'} (${a.review_count || 0} reviews)
   Tags: ${a.tags?.join(', ') || 'None'}
   Status: ${a.status}
`).join('\n')}

REVIEWS FOR THIS ASSET (${assetReviews.length} reviews):
${assetReviews.slice(0, 10).map(r => `
- Rating: ${r.rating}/5
- Comment: ${r.review_text?.substring(0, 200) || 'No comment'}
- Quality: ${r.categories?.quality || 'N/A'}/5
- Value: ${r.categories?.value || 'N/A'}/5
`).join('\n')}

PROVIDE COMPREHENSIVE ANALYSIS:
1. Optimal pricing based on similar assets, features, and market position
2. Enhanced title and description that will improve search visibility
3. Recommended tags based on content and popular searches
4. Performance insights and specific improvement suggestions
5. Competitive advantages to highlight
6. Market positioning strategy`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            pricing_analysis: {
              type: "object",
              properties: {
                current_price: { type: "number" },
                suggested_price: { type: "number" },
                min_competitive_price: { type: "number" },
                max_justified_price: { type: "number" },
                pricing_strategy: { 
                  type: "string",
                  enum: ["premium", "competitive", "value", "penetration"]
                },
                reasoning: { type: "string" },
                price_comparison: {
                  type: "object",
                  properties: {
                    below_market: { type: "boolean" },
                    within_range: { type: "boolean" },
                    above_market: { type: "boolean" },
                    justification: { type: "string" }
                  }
                }
              }
            },
            title_optimization: {
              type: "object",
              properties: {
                current_title: { type: "string" },
                suggested_title: { type: "string" },
                improvements: {
                  type: "array",
                  items: { type: "string" }
                },
                keywords_added: {
                  type: "array",
                  items: { type: "string" }
                },
                seo_score_before: { type: "number" },
                seo_score_after: { type: "number" }
              }
            },
            description_optimization: {
              type: "object",
              properties: {
                enhanced_description: { type: "string" },
                key_improvements: {
                  type: "array",
                  items: { type: "string" }
                },
                features_to_highlight: {
                  type: "array",
                  items: { type: "string" }
                },
                call_to_action: { type: "string" }
              }
            },
            tag_recommendations: {
              type: "object",
              properties: {
                current_tags: {
                  type: "array",
                  items: { type: "string" }
                },
                suggested_tags: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      tag: { type: "string" },
                      search_volume: { type: "string" },
                      competition: { type: "string" },
                      relevance_score: { type: "number" }
                    }
                  }
                },
                tags_to_remove: {
                  type: "array",
                  items: { type: "string" }
                },
                trending_tags: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            performance_insights: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                conversion_rate_estimate: { type: "number" },
                strengths: {
                  type: "array",
                  items: { type: "string" }
                },
                weaknesses: {
                  type: "array",
                  items: { type: "string" }
                },
                improvement_areas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      area: { type: "string" },
                      priority: { 
                        type: "string",
                        enum: ["critical", "high", "medium", "low"]
                      },
                      suggestion: { type: "string" },
                      expected_impact: { type: "string" }
                    }
                  }
                }
              }
            },
            competitive_analysis: {
              type: "object",
              properties: {
                market_position: { 
                  type: "string",
                  enum: ["leader", "challenger", "follower", "niche"]
                },
                unique_advantages: {
                  type: "array",
                  items: { type: "string" }
                },
                competitive_threats: {
                  type: "array",
                  items: { type: "string" }
                },
                differentiation_strategy: { type: "string" }
              }
            },
            action_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step_number: { type: "number" },
                  action: { type: "string" },
                  priority: { type: "string" },
                  estimated_impact: { type: "string" },
                  effort_required: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(response);

    } catch (error) {
      console.error('Error analyzing asset:', error);
      alert('Failed to analyze asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyOptimizations = async (type) => {
    if (!analysis) return;

    try {
      const updates = {};

      if (type === 'title') {
        updates.title = analysis.title_optimization.suggested_title;
      } else if (type === 'description') {
        updates.description = analysis.description_optimization.enhanced_description;
      } else if (type === 'price') {
        updates.price = analysis.pricing_analysis.suggested_price;
      } else if (type === 'tags') {
        updates.tags = analysis.tag_recommendations.suggested_tags.map(t => t.tag);
      } else if (type === 'all') {
        updates.title = analysis.title_optimization.suggested_title;
        updates.description = analysis.description_optimization.enhanced_description;
        updates.price = analysis.pricing_analysis.suggested_price;
        updates.tags = analysis.tag_recommendations.suggested_tags.map(t => t.tag);
      }

      await base44.entities.Asset.update(asset.id, updates);
      
      if (onUpdate) onUpdate();
      alert('✅ Asset updated successfully!');

    } catch (error) {
      console.error('Error applying optimizations:', error);
      alert('Failed to apply optimizations. Please try again.');
    }
  };

  if (loading) {
    return (
      <Card className="glass-card border-0">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white mb-2">🤖 AI is analyzing your asset...</p>
          <p className="text-gray-400 text-sm">Comparing with {asset.category} listings and reviews</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="glass-card border-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Optimize Your Asset Listing
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">
            Get AI-powered suggestions for pricing, titles, descriptions, and tags to maximize your sales
          </p>
          <Button
            onClick={analyzeAsset}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-lg px-8 py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Analyze Asset
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="glass-card border-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-xl mb-1">Optimization Score</h3>
              <p className="text-gray-400 text-sm">How well your listing is optimized</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">
                {analysis.performance_insights.overall_score}/100
              </div>
              <Badge className={`${
                analysis.performance_insights.overall_score >= 80 ? 'bg-green-500/20 text-green-400' :
                analysis.performance_insights.overall_score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              } border-0`}>
                {analysis.performance_insights.overall_score >= 80 ? 'Excellent' :
                 analysis.performance_insights.overall_score >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs mb-2">✅ Strengths:</p>
              <div className="space-y-1">
                {analysis.performance_insights.strengths?.slice(0, 3).map((strength, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300 text-xs">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-2">⚠️ Areas to Improve:</p>
              <div className="space-y-1">
                {analysis.performance_insights.weaknesses?.slice(0, 3).map((weakness, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300 text-xs">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="title">
            <FileText className="w-4 h-4 mr-2" />
            Title
          </TabsTrigger>
          <TabsTrigger value="description">
            <FileText className="w-4 h-4 mr-2" />
            Description
          </TabsTrigger>
          <TabsTrigger value="tags">
            <Tag className="w-4 h-4 mr-2" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Pricing Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-xs mb-2">Current Price</p>
                  <p className="text-2xl font-bold text-white">{asset.currency === 'Robux' ? 'R$' : '$'}{asset.price}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <p className="text-green-400 text-xs mb-2">Suggested Price</p>
                  <p className="text-2xl font-bold text-white">{asset.currency === 'Robux' ? 'R$' : '$'}{analysis.pricing_analysis.suggested_price}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-xs mb-2">Price Range</p>
                  <p className="text-sm text-white">
                    {asset.currency === 'Robux' ? 'R$' : '$'}{analysis.pricing_analysis.min_competitive_price} - 
                    {asset.currency === 'Robux' ? 'R$' : '$'}{analysis.pricing_analysis.max_justified_price}
                  </p>
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-400 font-semibold text-sm mb-2">💡 Pricing Strategy:</p>
                <p className="text-white font-semibold mb-2 capitalize">{analysis.pricing_analysis.pricing_strategy}</p>
                <p className="text-gray-300 text-sm">{analysis.pricing_analysis.reasoning}</p>
              </div>

              <div>
                <p className="text-white font-semibold text-sm mb-2">Market Position:</p>
                <p className="text-gray-400 text-sm">{analysis.pricing_analysis.price_comparison?.justification}</p>
              </div>

              <Button
                onClick={() => applyOptimizations('price')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Apply Suggested Price
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Title Tab */}
        <TabsContent value="title">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Title Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-400 text-xs mb-2">Current Title:</p>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white">{asset.title}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs mb-2">Suggested Title:</p>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3">
                  <p className="text-white font-semibold">{analysis.title_optimization.suggested_title}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">SEO Score Before</p>
                  <p className="text-2xl font-bold text-white">{analysis.title_optimization.seo_score_before}/10</p>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                  <p className="text-green-400 text-xs mb-1">SEO Score After</p>
                  <p className="text-2xl font-bold text-white">{analysis.title_optimization.seo_score_after}/10</p>
                </div>
              </div>

              <div>
                <p className="text-white font-semibold text-sm mb-2">Key Improvements:</p>
                <div className="space-y-2">
                  {analysis.title_optimization.improvements?.map((improvement, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.title_optimization.keywords_added?.length > 0 && (
                <div>
                  <p className="text-white font-semibold text-sm mb-2">Keywords Added:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.title_optimization.keywords_added.map((keyword, i) => (
                      <Badge key={i} className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => applyOptimizations('title')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Apply Suggested Title
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Description Tab */}
        <TabsContent value="description">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Description Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-400 text-xs mb-2">Enhanced Description:</p>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-white text-sm whitespace-pre-wrap">
                    {analysis.description_optimization.enhanced_description}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-white font-semibold text-sm mb-2">Key Improvements:</p>
                <div className="space-y-2">
                  {analysis.description_optimization.key_improvements?.map((improvement, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-300 text-sm">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold text-sm mb-2">Features to Highlight:</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {analysis.description_optimization.features_to_highlight?.map((feature, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-2">
                      <p className="text-gray-300 text-sm">• {feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-400 font-semibold text-sm mb-2">📢 Call to Action:</p>
                <p className="text-white text-sm">{analysis.description_optimization.call_to_action}</p>
              </div>

              <Button
                onClick={() => applyOptimizations('description')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Apply Enhanced Description
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Tag Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-white font-semibold text-sm mb-3">Suggested Tags (Ranked by Impact):</p>
                <div className="space-y-3">
                  {analysis.tag_recommendations.suggested_tags?.map((tagData, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-purple-500/20 text-purple-400 border-0">
                          {tagData.tag}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                            {tagData.search_volume} searches
                          </Badge>
                          <Badge className={`${
                            tagData.competition === 'low' ? 'bg-green-500/20 text-green-400' :
                            tagData.competition === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          } border-0 text-xs`}>
                            {tagData.competition} competition
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">Relevance:</span>
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{ width: `${tagData.relevance_score}%` }}
                          />
                        </div>
                        <span className="text-white text-xs font-semibold">{tagData.relevance_score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {analysis.tag_recommendations.trending_tags?.length > 0 && (
                <div>
                  <p className="text-white font-semibold text-sm mb-2">🔥 Trending Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.tag_recommendations.trending_tags.map((tag, i) => (
                      <Badge key={i} className="bg-orange-500/20 text-orange-400 border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysis.tag_recommendations.tags_to_remove?.length > 0 && (
                <div>
                  <p className="text-white font-semibold text-sm mb-2">🗑️ Consider Removing:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.tag_recommendations.tags_to_remove.map((tag, i) => (
                      <Badge key={i} className="bg-red-500/20 text-red-400 border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => applyOptimizations('tags')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                <Tag className="w-4 h-4 mr-2" />
                Apply Suggested Tags
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Performance Insights & Action Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-white font-semibold mb-3">Priority Improvements:</p>
                <div className="space-y-3">
                  {analysis.performance_insights.improvement_areas?.map((area, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold">{area.area}</h4>
                        <Badge className={`${
                          area.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          area.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          area.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        } border-0 text-xs`}>
                          {area.priority} priority
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{area.suggestion}</p>
                      <p className="text-green-400 text-xs">💡 Expected Impact: {area.expected_impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white font-semibold mb-3">Action Plan:</p>
                <div className="space-y-2">
                  {analysis.action_plan?.map((step, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 font-bold text-sm">{step.step_number}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm mb-1">{step.action}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge className="bg-purple-500/20 text-purple-400 border-0">
                            {step.priority}
                          </Badge>
                          <span className="text-gray-400">Impact: {step.estimated_impact}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400">Effort: {step.effort_required}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg p-4 border border-purple-500/20">
                <p className="text-purple-400 font-semibold text-sm mb-2">🎯 Market Position:</p>
                <p className="text-white mb-2 capitalize">{analysis.competitive_analysis.market_position}</p>
                <p className="text-gray-300 text-sm">{analysis.competitive_analysis.differentiation_strategy}</p>
              </div>

              <Button
                onClick={() => applyOptimizations('all')}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-lg py-6"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Apply All Optimizations
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}