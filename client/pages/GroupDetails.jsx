
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MessageSquare,
  Send,
  Code,
  Paperclip,
  Calendar,
  FolderKanban
} from "lucide-react";
import GroupKanban from "../components/GroupKanban";

export default function GroupDetails() {
  const [group, setGroup] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState({ code: '', language: 'lua' });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const urlParams = new URLSearchParams(window.location.search);
      const groupId = urlParams.get('id');
      
      const groups = await base44.entities.Group.filter({ id: groupId });
      if (groups.length > 0) {
        setGroup(groups[0]);
        await loadMessages(groupId);
      }
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (groupId) => {
    if (!groupId && !group) return;
    
    try {
      const msgs = await base44.entities.GroupChat.filter(
        { group_id: groupId || group.id },
        '-created_date'
      );
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !showCodeSnippet) return;

    try {
      const messageData = {
        group_id: group.id,
        sender_id: user.id,
        message_type: showCodeSnippet ? 'code' : 'text',
        content: showCodeSnippet ? `Code: ${codeSnippet.language}` : newMessage
      };

      if (showCodeSnippet) {
        messageData.code_snippet = codeSnippet;
      }

      await base44.entities.GroupChat.create(messageData);
      setNewMessage('');
      setShowCodeSnippet(false);
      setCodeSnippet({ code: '', language: 'lua' });
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.GroupChat.create({
        group_id: group.id,
        sender_id: user.id,
        message_type: 'file',
        content: `Shared: ${file.name}`,
        attachments: [{
          file_name: file.name,
          file_url: file_url,
          file_type: file.type
        }]
      });

      loadMessages();
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

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Group Not Found</h2>
        <Button onClick={() => window.location.href = createPageUrl('Groups')} className="btn-primary text-white">
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Group Header */}
      <Card className="glass-card border-0 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              {group.avatar_url ? (
                <img src={group.avatar_url} alt={group.name} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{group.name}</h1>
                <p className="text-gray-400 text-sm mb-3">{group.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-purple-500/20 text-purple-300 border-0">
                    {group.category}
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-300 border-0">
                    <Users className="w-3 h-3 mr-1" />
                    {group.member_count} members
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="glass-card border-0 mb-6">
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <FolderKanban className="w-4 h-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white text-sm">Group Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md ${
                        isMine 
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-500' 
                          : 'glass-card'
                      } rounded-lg p-3`}>
                        {!isMine && (
                          <p className="text-xs text-gray-400 mb-1">User {msg.sender_id.slice(-6)}</p>
                        )}
                        
                        {msg.message_type === 'code' && msg.code_snippet ? (
                          <div>
                            <Badge className="bg-gray-800 text-gray-200 border-0 text-xs mb-2">
                              <Code className="w-3 h-3 mr-1" />
                              {msg.code_snippet.language}
                            </Badge>
                            <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                              <code className="text-gray-100">{msg.code_snippet.code}</code>
                            </pre>
                          </div>
                        ) : msg.message_type === 'file' ? (
                          <a
                            href={msg.attachments?.[0]?.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline text-sm"
                          >
                            📎 {msg.attachments?.[0]?.file_name}
                          </a>
                        ) : (
                          <p className="text-white text-sm">{msg.content}</p>
                        )}
                        
                        <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-gray-500'}`}>
                          {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Code Snippet Input */}
              {showCodeSnippet && (
                <div className="glass-card rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <select
                      value={codeSnippet.language}
                      onChange={(e) => setCodeSnippet({ ...codeSnippet, language: e.target.value })}
                      className="bg-white/5 border border-white/10 text-white rounded px-2 py-1 text-sm"
                    >
                      <option value="lua">Lua</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                    </select>
                    <Button
                      onClick={() => setShowCodeSnippet(false)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                  <textarea
                    value={codeSnippet.code}
                    onChange={(e) => setCodeSnippet({ ...codeSnippet, code: e.target.value })}
                    placeholder="Paste your code here..."
                    className="w-full bg-gray-900 text-gray-100 rounded p-2 font-mono text-sm h-32"
                  />
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowCodeSnippet(!showCodeSnippet)}
                >
                  <Code className="w-4 h-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-white/5 border-white/10 text-white"
                  disabled={showCodeSnippet}
                />
                <Button type="submit" className="btn-primary text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <GroupKanban groupId={group.id} user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="glass-card border-0">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Group Events Coming Soon</h3>
              <p className="text-gray-400">Schedule and manage group events and meetings</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
