import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Shield, Ban, Mail, User, Calendar, MapPin, Globe, Save } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdminHeader } from '@/components/admin/AdminHeader';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { exportToCSV, logAdminAction } from '@/lib/admin_utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Role management state
  const [selectedRole, setSelectedRole] = useState('user');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const { toast } = useToast();

  const fetchUsers = async () => {
      setLoading(true);
      let query = supabase.from('profiles').select('*, user_roles(role)').order('created_at', { ascending: false });
      if (searchQuery) query = query.or(`username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
      const { data, error } = await query.limit(50);
      
      if (error) {
          toast({ variant: "destructive", title: "Error fetching users", description: error.message });
      } else {
          setUsers(data || []);
      }
      setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchUsers, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSelectAll = (checked) => {
      if (checked) {
          setSelectedUsers(users.map(u => u.id));
      } else {
          setSelectedUsers([]);
      }
  };

  const handleSelectUser = (userId, checked) => {
      if (checked) {
          setSelectedUsers(prev => [...prev, userId]);
      } else {
          setSelectedUsers(prev => prev.filter(id => id !== userId));
      }
  };

  const handleViewDetails = (user) => {
      setSelectedUserForDetails(user);
      // Determine current primary role
      const roles = user.user_roles?.map(r => r.role) || [];
      if (roles.includes('site_owner')) setSelectedRole('site_owner');
      else if (roles.includes('admin')) setSelectedRole('admin');
      else if (roles.includes('moderator')) setSelectedRole('moderator');
      else setSelectedRole('user');
      
      setIsDetailsOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUserForDetails) return;
    setIsUpdatingRole(true);
    
    try {
      const userId = selectedUserForDetails.id;
      
      // 1. Remove existing roles (simplified approach: clear and set)
      // In a real app you might want to merge permissions, but here we treat role as a level
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // 2. Insert new role if not 'user' (assuming 'user' is default/empty)
      if (selectedRole !== 'user') {
         const { error } = await supabase.from('user_roles').insert({
           user_id: userId,
           role: selectedRole
         });
         if (error) throw error;
      }
      
      // Log action
      await logAdminAction('update_role', 'user', userId, { new_role: selectedRole });

      toast({ title: "Role Updated", description: `User role changed to ${selectedRole}.` });
      
      // Refresh local data
      fetchUsers();
      setIsDetailsOpen(false);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminHeader 
        title="User Management" 
        subtitle="Manage user accounts, roles, and permissions"
        onSearch={setSearchQuery} 
        onExport={() => exportToCSV(users, 'users.csv')} 
      />

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/80">
            <TableRow className="border-zinc-800 hover:bg-zinc-900/80">
              <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={users.length > 0 && selectedUsers.length === users.length}
                    onCheckedChange={handleSelectAll}
                  />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={6} className="h-24 text-center text-zinc-500">Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="h-24 text-center text-zinc-500">No users found</TableCell></TableRow>
            ) : users.map((user) => (
                <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                  <TableCell>
                      <Checkbox 
                        checked={selectedUsers.includes(user.id)} 
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked)} 
                      />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-800">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-200">{user.display_name || 'Unknown'}</span>
                        <span className="text-xs text-zinc-500">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.user_roles?.length > 0 ? user.user_roles.map((r, i) => (
                          <Badge key={i} variant="outline" className="border-indigo-900 text-indigo-400 bg-indigo-900/10">{r.role}</Badge>
                      )) : <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">User</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.onboarding_complete ? "bg-green-900/20 text-green-400 border-green-900/50" : "bg-yellow-900/20 text-yellow-400 border-yellow-900/50"}>
                      {user.onboarding_complete ? 'Active' : 'Onboarding'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800"><MoreHorizontal className="h-4 w-4 text-zinc-400" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)} className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900">
                            <User className="w-4 h-4 mr-2"/> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-zinc-900 focus:bg-zinc-900">
                            <Mail className="w-4 h-4 mr-2"/> Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:text-red-400 cursor-pointer hover:bg-red-950/20 focus:bg-red-950/20">
                            <Ban className="w-4 h-4 mr-2"/> Ban User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <BulkActionBar 
        selectedCount={selectedUsers.length} 
        entityName="users" 
        onClear={() => setSelectedUsers([])}
        onDelete={() => {
            toast({ title: "Bulk Action", description: `Deleting ${selectedUsers.length} users (Mock Action)` });
            setSelectedUsers([]);
        }} 
      />

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="bg-zinc-950 border-l border-zinc-800 text-zinc-100 sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-zinc-100">User Profile</SheetTitle>
            <SheetDescription className="text-zinc-500">Detailed view of user information and activity.</SheetDescription>
          </SheetHeader>
          
          {selectedUserForDetails && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-zinc-800">
                <Avatar className="h-24 w-24 border-2 border-zinc-800 mb-4">
                  <AvatarImage src={selectedUserForDetails.avatar_url} />
                  <AvatarFallback className="text-2xl bg-zinc-900">{selectedUserForDetails.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-white">{selectedUserForDetails.display_name}</h3>
                <p className="text-zinc-400 text-sm">@{selectedUserForDetails.username}</p>
                <div className="flex gap-2 mt-3">
                   <Badge variant="secondary" className="bg-zinc-900 text-zinc-400">{selectedUserForDetails.account_type || 'Individual'}</Badge>
                   {selectedUserForDetails.onboarding_complete && <Badge className="bg-green-900/20 text-green-400 border-green-900/50">Verified</Badge>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Role Management</h4>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500">Current Role Assignment</label>
                        <div className="flex gap-2">
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                              <SelectTrigger className="w-full bg-zinc-900 border-zinc-700">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                <SelectGroup>
                                  <SelectLabel>System Roles</SelectLabel>
                                  <SelectItem value="user">User (Default)</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="admin">Administrator</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <Button 
                                size="icon" 
                                className="shrink-0 bg-indigo-600 hover:bg-indigo-500"
                                onClick={handleUpdateRole}
                                disabled={isUpdatingRole}
                            >
                                <Save className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-zinc-500 pt-1">
                            Changing this will update the user's permissions immediately.
                        </p>
                    </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Contact & Info</h4>
                
                <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                        <Mail className="w-4 h-4 text-zinc-500" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-zinc-500">Email Address</p>
                            <p className="text-sm text-zinc-200 truncate" title={selectedUserForDetails.email}>{selectedUserForDetails.email}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        <div>
                            <p className="text-xs text-zinc-500">Joined Date</p>
                            <p className="text-sm text-zinc-200">{new Date(selectedUserForDetails.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <div>
                            <p className="text-xs text-zinc-500">Location</p>
                            <p className="text-sm text-zinc-200">{selectedUserForDetails.location || 'Not specified'}</p>
                        </div>
                    </div>

                    {selectedUserForDetails.website_url && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <Globe className="w-4 h-4 text-zinc-500" />
                            <div>
                                <p className="text-xs text-zinc-500">Website</p>
                                <a href={selectedUserForDetails.website_url} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:underline">{selectedUserForDetails.website_url}</a>
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {selectedUserForDetails.bio && (
                  <div className="space-y-2">
                      <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Bio</h4>
                      <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-sm text-zinc-300 leading-relaxed">
                          {selectedUserForDetails.bio}
                      </div>
                  </div>
              )}
              
              <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Metadata</h4>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-zinc-900 rounded text-xs">
                          <span className="text-zinc-500 block">ID</span>
                          <span className="font-mono text-zinc-300 truncate block" title={selectedUserForDetails.id}>{selectedUserForDetails.id}</span>
                      </div>
                      <div className="p-2 bg-zinc-900 rounded text-xs">
                          <span className="text-zinc-500 block">Status</span>
                          <span className="text-zinc-300">{selectedUserForDetails.verification_status || 'unverified'}</span>
                      </div>
                   </div>
              </div>
            </div>
          )}
          <SheetFooter className="mt-8">
              {selectedUserForDetails && (
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={() => {
                        toast({ title: "Action", description: "Ban user functionality would go here." });
                        setIsDetailsOpen(false);
                    }}
                  >
                      Ban User
                  </Button>
              )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UserManagement;