import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useOnlinePresence = () => {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // We need both user and profile to properly track presence with metadata
    if (!user || !profile) {
      setOnlineUsers([]);
      setIsOnline(false);
      return;
    }

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        
        // Process presence state into a flat array of unique users
        const uniqueUsers = new Map();

        Object.keys(newState).forEach(key => {
            const presences = newState[key];
            if (presences && presences.length > 0) {
                // We grab the first presence object for the user data
                const presence = presences[0];
                uniqueUsers.set(key, {
                    id: key,
                    username: presence.username || 'User',
                    display_name: presence.display_name || 'Anonymous',
                    avatar_url: presence.avatar_url,
                    online_at: presence.online_at
                });
            }
        });
        
        setOnlineUsers(Array.from(uniqueUsers.values()));
        setIsOnline(true);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, profile]);

  return { isOnline, onlineUsers };
};