import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSiteOwner, setIsSiteOwner] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState('explorer');

  // Function to assign site owner role if conditions met
  const assignSiteOwnerRole = useCallback(async (userId, email) => {
    try {
      if (email === 'mrpiglr@gmail.com') {
         const { error: insertError } = await supabase
          .from('user_roles')
          .upsert([
             { user_id: userId, role: 'site_owner' },
             { user_id: userId, role: 'admin' }
          ], { onConflict: 'user_id, role' });
         
         if (!insertError) return true;
      }

      const { count, error: countError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'site_owner');

      if (!countError && count === 0) {
        await supabase.from('user_roles').insert({ user_id: userId, role: 'site_owner' });
        return true;
      }
    } catch (error) {
      // Silent catch to prevent app crashes on role assignment
      console.warn("Role assignment notice:", error);
    }
    return false;
  }, []);

  // Fetch profile and roles
  const fetchProfileAndRoles = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      setRoles([]);
      setIsAdmin(false);
      setIsSiteOwner(false);
      setSubscriptionTier('explorer');
      return null;
    }
    
    // Attempt to assign roles first
    await assignSiteOwnerRole(currentUser.id, currentUser.email);

    // Fetch profile and roles in parallel
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', currentUser.id)
    ]);
    
    let profileData = null;
    if (profileRes.error) {
      console.error("Error fetching profile:", profileRes.error);
    } else {
      profileData = profileRes.data;
      setProfile(profileData);
      setSubscriptionTier(profileData?.subscription_tier || 'explorer');
    }

    let userRoles = [];
    if (rolesRes.data) {
        userRoles = rolesRes.data.map(r => r.role);
    }

    // Hardcode check for specific email for immediate UI update
    if (currentUser.email === 'mrpiglr@gmail.com') {
        if (!userRoles.includes('site_owner')) userRoles.push('site_owner');
        if (!userRoles.includes('admin')) userRoles.push('admin');
    }

    setRoles(userRoles);
    const userIsSiteOwner = userRoles.includes('site_owner');
    setIsSiteOwner(userIsSiteOwner);
    setIsAdmin(userRoles.includes('admin') || userIsSiteOwner);
    
    return profileData;
  }, [assignSiteOwnerRole]);

  // Handle Auth State Changes - DECOUPLED from Location
  // This function is now stable and won't change on route updates
  const handleAuthStateChange = useCallback(async (event, currentSession) => {
    const currentUser = currentSession?.user ?? null;
    setSession(currentSession);
    setUser(currentUser);

    if (currentUser) {
      try {
        await supabase.rpc('update_last_active');
      } catch (e) {
        // Ignore minor RPC errors
      }
      await fetchProfileAndRoles(currentUser);
    } else {
      setProfile(null);
      setRoles([]);
      setIsAdmin(false);
      setIsSiteOwner(false);
      setSubscriptionTier('explorer');
    }
    
    setLoading(false);
  }, [fetchProfileAndRoles]);

  // Initial Session Load & Subscription
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          await handleAuthStateChange('INITIAL_SESSION', initialSession);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        handleAuthStateChange(event, session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  // Routing & Redirection Logic - Separated Effect
  // This effect handles redirects without triggering re-fetches
  useEffect(() => {
    if (loading) return; 

    const path = location.pathname;

    // 1. Onboarding Redirection
    if (user && (!profile || !profile.onboarding_complete)) {
       // Allow logout and auth paths to happen even if not onboarded
       if (path !== '/onboarding' && path !== '/logout' && !path.startsWith('/auth/')) {
           navigate('/onboarding', { replace: true });
       }
       return;
    }

    // 2. Auth Page Redirection (for logged in users)
    // If user is fully onboarded, they shouldn't see these pages
    if (user && profile?.onboarding_complete) {
       const authRoutes = ['/login', '/signup', '/onboarding', '/verify-email', '/forgot-password'];
       if (authRoutes.includes(path)) {
           navigate('/dashboard', { replace: true });
       }
    }
  }, [user, profile, loading, location.pathname, navigate]);

  // Activity Interval (Periodic updates)
  useEffect(() => {
    const activityInterval = setInterval(async () => {
      if (!user) return;
      
      // Verify session validity before RPC
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
         try {
           await supabase.rpc('update_last_active');
         } catch(e) {
           // Silent fail on interval
         }
      }
    }, 60000);

    return () => clearInterval(activityInterval);
  }, [user]);

  const signUp = useCallback(async (email, password, options) => {
    return await supabase.auth.signUp({ email, password, options });
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: "destructive", title: "Sign in Failed", description: error.message });
    }
    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error && error.message !== 'Session from session_id claim in JWT does not exist') {
      toast({ variant: "destructive", title: "Sign out Failed", description: error.message });
    }
    // Cleanup local state immediately
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setIsAdmin(false);
    setIsSiteOwner(false);
    navigate('/');
    return { error };
  }, [toast, navigate]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await fetchProfileAndRoles(user);
    }
    return null;
  }, [user, fetchProfileAndRoles]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    profile,
    roles,
    isAdmin,
    isSiteOwner,
    subscriptionTier,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }), [user, session, loading, profile, roles, isAdmin, isSiteOwner, subscriptionTier, signUp, signIn, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};