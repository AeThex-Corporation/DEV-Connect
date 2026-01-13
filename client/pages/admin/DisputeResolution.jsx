import React from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AlertTriangle, MessageSquare, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DisputeResolution = () => {
  // Placeholder since no real dispute data structure was populated in previous steps
  // This sets up the UI for future integration
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminHeader title="Dispute Resolution" subtitle="Manage conflicts and arbitration" />
      
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-xl">
         <div className="bg-zinc-900 p-4 rounded-full mb-6 shadow-xl">
            <Shield className="w-12 h-12 text-zinc-600" />
         </div>
         <h3 className="text-xl font-semibold text-white mb-2">Dispute Center</h3>
         <p className="text-zinc-500 max-w-md text-center mb-8">
            There are currently no active disputes requiring administrative attention. When users report issues or escalate job conflicts, they will appear here.
         </p>
         <div className="flex gap-4">
            <Button variant="outline" className="border-zinc-700 text-zinc-300">View Archived</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
               <AlertTriangle className="w-4 h-4 mr-2" /> Create Test Case
            </Button>
         </div>
      </div>
    </div>
  );
};

export default DisputeResolution;