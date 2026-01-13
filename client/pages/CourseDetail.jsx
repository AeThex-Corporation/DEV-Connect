import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/db';
import { Loader2, CheckCircle, PlayCircle, ChevronLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCourseDetails(courseId);
        setCourse(data);
        if(data.lessons && data.lessons.length > 0) {
            setActiveLesson(data.lessons[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  if(loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  if(!course) return <div className="p-8 text-center">Course not found</div>;

  return (
    <div className="min-h-screen flex flex-col">
        <div className="bg-background border-b border-border p-4 flex items-center justify-between sticky top-16 z-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/dashboard/foundation')}>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h1 className="font-bold text-lg hidden md:block">{course.title}</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground hidden md:block">0% Complete</div>
                <div className="w-32"><Progress value={0} className="h-2" /></div>
            </div>
        </div>

        <div className="flex-grow flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-card border-r border-border flex-shrink-0 overflow-y-auto h-[40vh] md:h-auto">
                <div className="p-4 font-semibold text-muted-foreground text-sm uppercase">Course Content</div>
                {course.lessons.map((lesson, i) => (
                    <div 
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-accent transition-colors ${activeLesson?.id === lesson.id ? 'bg-accent border-l-4 border-blue-500' : ''}`}
                    >
                        <div className="text-muted-foreground text-xs font-mono">{i + 1}.</div>
                        <div className="text-sm font-medium line-clamp-1 flex-grow">{lesson.title}</div>
                        {false ? <CheckCircle className="w-4 h-4 text-green-500" /> : <PlayCircle className="w-4 h-4 text-blue-500 opacity-50" />}
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-grow p-8 overflow-y-auto">
                {activeLesson ? (
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6">{activeLesson.title}</h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg text-muted-foreground leading-relaxed">{activeLesson.content}</p>
                            
                            {/* Placeholder for video */}
                            <div className="mt-8 aspect-video bg-black rounded-xl flex items-center justify-center border border-border">
                                <PlayCircle className="w-16 h-16 text-white opacity-50" />
                            </div>
                        </div>
                        
                        <div className="mt-12 flex justify-between">
                             <Button variant="outline" disabled>Previous</Button>
                             <Button>Mark Complete & Next</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Lock className="w-12 h-12 mb-4 opacity-50" />
                        <p>Select a lesson to begin</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CourseDetail;