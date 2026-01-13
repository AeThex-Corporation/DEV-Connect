
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Plus,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Github,
  ExternalLink,
  Star
} from "lucide-react";

export default function UploadPortfolio() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Full Game",
    role: "",
    game_link: "",
    contribution_type: "owner", // NEW
    contribution_verified: false, // NEW
    verification_proof: "", // NEW
    github_url: "",
    technologies: [],
    completion_date: "",
    featured: false,
    images: [],
    videos: [],
    game_stats: {
      visits: 0,
      likes: 0,
      favorites: 0
    },
    client_testimonial: ""
  });

  const [newTech, setNewTech] = useState("");
  const [newVideo, setNewVideo] = useState("");

  const categories = [
    "Scripting",
    "Building",
    "UI Design",
    "3D Modeling",
    "Sound Design",
    "Game Design",
    "Animation",
    "VFX",
    "Full Game"
  ];

  const commonTechnologies = [
    "Lua",
    "Roblox Studio",
    "Blender",
    "DataStore2",
    "ProfileService",
    "Roact",
    "Rodux",
    "Remote Events",
    "ModuleScripts",
    "OOP",
    "Tweening",
    "PathfindingService",
    "CollectionService",
    "HttpService",
    "MarketplaceService"
  ];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file =>
        base44.integrations.Core.UploadFile({ file })
      );

      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.file_url);

      setFormData({
        ...formData,
        images: [...formData.images, ...imageUrls]
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const addTechnology = (tech) => {
    if (tech && !formData.technologies.includes(tech)) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, tech]
      });
      setNewTech("");
    }
  };

  const removeTechnology = (tech) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
  };

  const addVideo = () => {
    if (newVideo.trim() && !formData.videos.includes(newVideo.trim())) {
      setFormData({
        ...formData,
        videos: [...formData.videos, newVideo.trim()]
      });
      setNewVideo("");
    }
  };

  const removeVideo = (index) => {
    setFormData({
      ...formData,
      videos: formData.videos.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Portfolio.create({
        user_id: user.id,
        ...formData
      });

      // Award points for adding portfolio
      const currentPoints = user.community_points || 0;
      await base44.auth.updateMe({
        community_points: currentPoints + 10
      });

      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '🎨 Portfolio Updated!',
        message: 'Your portfolio project has been added successfully.',
        link: createPageUrl('Profile')
      });

      // Redirect to profile
      window.location.href = createPageUrl('Profile') + '?tab=portfolio';
    } catch (error) {
      console.error('Error saving portfolio:', error);
      alert('Failed to save portfolio item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>
        <h1 className="text-3xl font-bold gradient-text mb-2">Add Portfolio Project</h1>
        <p className="text-gray-400">Showcase your best work to attract employers</p>
      </div>

      <Card className="glass-card border-0 max-w-4xl mx-auto">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Project Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="My Awesome Game"
                    className="mt-1 bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your project, what you built, and what makes it special..."
                    className="mt-1 bg-white/5 border-white/20 text-white h-32"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger className="mt-1 bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Your Role</Label>
                    <Input
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      placeholder="Lead Scripter, Solo Developer, etc."
                      className="mt-1 bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>

                {/* NEW: Contribution Type - Only show for Full Game category */}
                {formData.category === 'Full Game' && (
                  <div>
                    <Label className="text-white">Your Role in This Project</Label>
                    <Select
                      value={formData.contribution_type}
                      onValueChange={(value) => setFormData({...formData, contribution_type: value})}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner - I created/own this game</SelectItem>
                        <SelectItem value="co-owner">Co-Owner - Joint ownership</SelectItem>
                        <SelectItem value="lead_developer">Lead Developer - Led the project</SelectItem>
                        <SelectItem value="contributor">Contributor - Worked on specific features</SelectItem>
                        <SelectItem value="contractor">Contractor - Contract work</SelectItem>
                        <SelectItem value="freelancer">Freelancer - Freelance work</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-gray-400 text-sm mt-1">
                      {formData.contribution_type === 'owner' || formData.contribution_type === 'co-owner'
                        ? "This will use full game stats for your reputation"
                        : formData.contribution_type === 'lead_developer'
                        ? "This will use 80% of game stats for your reputation"
                        : "This will use 50% of game stats for your reputation (70% if verified)"}
                    </p>
                  </div>
                )}

                {/* NEW: Verification Proof - Only for contributors/contractors/freelancers */}
                {formData.category === 'Full Game' &&
                 ['contributor', 'contractor', 'freelancer'].includes(formData.contribution_type) && (
                  <div>
                    <Label className="text-white">Proof of Contribution (Optional)</Label>
                    <Textarea
                      value={formData.verification_proof}
                      onChange={(e) => setFormData({...formData, verification_proof: e.target.value})}
                      placeholder="Add testimonial, contract reference, or description of your specific contributions to help verify your work..."
                      className="bg-white/5 border-white/20 text-white min-h-[100px]"
                    />
                    <p className="text-gray-400 text-sm mt-1">
                      💡 Adding proof (testimonials, specific feature descriptions) can increase your reputation weight from 50% to 70%
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-gray-300">Completion Date</Label>
                  <Input
                    type="date"
                    value={formData.completion_date}
                    onChange={(e) => setFormData({...formData, completion_date: e.target.value})}
                    className="mt-1 bg-white/5 border-white/20 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Project Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300 mb-2 block">Upload Screenshots</Label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImages}
                      />
                      <div className="glass-card rounded-lg p-4 hover:bg-white/5 transition-colors flex items-center gap-2">
                        <Upload className="w-5 h-5 text-indigo-400" />
                        <span className="text-white text-sm">
                          {uploadingImages ? 'Uploading...' : 'Choose Images'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Links */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Links & Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Game Link</Label>
                  <Input
                    value={formData.game_link}
                    onChange={(e) => setFormData({...formData, game_link: e.target.value})}
                    placeholder="https://www.roblox.com/games/..."
                    className="mt-1 bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">GitHub Repository</Label>
                  <Input
                    value={formData.github_url}
                    onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                    placeholder="https://github.com/username/repo"
                    className="mt-1 bg-white/5 border-white/20 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Video URLs</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newVideo}
                      onChange={(e) => setNewVideo(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="bg-white/5 border-white/20 text-white"
                    />
                    <Button type="button" onClick={addVideo} size="icon" className="btn-primary text-white">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.videos.length > 0 && (
                    <div className="space-y-2">
                      {formData.videos.map((video, index) => (
                        <div key={index} className="glass-card rounded p-2 flex items-center justify-between">
                          <span className="text-white text-sm truncate flex-1">{video}</span>
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="text-red-400 hover:text-red-300 ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Technologies Used</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300 mb-2 block">Select or add technologies</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {commonTechnologies.map(tech => (
                      <Button
                        key={tech}
                        type="button"
                        variant={formData.technologies.includes(tech) ? "default" : "outline"}
                        size="sm"
                        onClick={() => formData.technologies.includes(tech) ? removeTechnology(tech) : addTechnology(tech)}
                        className={formData.technologies.includes(tech)
                          ? "btn-primary text-white"
                          : "glass-card border-0 text-white hover:bg-white/5"
                        }
                      >
                        {tech}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="Add custom technology..."
                      className="bg-white/5 border-white/20 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology(newTech))}
                    />
                    <Button type="button" onClick={() => addTechnology(newTech)} size="icon" className="btn-primary text-white">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {formData.technologies.length > 0 && (
                  <div>
                    <Label className="text-gray-300 mb-2 block">Selected Technologies:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies.map(tech => (
                        <Badge key={tech} className="bg-purple-500/20 text-purple-300 border-0">
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTechnology(tech)}
                            className="ml-2 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Stats (Optional) */}
            {formData.category === 'Full Game' && (
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-white">Game Statistics (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300">Total Visits</Label>
                      <Input
                        type="number"
                        value={formData.game_stats.visits}
                        onChange={(e) => setFormData({
                          ...formData,
                          game_stats: {...formData.game_stats, visits: parseInt(e.target.value) || 0}
                        })}
                        className="mt-1 bg-white/5 border-white/20 text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Likes</Label>
                      <Input
                        type="number"
                        value={formData.game_stats.likes}
                        onChange={(e) => setFormData({
                          ...formData,
                          game_stats: {...formData.game_stats, likes: parseInt(e.target.value) || 0}
                        })}
                        className="mt-1 bg-white/5 border-white/20 text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Favorites</Label>
                      <Input
                        type="number"
                        value={formData.game_stats.favorites}
                        onChange={(e) => setFormData({
                          ...formData,
                          game_stats: {...formData.game_stats, favorites: parseInt(e.target.value) || 0}
                        })}
                        className="mt-1 bg-white/5 border-white/20 text-white"
                        min="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Testimonial */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Client Testimonial (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.client_testimonial}
                  onChange={(e) => setFormData({...formData, client_testimonial: e.target.value})}
                  placeholder="Add a testimonial from your client if available..."
                  className="bg-white/5 border-white/20 text-white h-24"
                />
              </CardContent>
            </Card>

            {/* Featured */}
            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="w-4 h-4 rounded"
                  />
                  <div>
                    <p className="text-white font-medium flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      Feature this project
                    </p>
                    <p className="text-gray-400 text-sm">This project will be highlighted on your profile</p>
                  </div>
                </label>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => window.history.back()}
                variant="outline"
                className="flex-1 glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 btn-primary text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Portfolio Item
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
