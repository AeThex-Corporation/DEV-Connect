
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Users,
  Star,
  MessageSquare,
  Calendar,
  Target,
  Award,
  TrendingUp,
  Send,
  CheckCircle,
  Clock,
  UserPlus,
  X
} from "lucide-react";
import AIMentorshipMatcher from '../components/AIMentorshipMatcher';

export default function Mentorship() {
  const [user, setUser] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  const [showMatcher, setShowMatcher] = useState(false);
  const [matcherMode, setMatcherMode] = useState('find_mentor');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load experienced developers as potential mentors
      const allUsers = await base44.entities.User.list();
      const potentialMentors = allUsers.filter(u =>
        u.experience_level === 'Advanced' || u.experience_level === 'Expert'
      );
      setMentors(potentialMentors);

      // Load user's mentorship requests
      const requests = await base44.entities.MentorshipRequest.filter({
        mentee_id: currentUser.id
      }, "-created_date");
      setMyRequests(requests);

      // Load active mentorship sessions
      const sessions = await base44.entities.MentorshipSession.filter({
        mentee_id: currentUser.id
      }, "-scheduled_time");
      setMySessions(sessions);
    } catch (error) {
      console.error('Error loading mentorship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = (mentor) => {
    setSelectedMentor(mentor);
    setRequestModalOpen(true);
  };

  const submitRequest = async () => {
    if (!requestMessage || focusAreas.length === 0) {
      alert('Please provide a message and select focus areas');
      return;
    }

    try {
      await base44.entities.MentorshipRequest.create({
        mentee_id: user.id,
        mentor_id: selectedMentor.id,
        focus_areas: focusAreas,
        message: requestMessage,
        goals: "Learn and improve skills",
        commitment_level: "regular",
        preferred_meeting_frequency: "weekly"
      });

      // Notify mentor
      await base44.entities.Notification.create({
        user_id: selectedMentor.id,
        type: 'message',
        title: '🤝 New Mentorship Request',
        message: `${user.full_name} wants you as their mentor!`,
        link: createPageUrl('Mentorship')
      });

      setRequestModalOpen(false);
      setRequestMessage("");
      setFocusAreas([]);
      loadData();
    } catch (error) {
      console.error('Error submitting mentorship request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">Mentorship Program</h1>
        <p className="text-gray-400 text-sm">
          Connect with experienced developers to accelerate your growth
        </p>
      </div>

      {/* NEW: AI Matcher Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card 
          className="glass-card border-0 cursor-pointer card-hover bg-gradient-to-br from-purple-500/10 to-indigo-500/10"
          onClick={() => {
            setMatcherMode('find_mentor');
            setShowMatcher(true);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">Find a Mentor</h3>
                <p className="text-gray-400 text-sm">AI-powered mentor matching</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="glass-card border-0 cursor-pointer card-hover bg-gradient-to-br from-indigo-500/10 to-blue-500/10"
          onClick={() => {
            setMatcherMode('find_mentee');
            setShowMatcher(true);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">Become a Mentor</h3>
                <p className="text-gray-400 text-sm">Find developers to guide</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="find" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="find">
            <Users className="w-4 h-4 mr-2" />
            Find Mentors ({mentors.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            <MessageSquare className="w-4 h-4 mr-2" />
            My Requests ({myRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Calendar className="w-4 h-4 mr-2" />
            Sessions ({mySessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Find Mentors */}
        <TabsContent value="find" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="glass-card border-0 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{mentor.full_name}</h3>
                      <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                        {mentor.experience_level}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{mentor.bio}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-400">{mentor.rating?.toFixed(1)} rating</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Award className="w-3 h-3 text-indigo-400" />
                      <span className="text-gray-400">{mentor.completed_projects} projects</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-gray-400">Level {mentor.level}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mentor.developer_roles?.slice(0, 3).map(role => (
                      <Badge key={role} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleRequestMentorship(mentor)}
                    className="w-full btn-primary text-white"
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Request Mentorship
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Requests */}
        <TabsContent value="requests" className="space-y-4">
          {myRequests.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Requests Yet</h3>
                <p className="text-gray-400 mb-6">
                  Start by finding a mentor to guide you
                </p>
                <Button
                  onClick={() => document.querySelector('[value="find"]').click()}
                  className="btn-primary text-white"
                >
                  Find Mentors
                </Button>
              </CardContent>
            </Card>
          ) : (
            myRequests.map((request) => (
              <Card key={request.id} className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">
                        Mentorship with {/* Would need to fetch mentor name */}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {request.focus_areas?.map(area => (
                          <Badge key={area} className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className={
                      request.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                      request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }>
                      {request.status}
                    </Badge>
                  </div>

                  <p className="text-gray-400 text-sm mb-3">{request.message}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(request.created_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {request.preferred_meeting_frequency}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="space-y-4">
          {mySessions.length === 0 ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Sessions Scheduled</h3>
                <p className="text-gray-400">
                  Your mentorship sessions will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            mySessions.map((session) => (
              <Card key={session.id} className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1">
                        Session #{session.session_number}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(session.scheduled_time).toLocaleString()}
                      </p>
                    </div>
                    <Badge className={
                      session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      session.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }>
                      {session.status}
                    </Badge>
                  </div>

                  {session.topics_covered?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-gray-400 text-xs font-medium mb-1">Topics Covered:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {session.topics_covered.map(topic => (
                          <Badge key={topic} className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {session.mentee_notes && (
                    <p className="text-gray-400 text-sm mb-3">{session.mentee_notes}</p>
                  )}

                  {session.meeting_url && session.status === 'scheduled' && (
                    <Button size="sm" className="btn-primary text-white" asChild>
                      <a href={session.meeting_url} target="_blank" rel="noopener noreferrer">
                        Join Session
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Request Mentorship Modal */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="glass-card border-0 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Request Mentorship</DialogTitle>
          </DialogHeader>

          {selectedMentor && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 glass-card rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">{selectedMentor.full_name}</p>
                  <p className="text-gray-400 text-xs">{selectedMentor.experience_level}</p>
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  What do you want to learn?
                </label>
                <Textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Introduce yourself and explain what you hope to learn..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 min-h-32"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setRequestModalOpen(false)}
                  variant="outline"
                  className="flex-1 glass-card border-0 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitRequest}
                  className="flex-1 btn-primary text-white"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Send Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* NEW: AI Matcher Modal */}
      {showMatcher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-6xl mx-auto py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                AI Mentorship Matcher
              </h2>
              <Button
                onClick={() => setShowMatcher(false)}
                variant="ghost"
                className="text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <AIMentorshipMatcher 
              user={user}
              mode={matcherMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}
