import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { api } from '@/lib/db';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader } from '@/components/Loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  Send, 
  Search, 
  MessageSquare, 
  MoreVertical, 
  CheckCheck,
  UserPlus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MessagingDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null); // Holds user ID of active chat
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  // New Message Modal
  const [isNewMsgOpen, setIsNewMsgOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (user) {
      loadConversations();
      setupRealtimeSubscription();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation, conversations]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations(user.id);
      setConversations(data);
      // If there are conversations and none active, select first
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0].user.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('public:direct_messages_v2')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages_v2' },
        (payload) => {
          // Simple reload for now to keep state consistent. 
          // In prod, you'd optimistically update the specific conversation.
          if (payload.new.recipient_id === user.id || payload.new.sender_id === user.id) {
             loadConversations();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    try {
      await api.sendMessage(user.id, activeConversation, messageInput);
      setMessageInput('');
      loadConversations(); // Refresh to see new message immediately
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: error.message
      });
    }
  };

  const handleUserSearch = async (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      if(query.length > 2) {
          const results = await api.searchUsers(query);
          setSearchResults(results || []);
      } else {
          setSearchResults([]);
      }
  };

  const startNewConversation = (otherUser) => {
      setActiveConversation(otherUser.id);
      setIsNewMsgOpen(false);
      // Check if conv already exists locally, if not, loadConversations will catch it eventually
      // But we can optimistically add a placeholder if needed.
      // For now, just switch active ID. If no history, empty view is shown.
      
      // If this is a truly new conversation not in the list yet:
      const exists = conversations.find(c => c.user.id === otherUser.id);
      if(!exists) {
         setConversations(prev => [
             { user: otherUser, messages: [], unreadCount: 0 }, 
             ...prev
         ]);
      }
  };

  // Get active conversation object
  const activeChat = conversations.find(c => c.user.id === activeConversation);

  // Mark as read when switching
  useEffect(() => {
      if(activeChat && activeChat.unreadCount > 0) {
          api.markMessagesRead(user.id, activeChat.user.id);
          // Optimistic local update
          activeChat.unreadCount = 0; 
      }
  }, [activeConversation]);

  if (loading && conversations.length === 0) return <div className="min-h-screen pt-24 flex justify-center"><Loader /></div>;

  return (
    <>
      <Helmet>
        <title>Messages | Devconnect</title>
      </Helmet>

      <div className="min-h-screen pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto h-[80vh] bg-glass rounded-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row shadow-2xl">
          
          {/* Sidebar */}
          <div className="w-full md:w-80 border-r border-white/10 bg-black/20 flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-bold text-white text-lg">Messages</h2>
              
              <Dialog open={isNewMsgOpen} onOpenChange={setIsNewMsgOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white">
                        <UserPlus className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white">
                      <DialogHeader>
                          <DialogTitle>New Message</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                              <Input 
                                placeholder="Search users..." 
                                className="pl-10 bg-black/30 border-white/10"
                                value={searchQuery}
                                onChange={handleUserSearch}
                              />
                          </div>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                              {searchResults.map(res => (
                                  <div 
                                    key={res.id} 
                                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors"
                                    onClick={() => startNewConversation(res)}
                                  >
                                      <Avatar className="h-8 w-8">
                                          <AvatarImage src={res.avatar_url} />
                                          <AvatarFallback>{res.display_name?.[0]}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                          <p className="text-sm font-medium">{res.display_name}</p>
                                          <p className="text-xs text-gray-400">@{res.username}</p>
                                      </div>
                                  </div>
                              ))}
                              {searchQuery.length > 2 && searchResults.length === 0 && (
                                  <p className="text-sm text-gray-500 text-center py-2">No users found</p>
                              )}
                          </div>
                      </div>
                  </DialogContent>
              </Dialog>
            </div>

            <div className="flex-grow overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No conversations yet. Start a new one!
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.user.id}
                    onClick={() => setActiveConversation(conv.user.id)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-l-2 ${
                      activeConversation === conv.user.id
                        ? 'bg-white/10 border-blue-500'
                        : 'hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <div className="relative">
                        <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.user.avatar_url} />
                        <AvatarFallback className="bg-gray-700">{conv.user.display_name?.[0]}</AvatarFallback>
                        </Avatar>
                        {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-[10px] text-white px-1.5 py-0.5 rounded-full border border-black">
                                {conv.unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={`text-sm font-medium truncate ${activeConversation === conv.user.id ? 'text-white' : 'text-gray-300'}`}>
                          {conv.user.display_name}
                        </h3>
                        {conv.lastMessage && (
                           <span className="text-[10px] text-gray-500">
                               {new Date(conv.lastMessage.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                           </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.messages[0]?.sender_id === user.id ? 'You: ' : ''}
                        {conv.messages[0]?.body || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-grow flex flex-col bg-black/10">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activeChat.user.avatar_url} />
                      <AvatarFallback>{activeChat.user.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-bold text-white">{activeChat.user.display_name}</h2>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                         @{activeChat.user.username}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                {/* Chat Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-dots-pattern">
                  {/* Reverse order for display usually, but here we map normally */}
                  {[...activeChat.messages].reverse().map((msg, idx) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div 
                        key={msg.id || idx} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.body}</p>
                          <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMe ? 'text-blue-200 justify-end' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && <CheckCheck className="w-3 h-3 opacity-70" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex gap-2">
                    <Textarea 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      className="min-h-[50px] bg-black/30 border-white/10 resize-none"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="h-auto px-6 bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-white">Your Messages</h3>
                <p className="text-gray-400 max-w-sm">Select a conversation from the sidebar or start a new one to begin chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagingDashboard;