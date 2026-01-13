import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/db';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_COLORS = {
  available: 'bg-green-500/20 border-green-500/50 text-green-300',
  booked: 'bg-red-500/20 border-red-500/50 text-red-300',
  unavailable: 'bg-gray-700/50 border-gray-600 text-gray-400'
};

const AvailabilityCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [contractorId, setContractorId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilityMap, setAvailabilityMap] = useState({});

  useEffect(() => {
    const init = async () => {
      if(!user) return;
      try {
        const contractor = await api.getCurrentContractor(user.id);
        if(contractor) {
          setContractorId(contractor.id);
          await fetchMonthAvailability(contractor.id, currentDate);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const fetchMonthAvailability = async (cId, date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const data = await api.getAvailability(cId, start.toISOString(), end.toISOString());
    
    const map = {};
    data.forEach(d => { map[d.date] = d.status; });
    setAvailabilityMap(map);
  };

  const handleDayClick = async (day) => {
    if(!contractorId) return;
    
    const dateStr = day.toISOString().split('T')[0];
    const currentStatus = availabilityMap[dateStr] || 'available';
    
    let nextStatus = 'available';
    if (currentStatus === 'available') nextStatus = 'booked';
    else if (currentStatus === 'booked') nextStatus = 'unavailable';
    else if (currentStatus === 'unavailable') nextStatus = 'available';

    // Optimistic update
    setAvailabilityMap(prev => ({ ...prev, [dateStr]: nextStatus }));

    try {
      await api.setAvailability(contractorId, dateStr, nextStatus);
    } catch (e) {
        toast({ variant: "destructive", title: "Failed to update" });
        // Revert if failed (simplified)
    }
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
    if(contractorId) fetchMonthAvailability(contractorId, newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const daysArray = [];
    for(let i=0; i<firstDay; i++) daysArray.push(null); // padding
    for(let i=1; i<=days; i++) daysArray.push(new Date(year, month, i));
    return daysArray;
  };

  if(loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!contractorId) return <div className="min-h-screen pt-24 text-center text-xl">Contractor profile required.</div>;

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <Helmet><title>Availability | Devconnect</title></Helmet>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Availability Calendar</h1>
          <p className="text-gray-400">Manage your schedule. Click a day to cycle status.</p>
        </div>

        <Card className="bg-glass border-glow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded"><ChevronLeft /></button>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded"><ChevronRight /></button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-gray-400 text-sm font-medium">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                if(!day) return <div key={i} className="h-24 bg-transparent"></div>;
                const dateStr = day.toISOString().split('T')[0];
                const status = availabilityMap[dateStr] || 'available';
                
                return (
                  <div 
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`h-24 rounded-lg border p-2 cursor-pointer transition-all hover:brightness-110 flex flex-col justify-between ${STATUS_COLORS[status] || STATUS_COLORS['available']}`}
                  >
                    <span className="font-bold">{day.getDate()}</span>
                    <span className="text-xs uppercase tracking-wider text-center font-semibold opacity-80">{status}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-6 mt-6 justify-center text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Available</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Booked</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-500 rounded-full"></div> Unavailable</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;