import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, GraduationCap, PlayCircle, Award, Lock, Star, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { api } from '@/lib/db';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const FoundationDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.getCourses();
        setCourses(data || []);
      } catch (e) {
        console.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <>
      <Helmet>
        <title>Foundation Dashboard | Aethex University</title>
        <meta name="description" content="Welcome to the Foundation. Learn, grow, and master your craft in the Side-by-Side Network's educational hub." />
      </Helmet>

      <div className="p-6 md:p-12 min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-green-500 mb-2">
                <GraduationCap className="w-5 h-5" />
                <span className="font-bold tracking-wide uppercase text-sm">The Foundation</span>
              </div>
              <h1 className="text-4xl font-bold mb-2 text-white text-glow">Learning Hub</h1>
              <p className="text-gray-400">Master your craft. Earn credentials. Level up.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-400 block">Current Level</span>
                <span className="font-bold text-xl text-white">Novice</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-400 block">XP Earned</span>
                <span className="font-bold text-xl text-yellow-500">0 XP</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Active Courses Section */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-white">
                <PlayCircle className="w-6 h-6 text-blue-500" />
                Recommended Paths
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                   <div className="col-span-full flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-blue-500"/></div>
                ) : courses.length > 0 ? (
                  courses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group rounded-xl border bg-gray-900/50 border-gray-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Course Thumbnail */}
                    <div className="h-40 w-full bg-gray-800 relative overflow-hidden">
                       {course.thumbnail_url ? (
                         <img 
                           src={course.thumbnail_url} 
                           alt={course.title}
                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         />
                       ) : (
                         <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-gray-600" />
                         </div>
                       )}
                       <div className="absolute top-3 right-3">
                          <Badge className="bg-black/70 hover:bg-black/70 backdrop-blur-sm border border-white/10 text-white">
                             {course.level}
                          </Badge>
                       </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold mb-2 text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-800 pt-4 mt-auto">
                         <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration_minutes}m</span>
                            <span className="flex items-center gap-1 text-yellow-500/80"><Award className="w-3 h-3" /> {course.xp_reward} XP</span>
                         </div>
                      </div>
                      
                      <div className="mt-4">
                        <Link to={`/foundation/course/${course.id}`} className="block">
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white">Start Learning</Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))) : (
                  <div className="col-span-full text-center p-12 bg-gray-900/30 rounded-xl border border-dashed border-gray-800 text-gray-500">
                    No courses available at the moment.
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Weekly Challenge
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Complete the "Data Structures Refresher" quiz to earn a unique badge.
                </p>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                  <div className="bg-yellow-500 h-2 rounded-full w-1/3"></div>
                </div>
                <Button className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white" variant="outline">View Challenge</Button>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold mb-4 text-white">Upcoming Workshops</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <div className="bg-blue-900/20 text-blue-400 p-2 rounded text-xs font-bold text-center min-w-[3rem] border border-blue-900/30">
                      NOV<br/>24
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">React Performance Patterns</h4>
                      <p className="text-xs text-gray-500 mt-1">2:00 PM EST • Live Stream</p>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start">
                    <div className="bg-purple-900/20 text-purple-400 p-2 rounded text-xs font-bold text-center min-w-[3rem] border border-purple-900/30">
                      NOV<br/>28
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">UI Animation Masterclass</h4>
                      <p className="text-xs text-gray-500 mt-1">4:30 PM EST • Live Stream</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoundationDashboard;