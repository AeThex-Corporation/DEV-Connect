
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  TrendingUp,
  Globe
} from "lucide-react";
import { isAdmin } from "@/components/utils/permissions";

export default function ExternalJobsManager() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingRoblox, setFetchingRoblox] = useState(false);
  const [fetchingZipRecruiter, setFetchingZipRecruiter] = useState(false);
  const [fetchingTalentHub, setFetchingTalentHub] = useState(false);
  const [stats, setStats] = useState({
    roblox_jobs: 0,
    ziprecruiter_jobs: 0,
    talent_hub_jobs: 0,
    total_external: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [lastSync, setLastSync] = useState({
    roblox: null,
    ziprecruiter: null,
    talent_hub: null
  });

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (!isAdmin(currentUser)) {
        alert('Access denied. Admin only.');
        window.location.href = '/';
        return;
      }

      await loadStats();
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get all jobs with external metadata
      const allJobs = await base44.entities.Job.list('-created_date', 200);
      
      const robloxJobs = allJobs.filter(job => 
        job.metadata?.external && job.metadata?.source === 'Roblox DevForum'
      );
      const zipRecruiterJobs = allJobs.filter(job => 
        job.metadata?.external && job.metadata?.source === 'ZipRecruiter'
      );
      const talentHubJobs = allJobs.filter(job =>
        job.metadata?.external && job.metadata?.source === 'Roblox Talent Hub'
      );

      setStats({
        roblox_jobs: robloxJobs.length,
        ziprecruiter_jobs: zipRecruiterJobs.length,
        talent_hub_jobs: talentHubJobs.length,
        total_external: robloxJobs.length + zipRecruiterJobs.length + talentHubJobs.length
      });

      // Get recent external jobs
      const external = allJobs
        .filter(job => job.metadata?.external)
        .slice(0, 15);
      setRecentJobs(external);

      // Check last sync times from most recent jobs
      if (robloxJobs.length > 0) {
        setLastSync(prev => ({
          ...prev,
          roblox: robloxJobs[0].created_date
        }));
      }
      if (zipRecruiterJobs.length > 0) {
        setLastSync(prev => ({
          ...prev,
          ziprecruiter: zipRecruiterJobs[0].created_date
        }));
      }
      if (talentHubJobs.length > 0) {
        setLastSync(prev => ({ ...prev, talent_hub: talentHubJobs[0].created_date }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFetchRobloxJobs = async () => {
    setFetchingRoblox(true);
    try {
      const response = await base44.functions.fetchRobloxJobs();

      if (response && response.success) {
        await base44.entities.Notification.create({
          user_id: user.id,
          type: 'message',
          title: '✅ Roblox Jobs Synced',
          message: `Successfully imported ${response.jobs_created || 0} new jobs from Roblox DevForum`,
          link: '/jobs'
        });

        alert(`Success! Imported ${response.jobs_created || 0} new jobs from Roblox DevForum`);
        await loadStats();
      } else {
        alert(response?.error || 'Failed to fetch Roblox jobs');
      }
    } catch (error) {
      console.error('Error fetching Roblox jobs:', error);
      alert('Error fetching Roblox jobs. Check console for details.');
    } finally {
      setFetchingRoblox(false);
    }
  };

  const handleFetchZipRecruiterJobs = async () => {
    setFetchingZipRecruiter(true);
    try {
      const response = await base44.functions.fetchZipRecruiterJobs('Roblox developer', 'Remote');

      if (response && response.success) {
        await base44.entities.Notification.create({
          user_id: user.id,
          type: 'message',
          title: '✅ ZipRecruiter Jobs Synced',
          message: `Successfully imported ${response.jobs_created || 0} new jobs from ZipRecruiter`,
          link: '/jobs'
        });

        alert(`Success! Imported ${response.jobs_created || 0} new jobs from ZipRecruiter`);
        await loadStats();
      } else {
        alert(response?.error || 'Failed to fetch ZipRecruiter jobs');
      }
    } catch (error) {
      console.error('Error fetching ZipRecruiter jobs:', error);
      alert('Error fetching ZipRecruiter jobs. Check console for details.');
    } finally {
      setFetchingZipRecruiter(false);
    }
  };

  const handleFetchTalentHub = async () => {
    setFetchingTalentHub(true);
    try {
      const response = await base44.functions.fetchRobloxTalentHub();

      if (response && response.success) {
        await base44.entities.Notification.create({
          user_id: user.id,
          type: 'message',
          title: '✅ Talent Hub Jobs Synced',
          message: `Successfully imported ${response.stats?.inserted || 0} new jobs from Roblox Talent Hub`,
          link: '/jobs'
        });

        alert(`Success! Imported ${response.stats?.inserted || 0} new jobs from Roblox Talent Hub`);
        await loadStats();
      } else {
        alert(response?.error || 'Failed to fetch Talent Hub jobs');
      }
    } catch (error) {
      console.error('Error fetching Talent Hub jobs:', error);
      alert('Error fetching Talent Hub jobs. This requires browser automation and may take 30-60 seconds.');
    } finally {
      setFetchingTalentHub(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">External Job Sources</h1>
        <p className="text-gray-400">
          Sync job postings from external platforms to expand opportunities
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Roblox DevForum</p>
                <p className="text-3xl font-bold text-white">{stats.roblox_jobs}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            {lastSync.roblox && (
              <p className="text-gray-500 text-xs mt-2">
                Last sync: {new Date(lastSync.roblox).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* NEW: Talent Hub Card */}
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Roblox Talent Hub</p>
                <p className="text-3xl font-bold text-white">{stats.talent_hub_jobs}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            {lastSync.talent_hub && (
              <p className="text-gray-500 text-xs mt-2">
                Last sync: {new Date(lastSync.talent_hub).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">ZipRecruiter</p>
                <p className="text-3xl font-bold text-white">{stats.ziprecruiter_jobs}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
            </div>
            {lastSync.ziprecruiter && (
              <p className="text-gray-500 text-xs mt-2">
                Last sync: {new Date(lastSync.ziprecruiter).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total External</p>
                <p className="text-3xl font-bold text-white">{stats.total_external}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Roblox DevForum */}
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.rbxcdn.com/c2be32293c1ce7ca9e186f06a0b3e823" 
                  alt="Roblox"
                  className="w-12 h-12"
                />
                <div>
                  <CardTitle className="text-white">Roblox DevForum</CardTitle>
                  <p className="text-gray-400 text-sm mt-1">Official Roblox job board</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-0">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass-card rounded-lg p-4 bg-blue-500/5">
              <p className="text-gray-300 text-sm mb-2">
                <strong>How it works:</strong>
              </p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>Scans DevForum Public Recruiting category</li>
                <li>Auto-detects roles from content</li>
                <li>Links to original DevForum posts</li>
                <li>Fetches up to 5 recent posts per category</li>
              </ul>
            </div>

            <Button
              onClick={handleFetchRobloxJobs}
              disabled={fetchingRoblox}
              className="w-full btn-primary text-white"
            >
              {fetchingRoblox ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching Jobs...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync DevForum Jobs
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="w-3 h-3" />
              Uses public DevForum JSON APIs
            </div>
          </CardContent>
        </Card>

        {/* NEW: Roblox Talent Hub Card */}
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Roblox Talent Hub</CardTitle>
                  <p className="text-gray-400 text-sm mt-1">Official Roblox hiring platform</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-0">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass-card rounded-lg p-4 bg-purple-500/5">
              <p className="text-gray-300 text-sm mb-2">
                <strong>How it works:</strong>
              </p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>Uses browser automation to scrape official Talent Hub</li>
                <li>Fetches official Roblox career opportunities</li>
                <li>Direct links to official job applications</li>
                <li>Takes 30-60 seconds to complete</li>
              </ul>
            </div>

            <div className="glass-card rounded-lg p-3 bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-300 text-xs">
                  Slower than API methods but accesses official job postings not available via API
                </p>
              </div>
            </div>

            <Button
              onClick={handleFetchTalentHub}
              disabled={fetchingTalentHub}
              className="w-full btn-primary text-white"
            >
              {fetchingTalentHub ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching (30-60s)...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Talent Hub
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="w-3 h-3" />
              Browser automation (slower but comprehensive)
            </div>
          </CardContent>
        </Card>

        {/* ZipRecruiter */}
        <Card className="glass-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">ZipRecruiter</CardTitle>
                  <p className="text-gray-400 text-sm mt-1">General job marketplace</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-0">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass-card rounded-lg p-4 bg-purple-500/5">
              <p className="text-gray-300 text-sm mb-2">
                <strong>How it works:</strong>
              </p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>AI extracts job data from search results</li>
                <li>Searches for "Roblox developer" remote jobs</li>
                <li>Includes salary & company info when available</li>
                <li>Direct apply links to ZipRecruiter</li>
              </ul>
            </div>

            <Button
              onClick={handleFetchZipRecruiterJobs}
              disabled={fetchingZipRecruiter}
              className="w-full btn-primary text-white"
            >
              {fetchingZipRecruiter ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching Jobs...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync ZipRecruiter Jobs
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="w-3 h-3" />
              AI-powered job extraction
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent External Jobs */}
      {recentJobs.length > 0 && (
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Recently Imported Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs.map(job => (
                <div key={job.id} className="glass-card rounded-lg p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{job.title}</h3>
                        <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {job.metadata?.source}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">{job.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Imported {new Date(job.created_date).toLocaleDateString()}</span>
                        {job.metadata?.original_url && (
                          <>
                            <span>•</span>
                            <a 
                              href={job.metadata.original_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              View Original
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="glass-card border-0 bg-blue-500/5 border-l-4 border-blue-500 mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold mb-2">About External Jobs</h4>
              <p className="text-gray-300 text-sm mb-3">
                External jobs are automatically marked with a purple "External Source" badge and link to the original posting. 
                They're integrated into the main Jobs page so developers can see all opportunities in one place.
              </p>
              <p className="text-gray-400 text-xs">
                <strong>Note:</strong> Roblox Open Cloud API doesn't provide job posting data, so we use the public DevForum JSON feeds and browser automation for Talent Hub.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NEW: Open Cloud API Status */}
      <Card className="glass-card border-0 bg-blue-500/5 border-l-4 border-blue-500 mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-semibold mb-2">Roblox Open Cloud API Integration</h4>
              <p className="text-gray-300 text-sm mb-3">
                Your Roblox Open Cloud API key is configured and can be used for:
              </p>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside mb-3">
                <li>Enhanced Roblox account verification</li>
                <li>Accessing user's created universes/games</li>
                <li>More reliable authentication</li>
                <li>Future integrations with Roblox services</li>
              </ul>
              <p className="text-gray-500 text-xs">
                <strong>Note:</strong> Open Cloud doesn't provide job posting APIs, so we use a combination of DevForum JSON feeds and browser automation for the Talent Hub.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
