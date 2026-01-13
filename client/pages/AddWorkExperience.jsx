import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Save,
  Plus,
  X,
  ArrowLeft
} from "lucide-react";

export default function AddWorkExperience() {
  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    company_logo_url: "",
    location: "",
    employment_type: "Full-time",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    skills_used: [],
    projects: [],
    achievements: []
  });
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [newProject, setNewProject] = useState({ name: "", description: "", url: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, company_logo_url: file_url });
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = null;
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_used.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills_used: [...formData.skills_used, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills_used: formData.skills_used.filter(s => s !== skill)
    });
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement.trim()]
      });
      setNewAchievement("");
    }
  };

  const removeAchievement = (index) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index)
    });
  };

  const addProject = () => {
    if (newProject.name.trim()) {
      setFormData({
        ...formData,
        projects: [...formData.projects, { ...newProject }]
      });
      setNewProject({ name: "", description: "", url: "" });
    }
  };

  const removeProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.job_title || !formData.company_name || !formData.start_date) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.is_current && !formData.end_date) {
      alert('Please provide an end date or mark as current position');
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      
      await base44.entities.WorkExperience.create({
        user_id: user.id,
        ...formData
      });

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '✅ Work Experience Added',
        message: `Added ${formData.job_title} at ${formData.company_name} to your profile`,
        link: createPageUrl('Profile')
      });

      window.location.href = createPageUrl('Profile');
    } catch (error) {
      console.error('Error saving work experience:', error);
      alert('Failed to save work experience. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Button
          onClick={() => window.location.href = createPageUrl('Profile')}
          variant="outline"
          className="glass-card border-0 text-white hover:bg-white/5 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>
        
        <h1 className="text-3xl font-bold text-white mb-2">Add Work Experience</h1>
        <p className="text-gray-400">Share your professional journey</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Title */}
            <div>
              <Label className="text-gray-300">Job Title *</Label>
              <Input
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                placeholder="e.g., Senior Scripter"
                required
                className="mt-1 bg-white/5 border-white/20 text-white"
              />
            </div>

            {/* Company Name */}
            <div>
              <Label className="text-gray-300">Company Name *</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g., Acme Studios"
                required
                className="mt-1 bg-white/5 border-white/20 text-white"
              />
            </div>

            {/* Company Logo */}
            <div>
              <Label className="text-gray-300">Company Logo (Optional)</Label>
              <div className="mt-1">
                {formData.company_logo_url ? (
                  <div className="flex items-center gap-3">
                    <img 
                      src={formData.company_logo_url} 
                      alt="Company Logo"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setFormData({ ...formData, company_logo_url: "" })}
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <div className="glass-card rounded-lg p-4 text-center hover:bg-white/5 transition-all">
                      {uploadingLogo ? (
                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Click to upload logo</p>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Employment Type and Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Employment Type *</Label>
                <Select value={formData.employment_type} onValueChange={(value) => setFormData({ ...formData, employment_type: value })}>
                  <SelectTrigger className="mt-1 bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Remote, San Francisco, USA"
                  className="mt-1 bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Start and End Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="mt-1 bg-white/5 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">End Date {!formData.is_current && '*'}</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={formData.is_current}
                  required={!formData.is_current}
                  className="mt-1 bg-white/5 border-white/20 text-white disabled:opacity-50"
                />
              </div>
            </div>

            {/* Current Position Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_current"
                checked={formData.is_current}
                onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked, end_date: checked ? "" : formData.end_date })}
              />
              <Label htmlFor="is_current" className="text-gray-300 cursor-pointer">
                I currently work here
              </Label>
            </div>

            {/* Description */}
            <div>
              <Label className="text-gray-300">Job Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your role, responsibilities, and key projects..."
                className="mt-1 bg-white/5 border-white/20 text-white h-32"
              />
            </div>

            {/* Skills Used */}
            <div>
              <Label className="text-gray-300">Skills Used</Label>
              <div className="flex gap-2 mt-1 mb-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  className="bg-white/5 border-white/20 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm" className="btn-primary text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills_used.map(skill => (
                  <Badge key={skill} className="bg-purple-500/20 text-purple-300 border-0">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <Label className="text-gray-300">Key Achievements</Label>
              <div className="flex gap-2 mt-1 mb-2">
                <Input
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Add an achievement..."
                  className="bg-white/5 border-white/20 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                />
                <Button type="button" onClick={addAchievement} size="sm" className="btn-primary text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.achievements.map((achievement, i) => (
                  <div key={i} className="glass-card rounded p-3 flex items-start justify-between">
                    <p className="text-gray-300 text-sm flex-1">{achievement}</p>
                    <button type="button" onClick={() => removeAchievement(i)} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <Label className="text-gray-300">Notable Projects</Label>
              <div className="grid gap-2 mt-1 mb-2">
                <Input
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Project name"
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Project description"
                  className="bg-white/5 border-white/20 text-white"
                />
                <div className="flex gap-2">
                  <Input
                    value={newProject.url}
                    onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                    placeholder="Project URL (optional)"
                    className="bg-white/5 border-white/20 text-white flex-1"
                  />
                  <Button type="button" onClick={addProject} size="sm" className="btn-primary text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {formData.projects.map((project, i) => (
                  <div key={i} className="glass-card rounded p-3">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-white font-medium">{project.name}</h4>
                      <button type="button" onClick={() => removeProject(i)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm">{project.description}</p>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">
                        {project.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            onClick={() => window.location.href = createPageUrl('Profile')}
            variant="outline"
            className="flex-1 glass-card border-white/20 text-white hover:bg-white/5"
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
                Save Experience
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}