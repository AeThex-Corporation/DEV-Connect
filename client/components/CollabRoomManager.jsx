import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Send,
  Video,
  MessageSquare,
  Users,
  Clock,
  X,
  FileText,
  Upload,
  Download,
  ListTodo,
  Code,
  Palette
} from "lucide-react";
import CollaborativeCodeEditor from "./CollaborativeCodeEditor";
import CollaborativeWhiteboard from "./CollaborativeWhiteboard";

export default function CollabRoomManager() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allRooms = await base44.entities.CollabRoom.list();
      const myRooms = allRooms.filter(room => 
        room.participant_ids?.includes(currentUser.id)
      );
      setRooms(myRooms);

      if (activeRoom) {
        const roomMessages = await base44.entities.CollabMessage.filter({
          room_id: activeRoom.id
        }, '-created_date');
        setMessages(roomMessages);

        const roomTasks = await base44.entities.CollabTask.filter({
          room_id: activeRoom.id
        });
        setTasks(roomTasks);
      }
    } catch (error) {
      console.error('Error loading collab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    try {
      const room = await base44.entities.CollabRoom.create({
        room_name: newRoomName,
        creator_id: user.id,
        participant_ids: [user.id],
        room_type: 'discussion',
        status: 'active'
      });

      setActiveRoom(room);
      setShowCreateRoom(false);
      setNewRoomName('');
      await loadData();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom) return;

    try {
      await base44.entities.CollabMessage.create({
        room_id: activeRoom.id,
        sender_id: user.id,
        message_type: 'text',
        content: newMessage
      });

      setNewMessage('');
      await loadData();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim() || !activeRoom) return;

    try {
      await base44.entities.CollabTask.create({
        room_id: activeRoom.id,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        created_by: user.id,
        status: 'todo'
      });

      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowNewTask(false);
      await loadData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await base44.entities.CollabTask.update(taskId, { status: newStatus });
      await loadData();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const isTaskBlocked = (task, allTasks) => {
    if (!task.blocked_by || task.blocked_by.length === 0) return false;
    
    return task.blocked_by.some(blockerId => {
      const blocker = allTasks.find(t => t.id === blockerId);
      return blocker && blocker.status !== 'done';
    });
  };

  const uploadFile = async (file) => {
    if (!activeRoom) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.CollabMessage.create({
        room_id: activeRoom.id,
        sender_id: user.id,
        message_type: 'file',
        content: file.name,
        file_url: file_url
      });

      await loadData();
    } catch (error) {
      console.error('Error uploading file:', error);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Collaboration Rooms</h1>
          <p className="text-gray-400 text-sm">Real-time collaboration with team members</p>
        </div>
        <Button
          onClick={() => setShowCreateRoom(true)}
          className="btn-primary text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Room
        </Button>
      </div>

      {showCreateRoom && (
        <Card className="glass-card border-0 mb-6">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Create Collaboration Room</h3>
            <div className="flex gap-3">
              <Input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name..."
                className="bg-white/5 border-white/20 text-white"
                onKeyPress={(e) => e.key === 'Enter' && createRoom()}
              />
              <Button onClick={createRoom} className="btn-primary text-white">
                Create
              </Button>
              <Button
                onClick={() => {
                  setShowCreateRoom(false);
                  setNewRoomName('');
                }}
                variant="outline"
                className="glass-card border-0 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white text-base">Your Rooms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rooms.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No rooms yet. Create one!
                </p>
              ) : (
                rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeRoom?.id === room.id
                        ? 'bg-indigo-500/20 text-white'
                        : 'glass-card text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{room.room_name}</h4>
                      <Badge className={`${
                        room.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      } border-0 text-xs`}>
                        {room.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      {room.participant_ids?.length || 0}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {!activeRoom ? (
            <Card className="glass-card border-0">
              <CardContent className="p-12 text-center">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Room</h3>
                <p className="text-gray-400">
                  Choose a collaboration room to start working together
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border-0">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{activeRoom.room_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-0 text-xs">
                        {activeRoom.room_type}
                      </Badge>
                      <div className="flex items-center text-gray-400 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {activeRoom.participant_ids?.length || 0} participants
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveRoom(null)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <Tabs defaultValue="chat" className="flex-1 flex flex-col">
                <TabsList className="glass-card border-0 mx-4 mt-4">
                  <TabsTrigger value="chat">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="tasks">
                    <ListTodo className="w-4 h-4 mr-2" />
                    Tasks ({tasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="code">
                    <Code className="w-4 h-4 mr-2" />
                    Code Editor
                  </TabsTrigger>
                  <TabsTrigger value="whiteboard">
                    <Palette className="w-4 h-4 mr-2" />
                    Whiteboard
                  </TabsTrigger>
                  <TabsTrigger value="files">
                    <FileText className="w-4 h-4 mr-2" />
                    Files
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 m-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-400">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-sm p-3 rounded-lg ${
                              msg.sender_id === user.id
                                ? 'bg-indigo-500/20 text-white'
                                : 'glass-card text-gray-300'
                            }`}
                          >
                            {msg.message_type === 'file' ? (
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <a
                                  href={msg.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  {msg.content}
                                </a>
                              </div>
                            ) : (
                              <p className="text-sm">{msg.content}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(msg.created_date).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-white/5 border-white/20 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])}
                        />
                        <Button size="icon" variant="outline" className="glass-card border-0 text-white hover:bg-white/5">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </label>
                      <Button onClick={sendMessage} size="icon" className="btn-primary text-white">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="flex-1 m-0 p-4 overflow-y-auto">
                  {!showNewTask ? (
                    <Button
                      onClick={() => setShowNewTask(true)}
                      size="sm"
                      className="w-full btn-primary text-white mb-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Task
                    </Button>
                  ) : (
                    <Card className="glass-card border-0 mb-4">
                      <CardContent className="p-4 space-y-3">
                        <Input
                          value={newTask.title}
                          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                          placeholder="Task title..."
                          className="bg-white/5 border-white/20 text-white"
                        />
                        <Textarea
                          value={newTask.description}
                          onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                          placeholder="Description..."
                          className="bg-white/5 border-white/20 text-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={createTask} size="sm" className="btn-primary text-white">
                            Create
                          </Button>
                          <Button
                            onClick={() => {
                              setShowNewTask(false);
                              setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
                            }}
                            size="sm"
                            variant="outline"
                            className="glass-card border-0 text-white hover:bg-white/5"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-3">
                    {tasks.length === 0 ? (
                      <div className="text-center py-12">
                        <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-400">No tasks yet. Create one above!</p>
                      </div>
                    ) : (
                      tasks.map(task => {
                        const blocked = isTaskBlocked(task, tasks);
                        
                        return (
                          <div
                            key={task.id}
                            className={`glass-card rounded-lg p-4 ${blocked ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-medium">{task.title}</h4>
                                  <Badge className={`${
                                    task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  } border-0 text-xs`}>
                                    {task.priority}
                                  </Badge>
                                  {blocked && (
                                    <Badge className="bg-gray-500/20 text-gray-400 border-0 text-xs">
                                      🔒 Blocked
                                    </Badge>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                                )}
                                {task.blocked_by && task.blocked_by.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-gray-500 text-xs mb-1">Blocked by:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {task.blocked_by.map(blockerId => {
                                        const blocker = tasks.find(t => t.id === blockerId);
                                        return blocker ? (
                                          <Badge key={blockerId} className="bg-gray-500/20 text-gray-400 border-0 text-xs">
                                            {blocker.title}
                                          </Badge>
                                        ) : null;
                                      })}
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  {task.assigned_to && <span>👤 Assigned</span>}
                                  {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                                  {task.estimated_hours && <span>⏱️ {task.estimated_hours}h</span>}
                                </div>
                              </div>
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                disabled={blocked}
                                className={`glass-card border-0 text-white text-xs px-2 py-1 rounded ${blocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="code" className="flex-1 m-0 p-4">
                  <CollaborativeCodeEditor roomId={activeRoom.id} user={user} />
                </TabsContent>

                <TabsContent value="whiteboard" className="flex-1 m-0 p-4">
                  <CollaborativeWhiteboard roomId={activeRoom.id} user={user} />
                </TabsContent>

                <TabsContent value="files" className="flex-1 m-0 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {activeRoom.shared_files?.length === 0 || !activeRoom.shared_files ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-400 mb-4">No files shared yet</p>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])}
                          />
                          <Button className="btn-primary text-white">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload File
                          </Button>
                        </label>
                      </div>
                    ) : (
                      <>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0])}
                          />
                          <Button size="sm" className="w-full btn-primary text-white mb-4">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload File
                          </Button>
                        </label>
                        {activeRoom.shared_files.map((file, i) => (
                          <div key={i} className="glass-card rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                <div>
                                  <p className="text-white font-medium">{file.file_name}</p>
                                  <p className="text-gray-400 text-xs">
                                    {new Date(file.uploaded_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="glass-card border-0 text-white hover:bg-white/5">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}