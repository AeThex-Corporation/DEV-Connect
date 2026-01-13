
import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import JobApplicationModal from "../components/JobApplicationModal";
import AIJobRecommendations from "../components/AIJobRecommendations"; // NEW IMPORT
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // NEW IMPORT
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Star,
  Users,
  BookmarkPlus,
  Bookmark,
  X,
  Save,
  Bell,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");
  const [selectedScope, setSelectedScope] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedRemote, setSelectedRemote] = useState("all");
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedTimezones, setSelectedTimezones] = useState([]);
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(500);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [alertName, setAlertName] = useState("");
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCompanySize, setSelectedCompanySize] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState("list");
  const [datePosted, setDatePosted] = useState("all");
  const [user, setUser] = useState(null);
  const [activeJobTab, setActiveJobTab] = useState("browse"); // NEW STATE
  const queryClient = useQueryClient();

  const roles = ["Full Stack Developer", "Frontend Developer", "Backend Developer", "Mobile Developer", "Game Developer", "AI/ML Engineer", "DevOps Engineer", "UI/UX Designer", "3D Artist", "Technical Artist", "Blockchain Developer", "Data Engineer"];
  const paymentTypes = ["USD", "EUR", "Crypto", "Hourly Rate", "Fixed Price", "Equity", "Rev-Share"];
  const scopeTypes = ["Small Task", "Part-time Project", "Full-time Project", "Long-term Partnership"];
  const experienceLevels = ["Junior", "Mid-Level", "Senior", "Lead", "Principal"];
  const remoteTypes = ["Remote", "Hybrid", "On-site"];

  const languages = ["JavaScript", "Python", "TypeScript", "Java", "C#", "C++", "Go", "Rust", "Swift", "Kotlin", "Ruby", "PHP", "Solidity"];
  const frameworks = ["React", "Vue", "Angular", "Node.js", "Django", "Flask", "Spring", "Laravel", ".NET", "Unity", "Unreal Engine", "TensorFlow", "PyTorch"];
  const locations = ["United States", "United Kingdom", "Canada", "Germany", "Australia", "India", "Remote Worldwide", "Europe", "Asia", "North America"];
  const timezones = ["UTC-8 (PST)", "UTC-5 (EST)", "UTC+0 (GMT)", "UTC+1 (CET)", "UTC+5:30 (IST)", "UTC+8 (CST)", "UTC+10 (AEST)"];

  useEffect(() => {
    loadJobs();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Use React Query for saved jobs
  const { data: savedJobs = [] } = useQuery({
    queryKey: ['saved-jobs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.SavedJob.filter({ user_id: user.id });
    },
    enabled: !!user
  });

  const toggleSaveJobMutation = useMutation({
    mutationFn: async (job) => {
      const saved = savedJobs.find(s => s.job_id === job.id);
      if (saved) {
        await base44.entities.SavedJob.delete(saved.id);
      } else {
        await base44.entities.SavedJob.create({
          user_id: user.id,
          job_id: job.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-jobs']);
    }
  });

  const isJobSaved = (jobId) => {
    return savedJobs.some(s => s.job_id === jobId);
  };

  const loadJobs = async () => {
    try {
      const jobData = await base44.entities.Job.filter({ status: "Open" }, "-created_date");
      setJobs(jobData);

      // Log external jobs for debugging
      const externalJobs = jobData.filter(j => j.metadata?.external || j.employer_id === 'roblox_external');
      console.log('External jobs found:', externalJobs.length);
      console.log('Sample external job:', externalJobs[0]);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = useCallback(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== "all") {
      filtered = filtered.filter(job =>
        job.required_roles?.includes(selectedRole)
      );
    }

    if (selectedPayment !== "all") {
      filtered = filtered.filter(job => job.payment_type === selectedPayment);
    }

    if (selectedScope !== "all") {
      filtered = filtered.filter(job => job.project_scope === selectedScope);
    }

    if (selectedExperience !== "all") {
      filtered = filtered.filter(job => job.experience_level === selectedExperience);
    }

    if (selectedRemote !== "all") {
      filtered = filtered.filter(job => job.remote_type === selectedRemote);
    }

    // Company Size Filter
    if (selectedCompanySize !== "all") {
      filtered = filtered.filter(job => job.company_size === selectedCompanySize);
    }

    // NEW: Date Posted Filter
    if (datePosted !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      if (datePosted === "24h") {
        cutoffDate.setHours(now.getHours() - 24);
      } else if (datePosted === "week") {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (datePosted === "month") {
        cutoffDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(job => new Date(job.created_date) >= cutoffDate);
    }

    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(job =>
        selectedLanguages.some(lang => job.programming_languages?.includes(lang))
      );
    }

    if (selectedFrameworks.length > 0) {
      filtered = filtered.filter(job =>
        selectedFrameworks.some(fw => job.frameworks?.includes(fw))
      );
    }

    if (selectedLocations.length > 0) {
      filtered = filtered.filter(job =>
        selectedLocations.some(loc => job.preferred_locations?.includes(loc))
      );
    }

    if (selectedTimezones.length > 0) {
      filtered = filtered.filter(job =>
        selectedTimezones.some(tz => job.preferred_timezones?.includes(tz))
      );
    }

    if (minBudget > 0 || maxBudget < 500) { // Max budget adjusted to 500
      filtered = filtered.filter(job => {
        const jobMin = job.min_hourly_rate || 0;
        const jobMax = job.max_hourly_rate || Infinity; // Use Infinity for open-ended max
        return jobMin >= minBudget && jobMax <= maxBudget;
      });
    }

    // Sorting
    if (sortBy === "date") {
      filtered = filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === "budget") {
      filtered = filtered.sort((a, b) => {
        const budgetA = parseFloat(a.max_hourly_rate || a.min_hourly_rate) || 0;
        const budgetB = parseFloat(b.max_hourly_rate || b.min_hourly_rate) || 0;
        return budgetB - budgetA;
      });
    } else if (sortBy === "deadline") {
      // NEW: Sort by application deadline
      filtered = filtered.sort((a, b) => {
        if (!a.application_deadline) return 1; // Jobs without deadline go last
        if (!b.application_deadline) return -1; // Jobs without deadline go last
        return new Date(a.application_deadline) - new Date(b.application_deadline); // Soonest deadline first
      });
    } else if (sortBy === "applications") {
      // NEW: Sort by least applications (better chances)
      filtered = filtered.sort((a, b) => (a.application_count || 0) - (b.application_count || 0));
    } else if (sortBy === "relevance") {
      // Enhanced relevance with user profile matching
      filtered = filtered.map(job => {
        let relevanceScore = 0;

        // Role matching
        if (selectedRole !== "all" && job.required_roles?.includes(selectedRole)) relevanceScore += 10;

        // User's skills matching
        if (user?.skills && job.required_skills) {
          job.required_skills.forEach(skill => {
            if (user.skills.includes(skill)) relevanceScore += 5;
          });
        }

        // User's roles matching
        if (user?.developer_roles && job.required_roles) {
          job.required_roles.forEach(role => {
            if (user.developer_roles.includes(role)) relevanceScore += 8;
          });
        }

        // Language matching
        selectedLanguages.forEach(lang => {
          if (job.programming_languages?.includes(lang)) relevanceScore += 3;
        });

        // Framework matching
        selectedFrameworks.forEach(fw => {
          if (job.frameworks?.includes(fw)) relevanceScore += 2;
        });

        // Experience level match
        if (user?.experience_level && user.experience_level === job.experience_level) relevanceScore += 5;

        return { ...job, relevanceScore };
      }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedRole, selectedPayment, selectedScope, selectedExperience, selectedRemote, selectedLanguages, selectedFrameworks, selectedLocations, selectedTimezones, selectedCompanySize, minBudget, maxBudget, sortBy, datePosted, user]);

  useEffect(() => {
    filterJobs();
  }, [filterJobs]);

  const handleApply = (job) => {
    // If external job (either by metadata or employer_id), open original URL
    if ((job.metadata?.external || job.employer_id === 'roblox_external') && job.metadata?.original_url) {
      window.open(job.metadata.original_url, '_blank');
      return;
    }

    // Otherwise open application modal
    setSelectedJob(job);
    setApplicationModalOpen(true);
  };

  const handleSaveAlert = async () => {
    if (!alertName.trim()) {
      alert('Please enter an alert name');
      return;
    }

    try {
      if (!user) {
        alert('Please log in to save alerts.');
        return;
      }
      await base44.entities.JobAlert.create({
        user_id: user.id,
        name: alertName,
        roles: selectedRole !== "all" ? [selectedRole] : [],
        programming_languages: selectedLanguages,
        frameworks: selectedFrameworks,
        project_scope: selectedScope !== "all" ? [selectedScope] : [],
        experience_level: selectedExperience !== "all" ? [selectedExperience] : [],
        preferred_locations: selectedLocations,
        preferred_timezones: selectedTimezones,
        remote_type: selectedRemote !== "all" ? [selectedRemote] : [],
        company_size: selectedCompanySize !== "all" ? selectedCompanySize : undefined,
        min_budget: minBudget,
        max_budget: maxBudget,
        keywords: searchTerm ? [searchTerm] : [],
        frequency: 'daily',
        active: true
      });

      setShowSaveAlert(false);
      setAlertName("");
      alert('Job alert saved successfully!');
    } catch (error) {
      console.error('Error saving alert:', error);
      alert('Failed to save alert');
    }
  };

  const toggleLanguage = (lang) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleFramework = (fw) => {
    setSelectedFrameworks(prev =>
      prev.includes(fw) ? prev.filter(f => f !== fw) : [...prev, fw]
    );
  };

  const toggleLocation = (loc) => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const toggleTimezone = (tz) => {
    setSelectedTimezones(prev =>
      prev.includes(tz) ? prev.filter(t => t !== tz) : [...prev, tz]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedPayment("all");
    setSelectedScope("all");
    setSelectedExperience("all");
    setSelectedRemote("all");
    setSelectedCompanySize("all");
    setDatePosted("all");
    setSelectedLanguages([]);
    setSelectedFrameworks([]);
    setSelectedLocations([]);
    setSelectedTimezones([]);
    setMinBudget(0);
    setMaxBudget(500);
    setSortBy("date");
  };

  const getMatchPercentage = (job) => {
    if (!user) return 0;

    let matches = 0;
    let total = 0;

    // Role matching
    if (job.required_roles?.length > 0 && user.developer_roles?.length > 0) {
      total += job.required_roles.length;
      job.required_roles.forEach(role => {
        if (user.developer_roles.includes(role)) matches++;
      });
    }

    // Skill matching
    if (job.required_skills?.length > 0 && user.skills?.length > 0) {
      total += job.required_skills.length;
      job.required_skills.forEach(skill => {
        if (user.skills.includes(skill)) matches++;
      });
    }

    // Experience level
    if (job.experience_level && user.experience_level) {
      total += 1;
      if (user.experience_level === job.experience_level) matches += 1;
    }

    return total > 0 ? Math.round((matches / total) * 100) : 0;
  };

  const getUrgencyBadge = (job) => {
    if (!job.application_deadline) return null;

    const daysUntilDeadline = Math.ceil(
      (new Date(job.application_deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDeadline < 0) return null;
    if (daysUntilDeadline <= 2) return { text: 'Urgent', color: 'bg-red-500/20 text-red-400' };
    if (daysUntilDeadline <= 7) return { text: `${daysUntilDeadline}d left`, color: 'bg-orange-500/20 text-orange-400' };
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Find Your Next Project 🚀
        </h1>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-gray-400 text-sm">
            {filteredJobs.length} jobs match your criteria
            {filteredJobs.filter(j => j.metadata?.external || j.employer_id === 'roblox_external').length > 0 && (
              <span className="ml-2 text-purple-400">
                • {filteredJobs.filter(j => j.metadata?.external || j.employer_id === 'roblox_external').length} from external sources
              </span>
            )}
          </p>

          {/* NEW: Quick Links */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.location.href = '/my-applications'}
              size="sm"
              variant="outline"
              className="glass-card border-0 text-white hover:bg-white/5"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              My Applications
            </Button>
            <Button
              onClick={() => window.location.href = '/saved-jobs'}
              size="sm"
              variant="outline"
              className="glass-card border-0 text-white hover:bg-white/5"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Jobs
            </Button>
          </div>
        </div>
      </div>

      {/* NEW: Tabs for Browse vs Recommended */}
      <Tabs value={activeJobTab} onValueChange={setActiveJobTab} className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Browse All Jobs
          </TabsTrigger>
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse">
          {/* Sort and Filter Options */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {/* Date Posted Filter */}
            <Select value={datePosted} onValueChange={setDatePosted}>
              <SelectTrigger className="glass-card border-0 text-white text-sm w-32">
                <SelectValue placeholder="Date Posted" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="glass-card border-0 text-white text-sm w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Latest First</SelectItem>
                <SelectItem value="budget">Highest Budget</SelectItem>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="deadline">Deadline Soon</SelectItem>
                <SelectItem value="applications">Least Competitive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search & Basic Filters */}
          <div className="glass-card rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500 text-sm"
                  />
                </div>
              </div>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="glass-card border-0 text-white text-sm">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger className="glass-card border-0 text-white text-sm">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {experienceLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRemote} onValueChange={setSelectedRemote}>
                <SelectTrigger className="glass-card border-0 text-white text-sm">
                  <SelectValue placeholder="Work Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {remoteTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Company Size Filter */}
              <Select value={selectedCompanySize} onValueChange={setSelectedCompanySize}>
                <SelectTrigger className="glass-card border-0 text-white text-sm">
                  <SelectValue placeholder="Company Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="glass-card border-0 text-white hover:bg-white/5"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                {/* Programming Languages */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Programming Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
                      <Button
                        key={lang}
                        size="sm"
                        variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                        onClick={() => toggleLanguage(lang)}
                        className={selectedLanguages.includes(lang)
                          ? "btn-primary text-white text-xs"
                          : "glass-card border-0 text-white hover:bg-white/5 text-xs"
                        }
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Frameworks */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Frameworks & Technologies</label>
                  <div className="flex flex-wrap gap-2">
                    {frameworks.map(fw => (
                      <Button
                        key={fw}
                        size="sm"
                        variant={selectedFrameworks.includes(fw) ? "default" : "outline"}
                        onClick={() => toggleFramework(fw)}
                        className={selectedFrameworks.includes(fw)
                          ? "btn-primary text-white text-xs"
                          : "glass-card border-0 text-white hover:bg-white/5 text-xs"
                        }
                      >
                        {fw}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-white text-sm font-medium">
                      Hourly Rate: ${minBudget} - ${maxBudget}/hr
                    </label>
                    <button
                      onClick={() => {
                        setMinBudget(0);
                        setMaxBudget(500);
                      }}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>
                  <Slider
                    value={[minBudget, maxBudget]}
                    onValueChange={([min, max]) => {
                      setMinBudget(min);
                      setMaxBudget(max);
                    }}
                    min={0}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>$500+</span>
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Preferred Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {locations.map(loc => (
                      <Button
                        key={loc}
                        size="sm"
                        variant={selectedLocations.includes(loc) ? "default" : "outline"}
                        onClick={() => toggleLocation(loc)}
                        className={selectedLocations.includes(loc)
                          ? "btn-primary text-white text-xs"
                          : "glass-card border-0 text-white hover:bg-white/5 text-xs"
                        }
                      >
                        {loc}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Timezones */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Preferred Timezones</label>
                  <div className="flex flex-wrap gap-2">
                    {timezones.map(tz => (
                      <Button
                        key={tz}
                        size="sm"
                        variant={selectedTimezones.includes(tz) ? "default" : "outline"}
                        onClick={() => toggleTimezone(tz)}
                        className={selectedTimezones.includes(tz)
                          ? "btn-primary text-white text-xs"
                          : "glass-card border-0 text-white hover:bg-white/5 text-xs"
                        }
                      >
                        {tz}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="sm"
                    className="glass-card border-0 text-white hover:bg-white/5"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setShowSaveAlert(true)}
                    size="sm"
                    className="btn-primary text-white"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Save as Alert
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const matchPercentage = getMatchPercentage(job);
              const urgencyBadge = getUrgencyBadge(job);
              const isSaved = isJobSaved(job.id);
              const isExternal = job.employer_id === 'roblox_external' || job.metadata?.external === true;
              const externalSource = job.metadata?.source || 'External Source';
              const externalUrl = job.metadata?.original_url;
              const companyName = job.metadata?.company_name;

              return (
                <Card
                  key={job.id}
                  className={`border-0 card-hover ${
                    isExternal
                      ? 'bg-gradient-to-r from-purple-900/20 to-transparent border-l-4 border-purple-500'
                      : 'glass-card'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {/* PROMINENT External Source Badge */}
                          {isExternal && (
                            <Badge className="bg-purple-500 text-white border-0 text-xs px-3 py-1 font-semibold">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {externalSource}
                            </Badge>
                          )}

                          <h2 className="text-xl font-bold text-white">{job.title}</h2>

                          {/* Company Name for External Jobs */}
                          {isExternal && companyName && (
                            <Badge className="bg-white/10 text-white border-0 text-xs">
                              {companyName}
                            </Badge>
                          )}

                          {/* Match Percentage */}
                          {matchPercentage >= 70 && (
                            <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                              {matchPercentage}% Match
                            </Badge>
                          )}

                          {/* Urgency Badge */}
                          {urgencyBadge && (
                            <Badge className={`${urgencyBadge.color} border-0 text-xs animate-pulse`}>
                              ⚡ {urgencyBadge.text}
                            </Badge>
                          )}

                          {/* New Job Badge */}
                          {new Date(job.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                              New
                            </Badge>
                          )}

                          {/* Save Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (user) {
                                toggleSaveJobMutation.mutate(job);
                              } else {
                                alert('Please log in to save jobs.');
                              }
                            }}
                            className={`ml-auto p-1.5 rounded-lg transition-all ${
                              isSaved
                                ? 'text-yellow-400 bg-yellow-500/10'
                                : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                            }`}
                            title={isSaved ? "Unsave Job" : "Save Job"}
                          >
                            {isSaved ? (
                              <Bookmark className="w-5 h-5 fill-current" />
                            ) : (
                              <BookmarkPlus className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{job.description}</p>

                        {/* External Job Source Citation - PROMINENT */}
                        {isExternal && externalUrl && (
                          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ExternalLink className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-purple-300 font-semibold text-sm mb-1">
                                  External Job Posting
                                </p>
                                <p className="text-gray-300 text-xs mb-2">
                                  This job is posted on <strong className="text-purple-400">{externalSource}</strong>.
                                  All application details and requirements are on their website.
                                </p>
                                <a
                                  href={externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-xs font-medium transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span className="underline">View original job posting →</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.required_roles?.slice(0, 2).map((role) => (
                            <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                              {role}
                            </Badge>
                          ))}
                          {job.programming_languages?.slice(0, 3).map((lang) => (
                            <Badge key={lang} className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                              {lang}
                            </Badge>
                          ))}
                          {job.frameworks?.slice(0, 2).map((fw) => (
                            <Badge key={fw} className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                              {fw}
                            </Badge>
                          ))}
                          <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                            {job.remote_type}
                          </Badge>
                          {job.company_size && (
                            <Badge className="bg-gray-500/20 text-gray-300 border-0 text-xs">
                              {job.company_size} employees
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-400">
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {job.budget_range || (job.min_hourly_rate || job.max_hourly_rate ? `$${job.min_hourly_rate || '0'} - $${job.max_hourly_rate || 'N/A'}/hr` : 'Negotiable')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {job.timeline || 'Flexible'}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {job.experience_level}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {job.application_count || 0} applicants
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button
                          className={isExternal
                            ? "bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
                            : "btn-primary text-white text-sm"
                          }
                          onClick={() => handleApply(job)}
                        >
                          {isExternal ? (
                            <>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Apply on {externalSource} →
                            </>
                          ) : (
                            'Apply Now'
                          )}
                        </Button>
                        {matchPercentage >= 80 && (
                          <Badge className="bg-green-500/20 text-green-400 border-0 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Perfect Match
                          </Badge>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs">
                        Posted {job.created_date ? new Date(job.created_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="glass-card rounded-lg p-8 max-w-md mx-auto">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No jobs found</h3>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your filters</p>
                <Button
                  onClick={clearAllFilters}
                  className="glass-card text-white px-4 py-2 rounded-lg text-sm hover:bg-white/5"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* NEW: AI Recommendations Tab */}
        <TabsContent value="recommended">
          {user ? (
            <AIJobRecommendations
              user={user}
              onJobSelect={(job) => {
                setSelectedJob(job);
                setApplicationModalOpen(true);
              }}
            />
          ) : (
            <div className="glass-card rounded-lg p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Log in to see recommendations</h3>
              <p className="text-gray-400">
                AI-powered job matching requires a user profile
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Save Alert Modal */}
      {showSaveAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="glass-card border-0 w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Save Job Alert</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get notified when jobs matching your filters are posted
              </p>
              <Input
                placeholder="Alert name (e.g., Senior React Jobs)"
                value={alertName}
                onChange={(e) => setAlertName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowSaveAlert(false)}
                  variant="outline"
                  className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAlert}
                  className="flex-1 btn-primary text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <JobApplicationModal
        isOpen={applicationModalOpen}
        onClose={() => setApplicationModalOpen(false)}
        job={selectedJob}
        onSubmit={() => setApplicationModalOpen(false)}
      />
    </div>
  );
}
