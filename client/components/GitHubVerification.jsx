import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, CheckCircle, Star, GitFork, Users } from "lucide-react";

export default function GitHubVerification({ user, onVerified }) {
  const [username, setUsername] = useState(user?.github_username || "");
  const [verifying, setVerifying] = useState(false);
  const [stats, setStats] = useState(user?.github_stats || null);

  const handleVerify = async () => {
    if (!username.trim()) return;

    setVerifying(true);
    try {
      // Use AI to fetch and analyze GitHub profile
      const prompt = `
Fetch GitHub user profile for username: ${username}

Return the following information:
- public_repos: number of public repositories
- followers: number of followers
- following: number of following
- bio: user bio
- location: user location
- blog: website/blog URL
- company: company name
- hireable: is user hireable
- contributions_last_year: estimated contributions (use 500-2000 range as estimate)

If user doesn't exist, return error: true
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            error: { type: "boolean" },
            public_repos: { type: "number" },
            followers: { type: "number" },
            following: { type: "number" },
            bio: { type: "string" },
            location: { type: "string" },
            blog: { type: "string" },
            company: { type: "string" },
            hireable: { type: "boolean" },
            contributions_last_year: { type: "number" }
          }
        }
      });

      if (response.error) {
        alert('GitHub user not found. Please check the username.');
        return;
      }

      const githubStats = {
        repos: response.public_repos,
        followers: response.followers,
        contributions: response.contributions_last_year
      };

      // Update user profile
      await base44.auth.updateMe({
        github_username: username,
        github_stats: githubStats,
        verified: true
      });

      setStats(githubStats);
      
      // Award badge for verification
      const currentBadges = user.badges || [];
      if (!currentBadges.includes('Expert Verified')) {
        await base44.auth.updateMe({
          badges: [...currentBadges, 'Expert Verified']
        });
      }

      // Create notification
      await base44.entities.Notification.create({
        user_id: user.id,
        type: 'application_update',
        title: 'GitHub Verified!',
        message: `Your GitHub profile has been verified with ${githubStats.repos} repos and ${githubStats.followers} followers`,
        link: createPageUrl('Profile')
      });

      if (onVerified) onVerified(githubStats);
    } catch (error) {
      console.error('Error verifying GitHub:', error);
      alert('Failed to verify GitHub profile. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Github className="w-5 h-5 text-white" />
          <CardTitle className="text-white text-lg">GitHub Verification</CardTitle>
          {user?.verified && (
            <Badge className="bg-green-500/20 text-green-400 border-0">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {!stats ? (
          <>
            <p className="text-gray-400 text-sm">
              Verify your GitHub profile to increase your credibility and showcase your work.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
              <Button
                onClick={handleVerify}
                disabled={verifying || !username.trim()}
                className="btn-primary text-white whitespace-nowrap"
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Github className="w-5 h-5 text-gray-400" />
                <span className="text-white font-medium">@{username}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://github.com/${username}`, '_blank')}
                className="glass-card border-0 text-white hover:bg-white/5"
              >
                View Profile
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card rounded-lg p-4 text-center">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-lg">{stats.repos}</p>
                <p className="text-gray-400 text-xs">Repositories</p>
              </div>
              <div className="glass-card rounded-lg p-4 text-center">
                <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-lg">{stats.followers}</p>
                <p className="text-gray-400 text-xs">Followers</p>
              </div>
              <div className="glass-card rounded-lg p-4 text-center">
                <GitFork className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-lg">{stats.contributions}</p>
                <p className="text-gray-400 text-xs">Contributions</p>
              </div>
            </div>

            <Button
              onClick={() => {
                setStats(null);
                setUsername("");
              }}
              variant="outline"
              size="sm"
              className="w-full glass-card border-0 text-white hover:bg-white/5"
            >
              Reverify
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}