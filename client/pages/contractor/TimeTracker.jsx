import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, StopCircle, Plus, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  startTimeEntry, 
  stopTimeEntry, 
  getActiveTimeEntry, 
  getTimeEntries,
  saveManualTimeEntry
} from '@/lib/db_time_tracking';
import { supabase } from '@/lib/customSupabaseClient';

const TimeTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [contractorId, setContractorId] = useState(null);
  
  // Form states
  const [selectedJob, setSelectedJob] = useState('');
  const [notes, setNotes] = useState('');
  
  // Manual entry states
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualDuration, setManualDuration] = useState('');
  const [manualJob, setManualJob] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeEntry && activeEntry.status === 'active') {
      const startTime = new Date(activeEntry.start_time).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [activeEntry]);

  const fetchInitialData = async () => {
    if (!user) return;
    try {
      // 1. Get Contractor ID
      const { data: contractor, error: cError } = await supabase
        .from('contractors')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (cError || !contractor) {
         setLoading(false);
         return; // Not a contractor
      }
      setContractorId(contractor.id);

      // 2. Get Active Jobs (simplified query for now)
      const { data: jobsData } = await supabase.from('jobs').select('id, title');
      setJobs(jobsData || []);

      // 3. Get Active Timer
      const active = await getActiveTimeEntry(contractor.id);
      setActiveEntry(active);

      // 4. Get Recent Entries
      const entries = await getTimeEntries(contractor.id);
      setRecentEntries(entries || []);

    } catch (error) {
      console.error("Error fetching time data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = async () => {
    if (!selectedJob) {
      toast({ title: "Error", description: "Please select a job first.", variant: "destructive" });
      return;
    }
    try {
      const newEntry = await startTimeEntry(contractorId, selectedJob, notes);
      setActiveEntry(newEntry);
      toast({ title: "Timer Started", description: "Time tracking has begun." });
      fetchInitialData(); // refresh list
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleStopTimer = async () => {
    if (!activeEntry) return;
    try {
      await stopTimeEntry(activeEntry.id);
      setActiveEntry(null);
      setElapsedTime(0);
      toast({ title: "Timer Stopped", description: "Time entry saved." });
      fetchInitialData(); // refresh list
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  
  const handleManualEntry = async () => {
      if (!manualJob || !manualDuration || !manualDate) {
          toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
          return;
      }
      try {
          await saveManualTimeEntry(contractorId, manualJob, manualDate, parseInt(manualDuration), manualNotes);
          toast({ title: "Success", description: "Time entry added manually." });
          // Reset form
          setManualDuration('');
          setManualNotes('');
          fetchInitialData();
      } catch (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
      }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-8 text-center">Loading tracker...</div>;
  if (!contractorId) return <div className="p-8 text-center">You must be a registered contractor to use this feature.</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Time Tracker</h1>
        {activeEntry && (
          <div className="flex items-center gap-3 bg-green-900/30 border border-green-500/30 px-4 py-2 rounded-full animate-pulse">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-green-400 font-mono font-bold">{formatTime(elapsedTime)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Timer & Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          <Tabs defaultValue="timer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-800">
              <TabsTrigger value="timer">Timer</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timer">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Current Session</CardTitle>
                  <CardDescription>Track time while you work.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!activeEntry ? (
                      <>
                        <div className="space-y-2">
                          <Label>Select Job</Label>
                          <Select value={selectedJob} onValueChange={setSelectedJob}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Choose a project..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {jobs.map(job => (
                                <SelectItem key={job.id} value={job.id.toString()}>{job.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                           <Label>Notes (Optional)</Label>
                           <Input 
                             placeholder="What are you working on?" 
                             value={notes}
                             onChange={(e) => setNotes(e.target.value)}
                             className="bg-gray-800 border-gray-700"
                           />
                        </div>
                        <Button 
                          onClick={handleStartTimer} 
                          className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-12 text-lg"
                        >
                          <Play className="w-5 h-5" /> Start Timer
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-6 space-y-6">
                        <div>
                           <h3 className="text-gray-400 text-sm uppercase tracking-wider">Currently Working On</h3>
                           <p className="text-xl font-semibold text-white mt-1">
                             {activeEntry.jobs?.title || 'Unknown Job'}
                           </p>
                           {activeEntry.notes && <p className="text-gray-500 text-sm mt-1">"{activeEntry.notes}"</p>}
                        </div>
                        <div className="text-6xl font-mono font-bold text-white tracking-widest">
                          {formatTime(elapsedTime)}
                        </div>
                        <Button 
                          onClick={handleStopTimer} 
                          variant="destructive"
                          className="w-full max-w-xs mx-auto gap-2 h-12 text-lg"
                        >
                          <StopCircle className="w-5 h-5" /> Stop Timer
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manual">
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle>Add Time Manually</CardTitle>
                        <CardDescription>Forgot to track? Add it here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Date</Label>
                                <Input 
                                    type="date" 
                                    value={manualDate}
                                    onChange={(e) => setManualDate(e.target.value)}
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (minutes)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="e.g. 60" 
                                    value={manualDuration}
                                    onChange={(e) => setManualDuration(e.target.value)}
                                    className="bg-gray-800 border-gray-700"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Job</Label>
                          <Select value={manualJob} onValueChange={setManualJob}>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Choose a project..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {jobs.map(job => (
                                <SelectItem key={job.id} value={job.id.toString()}>{job.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                           <Label>Notes</Label>
                           <Input 
                             placeholder="What did you accomplish?" 
                             value={manualNotes}
                             onChange={(e) => setManualNotes(e.target.value)}
                             className="bg-gray-800 border-gray-700"
                           />
                        </div>
                        <Button onClick={handleManualEntry} className="w-full bg-blue-600 hover:bg-blue-500">
                            <Plus className="w-4 h-4 mr-2" /> Add Entry
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>

        </div>

        {/* Right Column: Recent Activity */}
        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEntries.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No recent time entries.</p>
                ) : (
                  recentEntries.slice(0, 5).map(entry => (
                    <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <div>
                        <p className="font-medium text-white text-sm">{entry.jobs?.title || 'Unknown Job'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(entry.start_time).toLocaleDateString()} • {entry.status === 'active' ? 'In Progress' : `${entry.duration_minutes} min`}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${entry.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                    </div>
                  ))
                )}
              </div>
              {recentEntries.length > 5 && (
                <Button variant="link" className="w-full text-blue-400 text-sm mt-4">View All History</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;