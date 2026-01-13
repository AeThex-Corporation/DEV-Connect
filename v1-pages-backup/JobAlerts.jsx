
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label"; // New import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  Search, // New import
  BellOff, // New import
} from "lucide-react";

export default function JobAlerts() {
  const [user, setUser] = useState(null); // New state
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // Renamed from showCreateModal
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    keywords: [], // New field
    roles: [],
    min_budget: '', // Changed type
    max_budget: '', // Changed type
    project_scope: [], // New field
    experience_level: [], // New field
    frequency: 'daily',
    active: true
  });
  const [newKeyword, setNewKeyword] = useState(''); // New state
  const [matchingJobs, setMatchingJobs] = useState([]); // New state

  const roles = ["Scripter", "Builder", "UI/UX Designer", "3D Modeler", "Sound Designer", "Game Designer", "Artist", "Animator", "VFX Designer"]; // Updated list
  const projectScopes = ["Small Task", "Part-time Project", "Full-time Project", "Long-term Partnership"]; // New constant
  const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Expert"]; // New constant

  // Helper for creating page URLs (assuming this is an existing helper in the project)
  const createPageUrl = (pageName) => {
    switch (pageName) {
      case 'JobAlerts':
        return '/job-alerts';
      case 'Jobs':
        return '/jobs';
      default:
        return '#';
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => { // Renamed from loadAlerts
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser); // Set user state

      const userAlerts = await base44.entities.JobAlert.filter({ user_id: currentUser.id }); // Use currentUser.id
      setAlerts(userAlerts);
    } catch (error) {
      console.error('Error loading job alerts:', error); // Updated error message
    } finally {
      setLoading(false);
    }
  };

  const testAlert = async (alert) => { // New function
    try {
      // Find matching jobs
      const allJobs = await base44.entities.Job.filter({ status: "Open" });

      const matches = allJobs.filter(job => {
        // Check keywords
        if (alert.keywords && alert.keywords.length > 0) {
          const hasKeyword = alert.keywords.some(keyword =>
            job.title?.toLowerCase().includes(keyword.toLowerCase()) ||
            job.description?.toLowerCase().includes(keyword.toLowerCase())
          );
          if (!hasKeyword) return false;
        }

        // Check roles
        if (alert.roles && alert.roles.length > 0) {
          const hasRole = alert.roles.some(role =>
            job.required_roles?.includes(role)
          );
          if (!hasRole) return false;
        }

        // Check budget
        if (alert.min_budget || alert.max_budget) {
          // This is a simplified check. A real implementation would parse job.budget_range (e.g., "$100-$200/hr")
          // and compare it to alert.min_budget and alert.max_budget.
          // For now, if either min/max budget is set, we assume a match if the job has a budget.
          // In a real scenario, you'd need a robust budget comparison logic.
          const jobHasBudget = job.budget_range && job.budget_range !== "Not specified";
          const alertMin = alert.min_budget || 0;
          const alertMax = alert.max_budget || Infinity;

          // Placeholder for actual budget parsing and comparison
          // Example:
          // if (job.budget_range) {
          //   const [min, max] = parseJobBudget(job.budget_range); // Custom function needed
          //   if (!(min <= alertMax && max >= alertMin)) return false;
          // } else if (alertMin > 0) return false; // If job has no budget but alert requires one
          
          if (!jobHasBudget && (alertMin > 0 || alertMax < Infinity)) return false; // If job has no budget, but alert specifies one
        }

        // Check project scope
        if (alert.project_scope && alert.project_scope.length > 0) {
          if (!alert.project_scope.includes(job.project_scope)) return false;
        }

        // Check experience level
        if (alert.experience_level && alert.experience_level.length > 0) {
          if (!alert.experience_level.includes(job.experience_level)) return false;
        }

        return true;
      });

      setMatchingJobs(matches);

      if (matches.length > 0) {
        alert(`Found ${matches.length} matching job${matches.length > 1 ? 's' : ''}!`);
      } else {
        alert('No matching jobs found. Try adjusting your criteria.');
      }
    } catch (error) {
      console.error('Error testing alert:', error);
      alert('Failed to test alert.');
    }
  };

  const saveAlert = async () => { // Renamed from handleSaveAlert
    if (!formData.name.trim()) {
      alert('Please enter an alert name');
      return;
    }

    try {
      const alertData = {
        ...formData,
        user_id: user.id, // Ensure user ID is attached
        min_budget: formData.min_budget ? parseFloat(formData.min_budget) : null, // Parse budget
        max_budget: formData.max_budget ? parseFloat(formData.max_budget) : null // Parse budget
      };

      if (editingAlert) {
        await base44.entities.JobAlert.update(editingAlert.id, alertData);
      } else {
        await base44.entities.JobAlert.create(alertData);
      }

      await loadData(); // Reload alerts
      setShowForm(false); // Close form
      setEditingAlert(null); // Clear editing state
      resetForm(); // Reset form fields

      // Create notification for saving alert
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'message',
        title: '✅ Job Alert Saved',
        message: `Your "${formData.name}" alert is now active`,
        link: createPageUrl('JobAlerts')
      });
    } catch (error) {
      console.error('Error saving alert:', error);
      alert('Failed to save alert');
    }
  };

  const editAlert = (alert) => { // Renamed from handleEditAlert
    setEditingAlert(alert);
    setFormData({
      name: alert.name,
      keywords: alert.keywords || [],
      roles: alert.roles || [],
      min_budget: alert.min_budget || '',
      max_budget: alert.max_budget || '',
      project_scope: alert.project_scope || [],
      experience_level: alert.experience_level || [],
      frequency: alert.frequency || 'daily',
      active: alert.active !== false // Ensure active is true by default if not specified
    });
    setShowForm(true); // Open form
  };

  const deleteAlert = async (alertId) => { // Renamed from handleDeleteAlert
    if (!confirm('Delete this job alert?')) return; // Confirm deletion

    try {
      await base44.entities.JobAlert.delete(alertId);
      await loadData(); // Reload alerts after deletion
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Failed to delete alert');
    }
  };

  const toggleAlertStatus = async (alert) => {
    try {
      await base44.entities.JobAlert.update(alert.id, {
        active: !alert.active
      });
      await loadData(); // Reload alerts to show updated status
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  // New functions for form management
  const resetForm = () => {
    setFormData({
      name: '',
      keywords: [],
      roles: [],
      min_budget: '',
      max_budget: '',
      project_scope: [],
      experience_level: [],
      frequency: 'daily',
      active: true
    });
    setNewKeyword('');
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  const toggleRole = (role) => {
    const currentRoles = formData.roles || [];
    if (currentRoles.includes(role)) {
      setFormData({
        ...formData,
        roles: currentRoles.filter(r => r !== role)
      });
    } else {
      setFormData({
        ...formData,
        roles: [...currentRoles, role]
      });
    }
  };

  const toggleScope = (scope) => {
    const currentScopes = formData.project_scope || [];
    if (currentScopes.includes(scope)) {
      setFormData({
        ...formData,
        project_scope: currentScopes.filter(s => s !== scope)
      });
    } else {
      setFormData({
        ...formData,
        project_scope: [...currentScopes, scope]
      });
    }
  };

  const toggleExperience = (level) => {
    const currentLevels = formData.experience_level || [];
    if (currentLevels.includes(level)) {
      setFormData({
        ...formData,
        experience_level: currentLevels.filter(l => l !== level)
      });
    } else {
      setFormData({
        ...formData,
        experience_level: [...currentLevels, level]
      });
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Job Alerts</h1>
          <p className="text-gray-400 text-sm">
            Get notified when jobs matching your criteria are posted
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true); // Open form
            setEditingAlert(null); // Clear editing state
            resetForm(); // Reset form fields
          }}
          className="btn-primary text-white"
        >
          <Bell className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Alert Form */}
      {showForm && (
        <Card className="glass-card border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-white">
              {editingAlert ? 'Edit Alert' : 'Create New Alert'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Alert Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Senior Scripter Jobs"
                className="mt-1 bg-white/5 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Keywords</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Add keyword..."
                  className="bg-white/5 border-white/20 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                />
                <Button onClick={addKeyword} size="sm" className="btn-primary text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map(keyword => (
                  <Badge key={keyword} className="bg-indigo-500/20 text-indigo-300 border-0">
                    {keyword}
                    <button type="button" onClick={() => removeKeyword(keyword)} className="ml-1 text-white/80 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Roles</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {roles.map(role => (
                  <Button
                    key={role}
                    type="button"
                    size="sm"
                    variant={formData.roles?.includes(role) ? "default" : "outline"}
                    onClick={() => toggleRole(role)}
                    className={formData.roles?.includes(role)
                      ? "btn-primary text-white"
                      : "glass-card border-white/20 text-white hover:bg-white/5"
                    }
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Min Budget (R$)</Label>
                <Input
                  type="number"
                  value={formData.min_budget}
                  onChange={(e) => setFormData({...formData, min_budget: e.target.value})}
                  placeholder="0"
                  className="mt-1 bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Max Budget (R$)</Label>
                <Input
                  type="number"
                  value={formData.max_budget}
                  onChange={(e) => setFormData({...formData, max_budget: e.target.value})}
                  placeholder="10000"
                  className="mt-1 bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Project Scope</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {projectScopes.map(scope => (
                  <Button
                    key={scope}
                    type="button"
                    size="sm"
                    variant={formData.project_scope?.includes(scope) ? "default" : "outline"}
                    onClick={() => toggleScope(scope)}
                    className={formData.project_scope?.includes(scope)
                      ? "btn-primary text-white"
                      : "glass-card border-white/20 text-white hover:bg-white/5"
                    }
                  >
                    {scope}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Experience Level</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {experienceLevels.map(level => (
                  <Button
                    key={level}
                    type="button"
                    size="sm"
                    variant={formData.experience_level?.includes(level) ? "default" : "outline"}
                    onClick={() => toggleExperience(level)}
                    className={formData.experience_level?.includes(level)
                      ? "btn-primary text-white"
                      : "glass-card border-white/20 text-white hover:bg-white/5"
                    }
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Notification Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({...formData, frequency: value})}
              >
                <SelectTrigger className="mt-1 bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instant</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button type="button" onClick={saveAlert} className="btn-primary text-white">
                <Check className="w-4 h-4 mr-2" />
                {editingAlert ? 'Update Alert' : 'Create Alert'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAlert(null);
                  resetForm();
                }}
                variant="outline"
                className="glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {alerts.length === 0 ? (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Job Alerts Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first alert to get notified about relevant jobs
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="btn-primary text-white"
            >
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <Card key={alert.id} className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold text-lg">{alert.name}</h3>
                      <Badge className={`${
                        alert.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      } border-0`}>
                        {alert.active ? 'Active' : 'Paused'}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                        {alert.frequency}
                      </Badge>
                    </div>

                    {alert.last_sent && (
                      <p className="text-gray-400 text-xs mb-3">
                        Last notification: {new Date(alert.last_sent).toLocaleDateString()}
                      </p>
                    )}

                    {alert.keywords && alert.keywords.length > 0 && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-xs mb-1">Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.keywords.map(keyword => (
                            <Badge key={keyword} className="bg-white/5 text-gray-300 border-0 text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {alert.roles && alert.roles.length > 0 && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-xs mb-1">Roles:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.roles.map(role => (
                            <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(alert.min_budget || alert.max_budget) && (
                      <div className="mb-2">
                         <p className="text-gray-400 text-xs mb-1">Budget:</p>
                        <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                          {alert.min_budget ? `R$${alert.min_budget}` : ''}
                          {alert.min_budget && alert.max_budget ? ' - ' : ''}
                          {alert.max_budget ? `R$${alert.max_budget}` : ''}
                          {!alert.min_budget && !alert.max_budget ? 'Any' : ''}
                        </Badge>
                      </div>
                    )}

                    {alert.project_scope && alert.project_scope.length > 0 && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-xs mb-1">Scope:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.project_scope.map(scope => (
                            <Badge key={scope} className="bg-orange-500/20 text-orange-300 border-0 text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {alert.experience_level && alert.experience_level.length > 0 && (
                      <div className="mb-2">
                        <p className="text-gray-400 text-xs mb-1">Experience:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.experience_level.map(level => (
                            <Badge key={level} className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => testAlert(alert)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                      title="Test Alert"
                    >
                      <Search className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => toggleAlertStatus(alert)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                      title={alert.active ? 'Pause Alert' : 'Activate Alert'}
                    >
                      {alert.active ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                    </Button>
                    <Button
                      onClick={() => editAlert(alert)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-white hover:bg-white/5"
                      title="Edit Alert"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => deleteAlert(alert.id)}
                      size="sm"
                      variant="outline"
                      className="glass-card border-0 text-red-400 hover:bg-red-500/10"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Matching Jobs */}
      {matchingJobs.length > 0 && (
        <Card className="glass-card border-0 mt-6">
          <CardHeader>
            <CardTitle className="text-white">
              Matching Jobs ({matchingJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {matchingJobs.slice(0, 5).map(job => (
              <div key={job.id} className="glass-card rounded-lg p-4">
                <h4 className="text-white font-semibold mb-1">{job.title}</h4>
                <p className="text-gray-400 text-sm line-clamp-2 mb-2">{job.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {job.required_roles?.slice(0, 2).map(role => (
                      <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                  <a href={createPageUrl('Jobs')} className="text-white"> {/* Using <a> tag as Link component context is not provided */}
                    <Button size="sm" className="btn-primary text-white">
                      View
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
