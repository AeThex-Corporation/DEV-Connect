import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Code,
  Palette,
  Box,
  Music,
  Zap,
  ExternalLink,
  Search,
  Download,
  Play,
  FileText,
  Video,
  Package
} from "lucide-react";

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");

  const resources = {
    scripting: [
      {
        title: "Lua Basics for Roblox",
        description: "Complete guide to Lua programming fundamentals for Roblox development",
        type: "tutorial",
        difficulty: "beginner",
        duration: "2 hours",
        link: "https://create.roblox.com/docs/scripting/luau",
        icon: Code,
        tags: ["Lua", "Basics", "Scripting"]
      },
      {
        title: "DataStore2 Complete Guide",
        description: "Learn how to properly save and load player data using DataStore2",
        type: "tutorial",
        difficulty: "intermediate",
        duration: "1.5 hours",
        link: "https://devforum.roblox.com/t/how-to-use-datastore2-data-store-caching-and-data-loss-prevention/136317",
        icon: FileText,
        tags: ["DataStore", "Data", "Advanced"]
      },
      {
        title: "ProfileService Tutorial",
        description: "Modern data management solution for Roblox games",
        type: "tutorial",
        difficulty: "advanced",
        duration: "2 hours",
        link: "https://madstudioroblox.github.io/ProfileService/",
        icon: Code,
        tags: ["ProfileService", "Data", "Production"]
      },
      {
        title: "Remote Events & Functions",
        description: "Master client-server communication in Roblox",
        type: "video",
        difficulty: "intermediate",
        duration: "45 min",
        link: "https://create.roblox.com/docs/scripting/events/remote",
        icon: Video,
        tags: ["RemoteEvents", "Networking", "Communication"]
      },
      {
        title: "Module Scripts Best Practices",
        description: "Organize your code efficiently with ModuleScripts",
        type: "guide",
        difficulty: "intermediate",
        duration: "30 min",
        link: "https://create.roblox.com/docs/scripting/scripts/module-scripts",
        icon: FileText,
        tags: ["Modules", "Organization", "Best Practices"]
      },
      {
        title: "Optimizing Lua Performance",
        description: "Tips and tricks for writing efficient Roblox scripts",
        type: "guide",
        difficulty: "advanced",
        duration: "1 hour",
        link: "https://create.roblox.com/docs/scripting/scripts/performance-optimization",
        icon: Zap,
        tags: ["Performance", "Optimization", "Advanced"]
      }
    ],
    building: [
      {
        title: "Studio Building Fundamentals",
        description: "Learn the basics of building in Roblox Studio",
        type: "tutorial",
        difficulty: "beginner",
        duration: "2 hours",
        link: "https://create.roblox.com/docs/studio/building-and-modeling",
        icon: Box,
        tags: ["Building", "Studio", "Basics"]
      },
      {
        title: "Advanced Terrain Techniques",
        description: "Create stunning natural environments with terrain tools",
        type: "video",
        difficulty: "intermediate",
        duration: "1 hour",
        link: "https://create.roblox.com/docs/studio/terrain-editor",
        icon: Video,
        tags: ["Terrain", "Environment", "Landscape"]
      },
      {
        title: "Lighting & Atmosphere Guide",
        description: "Master lighting techniques for immersive game environments",
        type: "tutorial",
        difficulty: "intermediate",
        duration: "1.5 hours",
        link: "https://create.roblox.com/docs/environment/lighting",
        icon: Zap,
        tags: ["Lighting", "Atmosphere", "Visual"]
      },
      {
        title: "Mesh Import & Optimization",
        description: "Import custom meshes and optimize them for Roblox",
        type: "guide",
        difficulty: "advanced",
        duration: "45 min",
        link: "https://create.roblox.com/docs/parts/meshes",
        icon: Package,
        tags: ["Meshes", "3D", "Import"]
      },
      {
        title: "Level Design Principles",
        description: "Create engaging and balanced game levels",
        type: "guide",
        difficulty: "intermediate",
        duration: "1 hour",
        link: "https://devforum.roblox.com",
        icon: FileText,
        tags: ["Level Design", "Game Design", "Planning"]
      }
    ],
    ui_design: [
      {
        title: "Roblox UI Design Basics",
        description: "Introduction to creating user interfaces in Roblox",
        type: "tutorial",
        difficulty: "beginner",
        duration: "1.5 hours",
        link: "https://create.roblox.com/docs/ui/ui-design",
        icon: Palette,
        tags: ["UI", "Design", "Basics"]
      },
      {
        title: "Responsive UI with UIScale",
        description: "Make your UI work across all screen sizes",
        type: "tutorial",
        difficulty: "intermediate",
        duration: "1 hour",
        link: "https://create.roblox.com/docs/ui/layout-and-appearance",
        icon: Code,
        tags: ["UI", "Responsive", "Scale"]
      },
      {
        title: "Advanced UI Animations",
        description: "Create smooth transitions and effects with TweenService",
        type: "video",
        difficulty: "advanced",
        duration: "2 hours",
        link: "https://create.roblox.com/docs/ui/animation",
        icon: Video,
        tags: ["Animations", "TweenService", "Effects"]
      },
      {
        title: "UI Color Theory & Design",
        description: "Choose the right colors for engaging interfaces",
        type: "guide",
        difficulty: "beginner",
        duration: "30 min",
        link: "https://devforum.roblox.com",
        icon: Palette,
        tags: ["Colors", "Design", "Theory"]
      },
      {
        title: "Inventory System UI",
        description: "Build a professional inventory system interface",
        type: "tutorial",
        difficulty: "advanced",
        duration: "2.5 hours",
        link: "https://devforum.roblox.com",
        icon: Code,
        tags: ["Inventory", "System", "Advanced"]
      }
    ],
    modeling: [
      {
        title: "Blender for Roblox Basics",
        description: "Get started with 3D modeling for Roblox using Blender",
        type: "tutorial",
        difficulty: "beginner",
        duration: "3 hours",
        link: "https://create.roblox.com/docs/art/modeling",
        icon: Box,
        tags: ["Blender", "3D", "Modeling"]
      },
      {
        title: "Low Poly Modeling Techniques",
        description: "Create optimized low poly models for games",
        type: "video",
        difficulty: "intermediate",
        duration: "2 hours",
        link: "https://www.youtube.com",
        icon: Video,
        tags: ["Low Poly", "Optimization", "Modeling"]
      },
      {
        title: "Texturing & Materials Guide",
        description: "Apply realistic textures to your 3D models",
        type: "tutorial",
        difficulty: "intermediate",
        duration: "1.5 hours",
        link: "https://create.roblox.com/docs/art/modeling/surface-appearance",
        icon: Palette,
        tags: ["Texturing", "Materials", "PBR"]
      },
      {
        title: "Character Rigging for Roblox",
        description: "Rig custom characters for animation",
        type: "tutorial",
        difficulty: "advanced",
        duration: "2.5 hours",
        link: "https://create.roblox.com/docs/art/characters",
        icon: Code,
        tags: ["Rigging", "Characters", "Animation"]
      },
      {
        title: "Roblox Asset Marketplace Guide",
        description: "Publish and sell your models on the marketplace",
        type: "guide",
        difficulty: "intermediate",
        duration: "45 min",
        link: "https://create.roblox.com/docs/production/publishing",
        icon: Package,
        tags: ["Marketplace", "Publishing", "Business"]
      }
    ]
  };

  const assetPacks = [
    {
      title: "Lua Script Templates",
      description: "Ready-to-use script templates for common game mechanics",
      type: "scripts",
      count: "25+ templates",
      icon: Code,
      tags: ["Lua", "Templates", "Scripts"]
    },
    {
      title: "UI Component Library",
      description: "Pre-built UI components and layouts",
      type: "ui",
      count: "50+ components",
      icon: Palette,
      tags: ["UI", "Components", "Library"]
    },
    {
      title: "3D Model Pack - Fantasy",
      description: "Medieval and fantasy themed 3D assets",
      type: "models",
      count: "100+ models",
      icon: Box,
      tags: ["3D", "Fantasy", "Assets"]
    },
    {
      title: "Sound Effects Bundle",
      description: "High-quality sound effects for games",
      type: "audio",
      count: "200+ sounds",
      icon: Music,
      tags: ["Audio", "SFX", "Sounds"]
    }
  ];

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'bg-green-500/20 text-green-400',
      'intermediate': 'bg-yellow-500/20 text-yellow-400',
      'advanced': 'bg-red-500/20 text-red-400'
    };
    return colors[difficulty] || colors['beginner'];
  };

  const getTypeIcon = (type) => {
    const icons = {
      'tutorial': FileText,
      'video': Video,
      'guide': BookOpen
    };
    return icons[type] || FileText;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-3">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">
            <span className="gradient-text">Learning Resources</span>
          </h1>
        </div>
        <p className="text-gray-400 text-sm mb-6 max-w-2xl">
          Comprehensive guides, tutorials, and asset packs to level up your Roblox development skills
        </p>

        {/* Search */}
        <div className="flex gap-3 max-w-2xl">
          <div className="flex-1 glass-card rounded-lg px-4 py-2.5 flex items-center">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <Input
              placeholder="Search tutorials, guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 text-white placeholder-gray-500 text-sm p-0 h-auto focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Resource Tabs */}
      <Tabs defaultValue="scripting" className="w-full">
        <TabsList className="glass-card border-0 mb-6 flex-wrap h-auto">
          <TabsTrigger value="scripting">
            <Code className="w-4 h-4 mr-2" />
            Scripting
          </TabsTrigger>
          <TabsTrigger value="building">
            <Box className="w-4 h-4 mr-2" />
            Building
          </TabsTrigger>
          <TabsTrigger value="ui">
            <Palette className="w-4 h-4 mr-2" />
            UI Design
          </TabsTrigger>
          <TabsTrigger value="modeling">
            <Package className="w-4 h-4 mr-2" />
            3D Modeling
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Download className="w-4 h-4 mr-2" />
            Asset Packs
          </TabsTrigger>
        </TabsList>

        {/* Scripting Resources */}
        <TabsContent value="scripting" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {resources.scripting.map((resource, index) => {
              const TypeIcon = getTypeIcon(resource.type);
              const ResourceIcon = resource.icon;
              
              return (
                <Card key={index} className="glass-card border-0 card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ResourceIcon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold">{resource.title}</h3>
                          <TypeIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-3">{resource.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={`${getDifficultyColor(resource.difficulty)} border-0 text-xs`}>
                            {resource.difficulty}
                          </Badge>
                          <Badge className="bg-white/5 text-gray-300 border-0 text-xs">
                            {resource.duration}
                          </Badge>
                          {resource.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button size="sm" className="btn-primary text-white w-full" asChild>
                          <a href={resource.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Resource
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Building Resources */}
        <TabsContent value="building" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {resources.building.map((resource, index) => {
              const TypeIcon = getTypeIcon(resource.type);
              const ResourceIcon = resource.icon;
              
              return (
                <Card key={index} className="glass-card border-0 card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ResourceIcon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold">{resource.title}</h3>
                          <TypeIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-3">{resource.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={`${getDifficultyColor(resource.difficulty)} border-0 text-xs`}>
                            {resource.difficulty}
                          </Badge>
                          <Badge className="bg-white/5 text-gray-300 border-0 text-xs">
                            {resource.duration}
                          </Badge>
                          {resource.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} className="bg-green-500/20 text-green-300 border-0 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button size="sm" className="btn-primary text-white w-full" asChild>
                          <a href={resource.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Resource
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* UI Design Resources */}
        <TabsContent value="ui" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {resources.ui_design.map((resource, index) => {
              const TypeIcon = getTypeIcon(resource.type);
              const ResourceIcon = resource.icon;
              
              return (
                <Card key={index} className="glass-card border-0 card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ResourceIcon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold">{resource.title}</h3>
                          <TypeIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-3">{resource.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={`${getDifficultyColor(resource.difficulty)} border-0 text-xs`}>
                            {resource.difficulty}
                          </Badge>
                          <Badge className="bg-white/5 text-gray-300 border-0 text-xs">
                            {resource.duration}
                          </Badge>
                          {resource.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button size="sm" className="btn-primary text-white w-full" asChild>
                          <a href={resource.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Resource
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 3D Modeling Resources */}
        <TabsContent value="modeling" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {resources.modeling.map((resource, index) => {
              const TypeIcon = getTypeIcon(resource.type);
              const ResourceIcon = resource.icon;
              
              return (
                <Card key={index} className="glass-card border-0 card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ResourceIcon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold">{resource.title}</h3>
                          <TypeIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-3">{resource.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={`${getDifficultyColor(resource.difficulty)} border-0 text-xs`}>
                            {resource.difficulty}
                          </Badge>
                          <Badge className="bg-white/5 text-gray-300 border-0 text-xs">
                            {resource.duration}
                          </Badge>
                          {resource.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} className="bg-orange-500/20 text-orange-300 border-0 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button size="sm" className="btn-primary text-white w-full" asChild>
                          <a href={resource.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Resource
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Asset Packs */}
        <TabsContent value="assets" className="space-y-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white mb-2">Free Asset Packs</h2>
            <p className="text-xs text-gray-400">Download ready-to-use assets for your projects</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {assetPacks.map((pack, index) => {
              const PackIcon = pack.icon;
              
              return (
                <Card key={index} className="glass-card border-0 card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <PackIcon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">{pack.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-0 text-xs">
                            {pack.count}
                          </Badge>
                          {pack.tags.map(tag => (
                            <Badge key={tag} className="bg-white/5 text-gray-300 border-0 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button size="sm" className="btn-primary text-white w-full">
                          <Download className="w-3 h-3 mr-2" />
                          Download Pack
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Official Docs Link */}
          <Card className="glass-card border-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Official Roblox Documentation</h3>
                  <p className="text-gray-400 text-sm">Access the complete Roblox Creator documentation</p>
                </div>
                <Button className="btn-primary text-white" asChild>
                  <a href="https://create.roblox.com/docs" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Docs
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}