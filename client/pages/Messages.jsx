
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Search,
  MessageSquare,
  User as UserIcon,
  ArrowLeft,
  Paperclip,
  Image as ImageIcon,
  Bot,
  Sparkles
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedSession]);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const sessions = await base44.entities.ChatSession.list();
      const userSessions = sessions.filter(
        s => s.participant_1_id === currentUser.id || s.participant_2_id === currentUser.id
      );

      const sessionsWithUsers = await Promise.all(
        userSessions.map(async (session) => {
          const otherUserId = session.participant_1_id === currentUser.id 
            ? session.participant_2_id 
            : session.participant_1_id;
          
          const otherUser = await base44.entities.User.filter({ id: otherUserId });
          return {
            ...session,
            otherUser: otherUser[0]
          };
        })
      );

      setChatSessions(sessionsWithUsers.sort((a, b) => 
        new Date(b.last_message_at) - new Date(a.last_message_at)
      ));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedSession) return;

    try {
      const msgs = await base44.entities.Message.filter({
        $or: [
          { sender_id: user.id, receiver_id: selectedSession.otherUser.id },
          { sender_id: selectedSession.otherUser.id, receiver_id: user.id }
        ]
      }, 'created_date');

      setMessages(msgs);

      const unreadMessages = msgs.filter(
        m => m.receiver_id === user.id && !m.read
      );

      for (const msg of unreadMessages) {
        await base44.entities.Message.update(msg.id, { 
          read: true,
          read_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    setSending(true);
    try {
      await base44.entities.Message.create({
        sender_id: user.id,
        receiver_id: selectedSession.otherUser.id,
        content: newMessage,
        message_type: 'direct',
        read: false
      });

      await base44.entities.ChatSession.update(selectedSession.id, {
        last_message: newMessage,
        last_message_at: new Date().toISOString()
      });

      await base44.entities.Notification.create({
        user_id: selectedSession.otherUser.id,
        type: 'message',
        title: '💬 New Message',
        message: `${user.full_name} sent you a message`,
        link: createPageUrl('Messages')
      });

      setNewMessage("");
      loadMessages();
      loadData();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;

    const userMsg = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput("");
    setAiLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Devconnect AI Assistant, a helpful chatbot for a Roblox developer job platform. Help users with questions about the platform, career advice, job searching, portfolio tips, and Roblox development.

User question: ${aiInput}

Previous conversation:
${aiMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

Provide a helpful, friendly, and concise response.`,
        add_context_from_internet: false
      });

      const assistantMsg = { role: 'assistant', content: response };
      setAiMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error with AI chat:', error);
      const errorMsg = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setAiMessages(prev => [...prev, errorMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredSessions = chatSessions.filter(session =>
    session.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="glass-card rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="chats" className="w-full">
          <TabsList className="glass-card border-0 mb-4 sm:mb-6">
            <TabsTrigger value="chats" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Messages</span>
              <span className="sm:hidden">Chats</span>
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
          </TabsList>

          {/* Regular Messages Tab */}
          <TabsContent value="chats" className="mt-0">
            <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Chat List */}
              <Card className="glass-card border-0 lg:col-span-1">
                <CardContent className="p-3 sm:p-4">
                  <div className="mb-3 sm:mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
                    {filteredSessions.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-400">No conversations yet</p>
                      </div>
                    ) : (
                      filteredSessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => {
                            setSelectedSession(session);
                            setShowAIChat(false);
                          }}
                          className={`w-full p-3 rounded-lg text-left transition-all ${
                            selectedSession?.id === session.id
                              ? 'bg-indigo-500/20 border border-indigo-500/30'
                              : 'glass-card hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {session.otherUser?.avatar_url ? (
                              <img
                                src={session.otherUser.avatar_url}
                                alt={session.otherUser.full_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-white font-medium truncate">
                                  {session.otherUser?.full_name || 'Unknown User'}
                                </p>
                                {session[`unread_count_${session.participant_1_id === user.id ? 'p1' : 'p2'}`] > 0 && (
                                  <Badge className="bg-indigo-500 text-white text-xs">
                                    {session[`unread_count_${session.participant_1_id === user.id ? 'p1' : 'p2'}`]}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm truncate">
                                {session.last_message || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Chat Window */}
              <Card className="glass-card border-0 lg:col-span-2">
                {selectedSession ? (
                  <CardContent className="p-0 flex flex-col h-[600px] sm:h-[700px]">
                    {/* Header */}
                    <div className="p-3 sm:p-4 border-b border-white/10 flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setSelectedSession(null)}
                        className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-white/5"
                      >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </button>
                      {selectedSession.otherUser?.avatar_url ? (
                        <img
                          src={selectedSession.otherUser.avatar_url}
                          alt={selectedSession.otherUser.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-semibold">
                          {selectedSession.otherUser?.full_name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {selectedSession.otherUser?.developer_roles?.[0] || 'Developer'}
                        </p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.sender_id === user.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isOwn
                                  ? 'bg-indigo-500 text-white'
                                  : 'glass-card text-white'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`}>
                                {new Date(msg.created_date).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Input */}
                    <div className="p-3 sm:p-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 bg-white/5 border-white/10 text-white text-sm"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sending}
                          className="btn-primary text-white px-3 sm:px-4"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="flex items-center justify-center h-[600px] sm:h-[700px] p-4">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">Select a conversation</p>
                      <p className="text-gray-400 text-sm">
                        Choose a chat from the list to start messaging
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="mt-0">
            <Card className="glass-card border-0 max-w-4xl mx-auto">
              <CardContent className="p-0 flex flex-col h-[600px] sm:h-[700px]">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-indigo-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        AI Assistant
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Ask me anything about Devconnect, careers, or Roblox development
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {aiMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Hi! I'm your AI Assistant</h3>
                      <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
                        I can help you with questions about:
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                        <div className="glass-card rounded-lg p-3 text-left">
                          <p className="text-white text-sm font-medium">📋 Platform Help</p>
                          <p className="text-gray-400 text-xs">How to use Devconnect</p>
                        </div>
                        <div className="glass-card rounded-lg p-3 text-left">
                          <p className="text-white text-sm font-medium">💼 Career Advice</p>
                          <p className="text-gray-400 text-xs">Job search tips</p>
                        </div>
                        <div className="glass-card rounded-lg p-3 text-left">
                          <p className="text-white text-sm font-medium">🎮 Roblox Dev</p>
                          <p className="text-gray-400 text-xs">Technical guidance</p>
                        </div>
                        <div className="glass-card rounded-lg p-3 text-left">
                          <p className="text-white text-sm font-medium">📈 Portfolio Tips</p>
                          <p className="text-gray-400 text-xs">Build your profile</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    aiMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-indigo-500 text-white'
                              : 'glass-card text-white'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400 text-xs font-semibold">AI Assistant</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="glass-card rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                          <span className="text-gray-400 text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendAIMessage()}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-white/5 border-white/10 text-white"
                      disabled={aiLoading}
                    />
                    <Button
                      onClick={sendAIMessage}
                      disabled={!aiInput.trim() || aiLoading}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
