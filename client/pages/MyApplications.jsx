import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import ApplicationTracker from "../components/ApplicationTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MyApplications() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => window.location.href = createPageUrl('Jobs')}
          variant="ghost"
          className="text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
        <p className="text-gray-400">
          Track all your job applications in one place
        </p>
      </div>

      {/* Application Tracker */}
      {user && <ApplicationTracker userId={user.id} />}
    </div>
  );
}