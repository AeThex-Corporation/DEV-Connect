import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Video,
  Code,
  Palette,
  Users,
  Plus,
  MessageSquare,
  Zap,
  FolderKanban
} from 'lucide-react';
import CollabRoomManager from '../components/CollabRoomManager';

export default function Collaboration() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allRooms = await base44.entities.CollabRoom.list('-created_date');
      const myRooms = allRooms.filter(room =>
        room.participant_ids?.includes(currentUser.id)
      );
      setRooms(myRooms);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStartTemplates = [
    {
      title: 'Pair Programming',
      description: 'Code together in real-time with collaborative editor',
      icon: Code,
      color: 'from-blue-500 to-cyan-500',
      type: 'pair_programming'
    },
    {
      title: 'Design Session',
      description: 'Brainstorm and sketch ideas on a shared whiteboard',
      icon: Palette,
      color: 'from-purple-500 to-pink-500',
      type: 'brainstorming'
    },
    {
      title: 'Code Review',
      description: 'Review and discuss code with your team',
      icon: FolderKanban,
      color: 'from-green-500 to-emerald-500',
      type: 'code_review'
    },
    {
      title: 'Team Discussion',
      description: 'Chat and collaborate with your team members',
      icon: MessageSquare,
      color: 'from-orange-500 to-red-500',
      type: 'discussion'
    }
  ];

  const createQuickRoom = async (template) => {
    try {
      const room = await base44.entities.CollabRoom.create({
        room_name: `${template.title} - ${new Date().toLocaleDateString()}`,
        creator_id: user.id,
        participant_ids: [user.id],
        room_type: template.type,
        status: 'active',
        started_at: new Date().toISOString()
      });

      // Redirect to the room (or load it in current view)
      window.location.href = `${createPageUrl('Collaboration')}?room=${room.id}`;
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create collaboration room');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Collaboration Hub</h1>
            <p className="text-gray-400">Real-time collaboration tools for developers</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Video className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{rooms.length}</p>
              <p className="text-gray-400 text-xs">Active Rooms</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Code className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {rooms.filter(r => r.room_type === 'pair_programming').length}
              </p>
              <p className="text-gray-400 text-xs">Coding Sessions</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-4 text-center">
              <Palette className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {rooms.filter(r => r.room_type === 'brainstorming').length}
              </p>
              <p className="text-gray-400 text-xs">Design Sessions</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Start Templates */}
      {showQuickStart && (
        <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Quick Start</CardTitle>
              <Button
                onClick={() => setShowQuickStart(false)}
                size="sm"
                variant="ghost"
                className="text-gray-400"
              >
                Hide
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {quickStartTemplates.map((template, i) => (
                <div
                  key={i}
                  onClick={() => createQuickRoom(template)}
                  className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-all"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center mb-3`}>
                    <template.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-1">{template.title}</h4>
                  <p className="text-gray-400 text-xs">{template.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Collaboration Manager */}
      <CollabRoomManager />
    </div>
  );
}