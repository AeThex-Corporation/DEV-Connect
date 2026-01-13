import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Search,
  Target,
  Users,
  Briefcase,
  BookOpen,
  Award,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Shield,
  Bell,
  Brain,
  Map,
  Trophy,
  Rocket,
  Building2,
  BarChart,
  CheckCircle,
  ArrowRight,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Move
} from 'lucide-react';

export default function DraggableAIGuide({ onClose }) {
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 400, y: 50 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: Sparkles },
    { id: 'career', name: 'Career', icon: TrendingUp },
    { id: 'jobs', name: 'Jobs', icon: Briefcase },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'learning', name: 'Learning', icon: BookOpen },
  ];

  const aiAgents = [
    {
      id: 'talent-scout',
      name: 'AI Talent Scout',
      icon: Target,
      category: 'employer',
      description: 'Find perfect developers automatically',
      features: ['Match scoring', 'Skill analysis', 'Auto outreach'],
    },
    {
      id: 'job-matcher',
      name: 'AI Job Matcher',
      icon: Briefcase,
      category: 'jobs',
      description: 'Get personalized job recommendations',
      features: ['Match scoring', 'Success predictions', 'Application tips'],
    },
    {
      id: 'career-roadmap',
      name: 'Career Roadmap',
      icon: Map,
      category: 'career',
      description: 'Get a detailed career development plan',
      features: ['Quarterly goals', 'Skills sequence', 'Salary projections'],
    },
    {
      id: 'skill-gap',
      name: 'Skill Gap Analyzer',
      icon: Target,
      category: 'career',
      description: 'Discover skill gaps preventing opportunities',
      features: ['Competitiveness score', 'Critical gaps', 'Market demand'],
    },
    {
      id: 'profile-assistant',
      name: 'Profile Assistant',
      icon: Sparkles,
      category: 'career',
      description: 'Optimize your profile visibility',
      features: ['Completeness score', 'Bio improvements', 'Keyword optimization'],
    },
  ];

  const filteredAgents = aiAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingRef.current && !isMaximized) {
        setPosition({
          x: e.clientX - dragOffsetRef.current.x,
          y: e.clientY - dragOffsetRef.current.y
        });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMaximized]);

  const handleMouseDown = (e) => {
    if (isMaximized) return;
    
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
        }}
      >
        <Button
          onClick={toggleMinimize}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-2xl"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          AI Guide
        </Button>
      </div>
    );
  }

  const windowStyle = isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
      }
    : {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        width: '800px',
        maxWidth: '90vw',
        height: '600px',
        maxHeight: '80vh',
      };

  return (
    <div style={windowStyle}>
      <Card className="h-full flex flex-col bg-[#0a0a0a] border-white/20 shadow-2xl overflow-hidden">
        {/* Draggable Header */}
        <div
          ref={dragRef}
          onMouseDown={handleMouseDown}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 flex items-center justify-between select-none"
          style={{ cursor: isMaximized ? 'default' : 'grab' }}
        >
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-white opacity-60" />
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">AI Features Guide</span>
            <Badge className="bg-white/20 text-white border-0 text-xs">
              {filteredAgents.length} Agents
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMinimize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={toggleMaximize}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI agents..."
                className="pl-9 bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap mb-6">
            {categories.map(cat => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                className={selectedCategory === cat.id 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
                  : 'glass-card border-0 text-white hover:bg-white/5'}
                size="sm"
              >
                <cat.icon className="w-4 h-4 mr-2" />
                {cat.name}
              </Button>
            ))}
          </div>

          {/* AI Agents List */}
          <div className="space-y-3">
            {filteredAgents.map((agent) => {
              const Icon = agent.icon;
              
              return (
                <Card key={agent.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold mb-1">{agent.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{agent.description}</p>
                        
                        <div className="flex flex-wrap gap-1">
                          {agent.features.map((feature, i) => (
                            <Badge key={i} className="bg-indigo-500/20 text-indigo-400 border-0 text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No AI agents found</p>
              <p className="text-gray-500 text-sm">Try a different search term</p>
            </div>
          )}

          {/* Quick Tip */}
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 mt-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-semibold text-sm mb-1">Quick Tip</p>
                  <p className="text-gray-300 text-sm">
                    Start with Profile Assistant and Job Matcher for immediate impact on your job search!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Card>
    </div>
  );
}