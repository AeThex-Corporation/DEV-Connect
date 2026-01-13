import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Loader, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConversationPage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const channelRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOrCreateConversation = useCallback(async (currentUserId, otherUserId) => {
    // 1. First, check if a conversation exists regardless of participant order
    // This handles the case where A started talking to B, or B started talking to A previously.
    const { data: existing, error: existingError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_one.eq.${currentUserId},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${currentUserId})`)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
       console.error("Error fetching conversation:", existingError);
       throw existingError;
    }
    
    if (existing) {
        return existing.id;
    }

    // 2. If no conversation exists, try to create one.
    // We use a consistent ordering (smallest ID first) to help prevent race conditions in some setups,
    // though the backend unique constraint handles the strict enforcement.
    // However, if a conversation was created by another client milliseconds ago between step 1 and 2, 
    // the insert will fail with 23505.
    
    const { data: newConversation, error: newConversationError } = await supabase
      .from('conversations')
      .insert({ participant_one: currentUserId, participant_two: otherUserId })
      .select('id')
      .single();

    if (newConversationError) {
        // If we hit a duplicate key error (23505), it means the conversation was created 
        // concurrently. We should simply fetch it again.
        if (newConversationError.code === '23505') {
            const { data: retryExisting, error: retryError } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(participant_one.eq.${currentUserId},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${currentUserId})`)
                .maybeSingle();
            
            if (retryError) throw retryError;
            if (retryExisting) return retryExisting.id;
        }
        throw newConversationError;
    }
    
    return newConversation.id;
  }, []);

  const markMessagesAsRead = useCallback(async (convoId, currentUserId) => {
    if (!convoId || !currentUserId) return;
    await supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', convoId)
      .neq('sender_id', currentUserId)
      .is('read_at', null);
  }, []);

  useEffect(() => {
    if (!user || !username) return;

    const fetchInitialData = async () => {
      setLoading(true);

      const { data: otherUserData, error: otherUserError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .eq('username', username)
        .single();

      if (otherUserError || !otherUserData) {
        toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
        navigate('/messages');
        return;
      }
      
      // Prevent chatting with yourself
      if (otherUserData.id === user.id) {
          toast({ variant: 'default', title: 'Note', description: 'You cannot message yourself.' });
          navigate('/messages');
          return;
      }

      setOtherUser(otherUserData);

      try {
        const convoId = await getOrCreateConversation(user.id, otherUserData.id);
        setConversationId(convoId);

        const { data: messagesData, error: messagesError } = await supabase
          .from('direct_messages')
          .select('*, sender:profiles!direct_messages_sender_id_fkey(id, username, display_name, avatar_url)')
          .eq('conversation_id', convoId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData);
        await markMessagesAsRead(convoId, user.id);

      } catch (error) {
        console.error("Conversation load error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load conversation.' });
        navigate('/messages');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [username, user, toast, navigate, getOrCreateConversation, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversationId || !user) return;

    const handleNewMessage = async (payload) => {
      const { data: senderProfile, error } = await supabase.from('profiles').select('*').eq('id', payload.new.sender_id).single();
      if (!error) {
        setMessages(prev => [...prev, { ...payload.new, sender: senderProfile }]);
        if (payload.new.sender_id !== user.id) {
          await markMessagesAsRead(conversationId, user.id);
        }
      }
    };

    const handleReadReceipt = (payload) => {
      setMessages(currentMessages =>
        currentMessages.map(msg =>
          msg.id === payload.new.id ? { ...msg, read_at: payload.new.read_at } : msg
        )
      );
    };

    channelRef.current = supabase.channel(`dm:${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `conversation_id=eq.${conversationId}` }, handleNewMessage)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'direct_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
          setMessages(currentMessages =>
            currentMessages.map(msg => 
              payload.new.read_at && msg.sender_id !== user.id && !msg.read_at ? { ...msg, read_at: payload.new.read_at } : msg
            )
          );
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.senderId !== user.id) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, user, markMessagesAsRead]);

  const handleTyping = () => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { senderId: user.id },
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversationId) return;

    const { error } = await supabase.from('direct_messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: newMessage.trim()
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error sending message', description: error.message });
    } else {
      setNewMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-12 w-12 text-blue-400" />
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="text-center py-20 text-2xl">Conversation not found.</div>
    );
  }

  return (
    <>
      <Helmet><title>Conversation with {otherUser.display_name} | Devconnect</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-glass p-6 rounded-lg border-glow h-[80vh] flex flex-col">
          <div className="border-b border-gray-700 pb-4 mb-4 flex items-center gap-4">
            <Link to="/messages">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <img
              className="w-10 h-10 rounded-full object-cover"
              alt={otherUser.display_name}
              src={otherUser.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${otherUser.display_name}`} />
            <div>
              <h1 className="text-2xl font-bold">{otherUser.display_name}</h1>
              <p className="text-gray-400">@{otherUser.username}</p>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto pr-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                {msg.sender_id !== user.id && (
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    alt={msg.sender.display_name}
                    src={msg.sender.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${msg.sender.display_name}`} />
                )}
                <div className={`max-w-lg px-4 py-2 rounded-lg ${msg.sender_id === user.id ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <p>{msg.body}</p>
                </div>
                {msg.sender_id === user.id && (
                  <CheckCheck className={`w-4 h-4 self-end mb-1 ${msg.read_at ? 'text-blue-400' : 'text-gray-500'}`} />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="h-6 px-4 text-sm text-gray-400 italic"
              >
                {otherUser.display_name} is typing...
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSendMessage} className="mt-4 flex gap-4">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="flex-grow bg-gray-800 border-gray-700 text-white"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ConversationPage;