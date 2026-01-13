import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '@/lib/db';
import { Loader2, Trophy, Star, Zap, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

const Leaderboards = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getLeaderboard();
        setLeaders(data || []);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if(loading) return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <Helmet><title>Top Talent | Devconnect</title></Helmet>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 flex justify-center items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" /> Top Rated Contractors
          </h1>
          <p className="text-gray-400">Recognizing the highest performing talent in our network.</p>
        </div>

        <div className="bg-glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-sm font-medium text-gray-400 uppercase tracking-wider bg-black/20">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Contractor</div>
            <div className="col-span-2 text-center">Rating</div>
            <div className="col-span-2 text-center">Skills</div>
            <div className="col-span-2 text-center">Jobs</div>
          </div>
          
          {leaders.map((entry, index) => {
            const profile = entry.contractors?.profiles || {};
            return (
              <Link 
                to={`/contractors/${entry.contractor_id}`}
                key={entry.contractor_id} 
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="col-span-1 flex justify-center">
                  {index === 0 ? <Medal className="text-yellow-400 w-6 h-6" /> :
                   index === 1 ? <Medal className="text-gray-300 w-6 h-6" /> :
                   index === 2 ? <Medal className="text-orange-400 w-6 h-6" /> :
                   <span className="font-bold text-gray-500">#{index + 1}</span>
                  }
                </div>
                <div className="col-span-5 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>{profile.display_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-white">{profile.display_name}</h3>
                    <p className="text-xs text-gray-400">@{profile.username}</p>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center items-center gap-1 font-bold text-yellow-400">
                  <Star className="w-4 h-4 fill-current" /> {entry.avg_rating || 0}
                </div>
                <div className="col-span-2 text-center text-gray-300">
                  {entry.skills_count || entry.contractors?.skills?.length || 0}
                </div>
                <div className="col-span-2 text-center text-gray-300">
                  {entry.total_ratings || 0}
                </div>
              </Link>
            );
          })}
          
          {leaders.length === 0 && (
            <div className="p-12 text-center text-gray-500">Not enough data to display leaderboards yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;