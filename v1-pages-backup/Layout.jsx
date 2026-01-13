

import React from "react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  User,
  Users, 
  MessageSquare, 
  Briefcase,
  Bell,
  Shield,
  LogOut
} from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { base44 } from "@/api/base44Client";
import { isAdmin, canModerate } from "@/components/utils/permissions";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Jobs",
    url: createPageUrl("Jobs"),
    icon: Briefcase,
  },
  {
    title: "Developers",
    url: createPageUrl("BrowseProfiles"),
    icon: Users,
  },
  {
    title: "Feed",
    url: createPageUrl("DeveloperFeed"),
    icon: MessageSquare,
  },
  {
    title: "Messages",
    url: createPageUrl("Messages"),
    icon: MessageSquare,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [user, setUser] = React.useState(null);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    checkAuthAndRedirect();
    loadUnreadCount();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) return;

      const currentUser = await base44.auth.me();
      const notifications = await base44.entities.Notification.filter({
        user_id: currentUser.id,
        read: false
      });
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = createPageUrl("home");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const publicPages = ["Waitlist", "Welcome", "About", "home", "Blog", "Press", "Login"];
  if (!isAuthenticated && !publicPages.includes(currentPageName)) {
    if (base44.auth && typeof base44.auth.redirectToLogin === 'function') {
      base44.auth.redirectToLogin(location.pathname);
    } else {
      window.location.href = createPageUrl("home");
    }
    return null;
  }

  // Role-based navigation items (admin only for MVP)
  const roleBasedNavItems = [];
  
  if (canModerate(user)) {
    roleBasedNavItems.push({
      title: "Moderation",
      url: createPageUrl("Moderation"),
      icon: Shield,
      color: "red"
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        .nav-glass {
          background-color: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        
        .glass-card {
          background-color: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .user-menu-dropdown {
          background-color: rgba(26, 26, 26, 0.98);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }
        
        html {
          scroll-behavior: smooth;
        }

        @media (max-width: 640px) {
          .mobile-bottom-nav {
            padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);
          }
        }
      `}</style>

      {/* Desktop & Tablet Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl(isAuthenticated ? "Dashboard" : "home")} className="flex items-center space-x-3 mr-6">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68d9d1f385dfdd1e5c5c92d0/c5979f609_Gemini_Generated_Image_q227rdq227rdq2271.png"
                alt="Dev-Link"
                className="w-8 h-8 object-contain"
              />
              <span className="text-white font-bold text-xl">Dev-Link</span>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === item.url
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                ))}
                
                {/* Role-Based Navigation */}
                {roleBasedNavItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === item.url
                        ? `bg-${item.color}-500/20 text-${item.color}-400`
                        : `text-${item.color}-400 hover:text-${item.color}-300 hover:bg-${item.color}-500/10`
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {!isAuthenticated ? (
                <>
                  <Button 
                    onClick={() => window.location.href = createPageUrl("Waitlist")}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hidden md:block"
                  >
                    Join Waitlist
                  </Button>
                  <Button 
                    onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                    variant="outline"
                    className="glass-card border-white/20 text-white hover:bg-white/5"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-white/5 transition-all"
                    >
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>

                    {showUserMenu && (
                      <div className="absolute top-full right-0 mt-3 w-64 user-menu-dropdown rounded-xl z-50">
                        <div className="p-4 border-b border-white/10">
                          <p className="text-white font-semibold text-sm">{user?.full_name}</p>
                          <p className="text-gray-400 text-xs mt-1">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to={createPageUrl("Profile")}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to={createPageUrl("Teams")}
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Users className="w-4 h-4" />
                            <span>Company Profile</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {isAuthenticated && (
        <NotificationCenter 
          isOpen={notificationOpen} 
          onClose={() => {
            setNotificationOpen(false);
            loadUnreadCount();
          }} 
        />
      )}

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden nav-glass mobile-bottom-nav">
          <div className="flex justify-around items-center h-16 px-2">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-all min-w-[70px] ${
                  location.pathname === item.url
                    ? 'text-white bg-white/10'
                    : 'text-gray-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={isAuthenticated ? "pt-16 pb-20 md:pb-8" : "pt-16"}>
        <div className={isAuthenticated ? "max-w-7xl mx-auto" : ""}>
          {children}
        </div>
      </main>
    </div>
  );
}

