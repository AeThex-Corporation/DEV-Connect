import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, User, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SmartMatching = ({ job }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findMatches = async () => {
      if (!job?.required_skills || job.required_skills.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const skills = job.required_skills.map(s => s.toLowerCase());
      
      // 1. Fetch Contractors
      const { data: contractors } = await supabase
        .from('contractors')
        .select(`
          id,
          skills,
          user:profiles(id, display_name, avatar_url, username)
        `)
        .not('skills', 'is', null);

      // 2. Fetch Studios
      const { data: studios } = await supabase
        .from('studios')
        .select('id, name, avatar_url, tags, slug')
        .not('tags', 'is', null);

      // 3. Calculate Scores
      let allMatches = [];

      // Score Contractors
      if (contractors) {
        contractors.forEach(c => {
          if (!c.skills) return;
          const matchCount = c.skills.filter(skill => skills.includes(skill.toLowerCase())).length;
          if (matchCount > 0) {
            allMatches.push({
              type: 'contractor',
              id: c.id, // Contractor ID
              profileId: c.user.id,
              name: c.user.display_name,
              avatar: c.user.avatar_url,
              link: `/contractors/${c.id}`,
              matchCount,
              matchedSkills: c.skills.filter(skill => skills.includes(skill.toLowerCase())),
              username: c.user.username
            });
          }
        });
      }

      // Score Studios
      if (studios) {
        studios.forEach(s => {
          if (!s.tags) return;
          const matchCount = s.tags.filter(tag => skills.includes(tag.toLowerCase())).length;
          if (matchCount > 0) {
            allMatches.push({
              type: 'studio',
              id: s.id,
              name: s.name,
              avatar: s.avatar_url,
              link: `/studios/${s.slug}`,
              matchCount,
              matchedSkills: s.tags.filter(tag => skills.includes(tag.toLowerCase())),
            });
          }
        });
      }

      // Sort by match count
      allMatches.sort((a, b) => b.matchCount - a.matchCount);
      
      setMatches(allMatches.slice(0, 6)); // Top 6 matches
      setLoading(false);
    };

    findMatches();
  }, [job]);

  if (loading) return null;
  if (matches.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border-blue-500/30 mt-8">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          <CardTitle className="text-lg text-white">Smart Matches</CardTitle>
        </div>
        <p className="text-sm text-gray-400">
          We found {matches.length} candidates matching your requirements.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <motion.div
              key={`${match.type}-${match.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 flex items-center gap-4 hover:border-blue-500/50 transition-colors"
            >
              <Avatar className="h-10 w-10 border border-gray-700">
                <AvatarImage src={match.avatar} />
                <AvatarFallback>{match.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <span className="font-medium text-white truncate">{match.name}</span>
                   {match.type === 'studio' ? (
                     <Building2 className="w-3 h-3 text-purple-400 flex-shrink-0" />
                   ) : (
                     <User className="w-3 h-3 text-blue-400 flex-shrink-0" />
                   )}
                </div>
                <div className="flex flex-wrap gap-1">
                   {match.matchedSkills.slice(0, 2).map(s => (
                     <Badge key={s} variant="secondary" className="text-[10px] h-4 px-1">{s}</Badge>
                   ))}
                   {match.matchedSkills.length > 2 && (
                     <span className="text-[10px] text-gray-500">+{match.matchedSkills.length - 2}</span>
                   )}
                </div>
              </div>
              <Button size="icon" variant="ghost" asChild className="h-8 w-8">
                <Link to={match.link} target="_blank">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartMatching;