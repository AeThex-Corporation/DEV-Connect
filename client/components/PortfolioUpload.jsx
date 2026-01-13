import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Upload, 
  X, 
  Plus, 
  Image as ImageIcon,
  Github,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  Globe
} from "lucide-react";

export default function PortfolioUpload({ userId, onUpdate }) {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Application',
    technologies: [],
    role: '',
    images: [],
    videos: [],
    live_demo_url: '',
    github_url: '',
    case_study: {
      problem: '',
      solution: '',
      results: ''
    },
    completion_date: '',
    client_testimonial: ''
  });
  const [newTech, setNewTech] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const categories = [
    "Web Application",
    "Mobile App",
    "Game",
    "AI/ML Project",
    "Blockchain/Web3",
    "API/Backend",
    "UI/UX Design",
    "3D/Animation",
    "Other"
  ];

  React.useEffect(() => {
    loadPortfolio();
  }, [userId]);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const items = await base44.entities.Portfolio.filter({ user_id: userId });
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.file_url);
      
      setFormData({
        ...formData,
        images: [...formData.images, ...urls]
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!formData.title || !formData.description) {
      alert('Please fill in required fields');
      return;
    }

    try {
      if (editingItem) {
        await base44.entities.Portfolio.update(editingItem.id, formData);
      } else {
        await base44.entities.Portfolio.create({
          ...formData,
          user_id: userId
        });
      }

      setModalOpen(false);
      setEditingItem(null);
      resetForm();
      loadPortfolio();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const handleEditProject = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      technologies: item.technologies || [],
      role: item.role || '',
      images: item.images || [],
      videos: item.videos || [],
      live_demo_url: item.live_demo_url || '',
      github_url: item.github_url || '',
      case_study: item.case_study || { problem: '', solution: '', results: '' },
      completion_date: item.completion_date || '',
      client_testimonial: item.client_testimonial || ''
    });
    setModalOpen(true);
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await base44.entities.Portfolio.delete(id);
      loadPortfolio();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Web Application',
      technologies: [],
      role: '',
      images: [],
      videos: [],
      live_demo_url: '',
      github_url: '',
      case_study: { problem: '', solution: '', results: '' },
      completion_date: '',
      client_testimonial: ''
    });
    setNewTech('');
  };

  const addTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTech.trim()]
      });
      setNewTech('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
  };

  const removeImage = (url) => {
    setFormData({
      ...formData,
      images: formData.images.filter(img => img !== url)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Portfolio</h2>
          <p className="text-gray-400 text-sm">Showcase your best work and projects</p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            resetForm();
            setModalOpen(true);
          }}
          className="btn-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Portfolio Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="glass-card rounded-lg p-6 animate-pulse">
              <div className="aspect-video bg-white/10 rounded-lg mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : portfolioItems.length === 0 ? (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-400 mb-6">Start building your portfolio by adding your first project</p>
            <Button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="glass-card border-0 card-hover overflow-hidden group">
              {/* Project Image */}
              {item.images?.[0] ? (
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setPreviewItem(item);
                          setPreviewMode(true);
                        }}
                        className="bg-white/20 backdrop-blur-sm border-0 text-white hover:bg-white/30"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditProject(item)}
                        className="bg-white/20 backdrop-blur-sm border-0 text-white hover:bg-white/30"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteProject(item.id)}
                        className="bg-red-500/20 backdrop-blur-sm border-0 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-white/40" />
                </div>
              )}

              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">{item.title}</h3>
                    <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>

                {/* Technologies */}
                {item.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.technologies.slice(0, 4).map(tech => (
                      <Badge key={tech} className="bg-white/5 text-gray-300 border-0 text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {item.technologies.length > 4 && (
                      <Badge className="bg-white/5 text-gray-400 border-0 text-xs">
                        +{item.technologies.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-2">
                  {item.live_demo_url && (
                    <Button size="sm" variant="outline" className="glass-card border-0 text-white text-xs" asChild>
                      <a href={item.live_demo_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-3 h-3 mr-1" />
                        Demo
                      </a>
                    </Button>
                  )}
                  {item.github_url && (
                    <Button size="sm" variant="outline" className="glass-card border-0 text-white text-xs" asChild>
                      <a href={item.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-3 h-3 mr-1" />
                        Code
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass-card border-0 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingItem ? 'Edit Project' : 'Add New Project'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Project Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., E-commerce Platform"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Category *</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your project, what it does, and your contribution..."
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-24"
              />
            </div>

            {/* Technologies */}
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Technologies Used</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="e.g., React, Node.js"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                />
                <Button type="button" onClick={addTechnology} size="sm" className="btn-primary text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map(tech => (
                  <Badge key={tech} className="bg-indigo-500/20 text-indigo-300 border-0">
                    {tech}
                    <button type="button" onClick={() => removeTechnology(tech)} className="ml-2">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Project Screenshots</label>
              <div className="glass-card rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
                >
                  {uploading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full"></div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Click to upload images</p>
                    </div>
                  )}
                </label>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {formData.images.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-full aspect-video object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Live Demo URL</label>
                <Input
                  value={formData.live_demo_url}
                  onChange={(e) => setFormData({...formData, live_demo_url: e.target.value})}
                  placeholder="https://..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">GitHub URL</label>
                <Input
                  value={formData.github_url}
                  onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                  placeholder="https://github.com/..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* Case Study */}
            <div className="glass-card rounded-lg p-4 space-y-3">
              <h4 className="text-white font-medium">Case Study (Optional)</h4>
              
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Problem</label>
                <Textarea
                  value={formData.case_study.problem}
                  onChange={(e) => setFormData({
                    ...formData,
                    case_study: {...formData.case_study, problem: e.target.value}
                  })}
                  placeholder="What problem did this project solve?"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-20 text-sm"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Solution</label>
                <Textarea
                  value={formData.case_study.solution}
                  onChange={(e) => setFormData({
                    ...formData,
                    case_study: {...formData.case_study, solution: e.target.value}
                  })}
                  placeholder="How did you solve it?"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-20 text-sm"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Results</label>
                <Textarea
                  value={formData.case_study.results}
                  onChange={(e) => setFormData({
                    ...formData,
                    case_study: {...formData.case_study, results: e.target.value}
                  })}
                  placeholder="What were the outcomes?"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 h-20 text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                variant="outline"
                className="flex-1 glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveProject}
                className="flex-1 btn-primary text-white"
              >
                {editingItem ? 'Update Project' : 'Add Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {previewMode && previewItem && (
        <Dialog open={previewMode} onOpenChange={setPreviewMode}>
          <DialogContent className="glass-card border-0 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">{previewItem.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Images Gallery */}
              {previewItem.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {previewItem.images.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full rounded-lg" />
                  ))}
                </div>
              )}

              <div>
                <Badge className="bg-purple-500/20 text-purple-300 border-0 mb-3">
                  {previewItem.category}
                </Badge>
                <p className="text-gray-300">{previewItem.description}</p>
              </div>

              {previewItem.technologies?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewItem.technologies.map(tech => (
                      <Badge key={tech} className="bg-indigo-500/20 text-indigo-300 border-0">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {previewItem.case_study?.problem && (
                <div className="glass-card rounded-lg p-4 space-y-3">
                  <h4 className="text-white font-medium">Case Study</h4>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Problem:</p>
                    <p className="text-gray-300 text-sm">{previewItem.case_study.problem}</p>
                  </div>
                  {previewItem.case_study.solution && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Solution:</p>
                      <p className="text-gray-300 text-sm">{previewItem.case_study.solution}</p>
                    </div>
                  )}
                  {previewItem.case_study.results && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Results:</p>
                      <p className="text-gray-300 text-sm">{previewItem.case_study.results}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                {previewItem.live_demo_url && (
                  <Button className="btn-primary text-white" asChild>
                    <a href={previewItem.live_demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live Demo
                    </a>
                  </Button>
                )}
                {previewItem.github_url && (
                  <Button variant="outline" className="glass-card border-0 text-white" asChild>
                    <a href={previewItem.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}