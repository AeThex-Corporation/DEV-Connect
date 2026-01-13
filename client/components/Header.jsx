import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LayoutDashboard, LogOut, Users, Clock, FileText, BarChart, Settings, Lock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationCenter from '@/components/NotificationCenter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { OnlineUsersList } from '@/components/OnlineUsersList';

const Header = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const { isOnline, onlineUsers } = useOnlinePresence();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Find Work', path: '/jobs' },
    { name: 'Hire Talent', path: '/developers' },
    { name: 'Studios', path: '/studios' },
    { name: 'Learn', path: '/dashboard/foundation' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled ? 'bg-black/95 backdrop-blur-md border-white/10 py-3' : 'bg-black/50 border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-white hover:opacity-90 transition-opacity">
            <img src="/logo.svg" alt="Devconnect Logo" className="w-9 h-9" />
            <span className="hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Devconnect
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                  isActive(link.path) ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Online Users Widget */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors rounded-full border border-transparent hover:border-white/10">
                      <div className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </div>
                      <span className="text-xs font-medium">{onlineUsers.length} Online</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 bg-gray-900 border-gray-800 shadow-xl" align="end" sideOffset={8}>
                     <div className="p-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
                        <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" /> Active Members
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Real-time list of users currently online.</p>
                     </div>
                     <OnlineUsersList users={onlineUsers} />
                  </PopoverContent>
                </Popover>

                <ThemeToggle />
                <NotificationCenter />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none rounded-full ring-2 ring-transparent hover:ring-blue-500 transition-all relative">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-blue-900 text-blue-100">
                          {profile?.display_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span 
                        className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-black ${
                          isOnline ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                        title={isOnline ? "Online" : "Offline"}
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 bg-gray-950 border-gray-800 text-white shadow-xl">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-medium leading-none truncate max-w-[150px]">{profile?.display_name}</p>
                           <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                        </div>
                        <p className="text-xs leading-none text-gray-400 truncate">@{profile?.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem asChild className="hover:bg-red-900/20 focus:bg-red-900/20 cursor-pointer group">
                          <Link to="/admin/dashboard" className="flex items-center text-red-400 group-hover:text-red-300">
                            <div className="p-1 rounded bg-red-500/10 mr-2">
                              <Lock className="h-3 w-3" />
                            </div>
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator className="bg-gray-800" />
                    
                    <DropdownMenuItem asChild className="hover:bg-gray-800 cursor-pointer">
                      <Link to="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-gray-800 cursor-pointer">
                      <Link to={`/profile/${profile?.username}`}>
                        <User className="mr-2 h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild className="hover:bg-gray-800 cursor-pointer">
                      <Link to="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-gray-800" />
                    
                    <DropdownMenuLabel className="text-xs text-gray-500 font-normal uppercase tracking-wider">Tools</DropdownMenuLabel>
                    <DropdownMenuItem asChild className="hover:bg-gray-800 cursor-pointer">
                      <Link to="/contractor/time-tracker">
                        <Clock className="mr-2 h-4 w-4" /> Time Tracker
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-gray-800 cursor-pointer">
                      <Link to="/contractor/invoices">
                        <FileText className="mr-2 h-4 w-4" /> Invoices
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild className="hover:bg-gray-800 cursor-pointer">
                      <Link to="/dashboard/analytics">
                        <BarChart className="mr-2 h-4 w-4" /> Analytics
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem onClick={signOut} className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Button variant="ghost" asChild className="text-gray-300 hover:text-white hover:bg-white/10">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-white text-black hover:bg-gray-200">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
             {user && <NotificationCenter />}
             <ThemeToggle />
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
              {mobileMenuOpen ? <X /> : <Menu />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-950 border-b border-gray-800 p-4 flex flex-col gap-4 shadow-2xl h-[calc(100vh-70px)] overflow-y-auto z-50">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-lg font-medium ${isActive(link.path) ? 'text-blue-400' : 'text-gray-300'}`}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-gray-800" />
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-red-400 font-semibold bg-red-900/10 p-3 rounded-lg border border-red-900/30">
                  <Lock className="w-4 h-4" /> Admin Panel
                </Link>
              )}

              <div className="flex items-center justify-between py-2 text-gray-300 border-b border-gray-800 mb-2">
                 <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Online Users</span>
                 <span className="bg-green-900 text-green-400 text-xs px-2 py-0.5 rounded-full">{onlineUsers.length} Active</span>
              </div>
              
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-300">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link to={`/profile/${profile?.username}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-300">
                <User className="w-4 h-4" /> Profile
              </Link>
              <Link to="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-300">
                <Settings className="w-4 h-4" /> Settings
              </Link>

              <div className="pl-4 space-y-3 border-l-2 border-gray-800 my-2">
                <Link to="/contractor/time-tracker" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" /> Time Tracker
                </Link>
                <Link to="/contractor/invoices" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-400 text-sm">
                  <FileText className="w-4 h-4" /> Invoices
                </Link>
                 <Link to="/dashboard/analytics" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-400 text-sm">
                  <BarChart className="w-4 h-4" /> Analytics
                </Link>
              </div>

              <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-red-400 text-left">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Button asChild variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-500">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;