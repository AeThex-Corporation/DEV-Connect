import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  Loader2,
  AlertCircle
} from "lucide-react";

export default function RobloxVerification({ user, onVerified }) {
  const [username, setUsername] = useState(user?.roblox_username || "");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    if (!username.trim()) {
      setError("Please enter your Roblox username");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const result = await base44.functions.verifyRobloxUsername(username.trim());

      console.log('Verification response:', result);

      if (result && result.success) {
        const reputationData = await base44.functions.calculateRobloxReputation(result.userId);
        
        await base44.entities.User.update(user.id, {
          roblox_username: result.username,
          roblox_user_id: String(result.userId),
          roblox_verified: true,
          roblox_data: {
            displayName: result.displayName,
            verifiedAt: new Date().toISOString()
          },
          roblox_reputation_score: reputationData.score,
          roblox_reputation_tier: reputationData.tier
        });

        setTimeout(() => {
          if (onVerified) {
            onVerified();
          }
        }, 500);
      } else {
        setError(result?.message || 'Failed to verify Roblox account. Please check the username and try again.');
      }
    } catch (err) {
      console.error('Error verifying Roblox account:', err);
      setError(err.message || 'Failed to verify Roblox account. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (user?.roblox_verified) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="glass-card border-0 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Verify Your Roblox Account
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Connect your Roblox profile to:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Import your Roblox games to your portfolio
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Display your Roblox stats automatically
                </li>
                <li className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Boost your profile credibility
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Enter your Roblox username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                className="bg-white/5 border-white/20 text-white"
              />

              <Button
                onClick={handleVerify}
                disabled={verifying || !username.trim()}
                className="btn-primary text-white w-full"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
