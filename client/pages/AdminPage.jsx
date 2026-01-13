import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  LogOut, 
  ShieldCheck,
  Menu,
  Gavel,
  Bell,
  Search,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Helmet } from 'react-helmet-async';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminSidebar = ({ mobile = false, onClose }) => {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: ShieldCheck, label: 'Verifications', path: '/admin/verifications' },
    { icon: Briefcase, label: 'Job Moderation', path: '/admin/jobs' },
    { icon: Gavel, label: 'Disputes', path: '/admin/disputes' },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg shadow-indigo-900/20">
             <ShieldCheck className="w-5 h-5" />
          </div>
          <span>Admin<span className="text-indigo-500">Panel</span></span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={mobile ? onClose : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20' 
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
           <p className="text-xs text-zinc-500 mb-2 font-medium">System Status</p>
           <div className="flex items-center gap-2 text-sm text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Operational
           </div>
        </div>
      </div>
    </div>
  );
};

const AdminTopBar = ({ user, signOut }) => {
  return (
    <header className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center flex-1 gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden text-zinc-400">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-zinc-950 border-zinc-800">
             <AdminSidebar mobile onClose={() => {}} />
          </SheetContent>
        </Sheet>

        <div className="relative hidden md:block max-w-md w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
           <Input 
             placeholder="Global search..." 
             className="pl-9 bg-zinc-900 border-zinc-800 text-sm w-full focus:ring-indigo-500/20"
           />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white relative">
           <Bell className="h-5 w-5" />
           <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-zinc-950"></span>
        </Button>

        <div className="h-6 w-px bg-zinc-800 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-2 pr-1 py-1 h-auto rounded-full hover:bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white leading-none">{user?.display_name || 'Admin'}</p>
                  <p className="text-xs text-zinc-500 leading-none mt-1">Administrator</p>
                </div>
                <Avatar className="h-8 w-8 border border-zinc-700">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-indigo-900 text-indigo-300 text-xs">AD</AvatarFallback>
                </Avatar>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer">Profile Settings</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-zinc-900 focus:text-white cursor-pointer">Audit Log</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-950/20 cursor-pointer" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

const AdminPage = () => {
  const { signOut, user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Helmet>
        <title>Admin Console | Devconnect</title>
      </Helmet>
      <div className="flex h-screen bg-black text-zinc-100 font-sans overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <AdminSidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopBar user={user?.user_metadata} signOut={signOut} />
          
          <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
               <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminPage;