import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader, MessageSquare, Users, CheckCheck } from 'lucide-react';

const MessagesPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        last_message_at,
        participant_one_profile:profiles!conversations_participant_one_fkey(id, username, display_name, avatar_url),
        participant_two_profile:profiles!conversations_participant_two_fkey(id, username, display_name, avatar_url),
        direct_messages(id, body, created_at, sender_id, read_at)
      `)
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { foreignTable: 'direct_messages', ascending: false })
      .limit(1, { foreignTable: 'direct_messages' });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load conversations.' });
    } else {
      setConversations(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user, navigate, fetchConversations]);

  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (payload) => {
      fetchConversations();
    };

    const handleReadReceipt = (payload) => {
      setConversations(currentConversations => 
        currentConversations.map(convo => {
          if (convo.id === payload.new.conversation_id) {
            const lastMessage = convo.direct_messages[0];
            if (lastMessage && lastMessage.id === payload.new.id) {
              return {
                ...convo,
                direct_messages: [{ ...lastMessage, read_at: payload.new.read_at }]
              };
            }
          }
          return convo;
        })
      );
    };

    const messagesChannel = supabase.channel('public:direct_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, handleNewMessage)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'direct_messages', filter: `read_at=not.is.null` }, handleReadReceipt)
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user, fetchConversations]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-400" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Messages | Devconnect</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold">Messages</h1>
          </div>

          <div className="bg-glass border-glow rounded-lg">
            {conversations.length > 0 ? (
              <ul className="divide-y divide-gray-800">
                {conversations.map(convo => {
                  if (!convo.participant_one_profile || !convo.participant_two_profile) return null;

                  const otherUser = convo.participant_one_profile.id === user.id
                    ? convo.participant_two_profile
                    : convo.participant_one_profile;
                  const lastMessage = convo.direct_messages[0];

                  return (
                    <li key={convo.id}>
                      <Link to={`/messages/user/${otherUser.username}`} className="block p-4 hover:bg-gray-800/50 transition-colors duration-200">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              className="w-12 h-12 rounded-full object-cover"
                              alt={otherUser.display_name}
                              src={otherUser.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${otherUser.display_name}`} />
                          </div>
                          <div className="flex-grow overflow-hidden">
                            <div className="flex justify-between items-baseline">
                              <p className="font-bold text-lg truncate">{otherUser.display_name}</p>
                              {convo.last_message_at && <p className="text-xs text-gray-400">{new Date(convo.last_message_at).toLocaleDateString()}</p>}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              {lastMessage && lastMessage.sender_id === user.id && (
                                <CheckCheck className={`w-4 h-4 flex-shrink-0 ${lastMessage.read_at ? 'text-blue-400' : 'text-gray-500'}`} />
                              )}
                              <p className="truncate">{lastMessage ? lastMessage.body : 'No messages yet'}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center p-12">
                <Users className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-2 text-xl font-semibold">No conversations</h3>
                <p className="mt-1 text-gray-400">Start a conversation from a user's profile.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default MessagesPage;