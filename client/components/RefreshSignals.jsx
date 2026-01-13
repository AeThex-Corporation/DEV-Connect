import React from 'react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { RefreshCw } from 'lucide-react';

    function RefreshSignals({ onRefresh }) {
      const { toast } = useToast();

      const handleRefresh = () => {
        if (onRefresh) {
          onRefresh();
        }
        toast({
          title: "✨ Signals Refreshed!",
          description: "Your recommendations have been updated with the latest data.",
        });
      };

      return (
        <Button onClick={handleRefresh} variant="outline" className="bg-transparent border-blue-500 text-blue-300 hover:bg-blue-800/50 hover:text-white">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Signals
        </Button>
      );
    }

    export default RefreshSignals;