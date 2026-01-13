import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Zap } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

function DailyPulse() {
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePulse = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to activate your Daily Pulse!",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "🚀 Daily Pulse Activated!",
        description: "Thanks for checking in! We're gathering insights to personalize your experience.",
      });
    } catch (error) {
      console.error("Error updating last active:", error);
      toast({
        title: "Pulse Failed",
        description: "Could not activate Daily Pulse. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handlePulse} variant="outline" className="bg-transparent border-purple-500 text-purple-300 hover:bg-purple-800/50 hover:text-white">
      <Zap className="mr-2 h-4 w-4" /> Launch Daily Pulse
    </Button>
  );
}

export default DailyPulse;