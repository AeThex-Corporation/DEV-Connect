import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UserCog, 
  Shield, 
  Users, 
  BookOpen, 
  Briefcase, 
  Award,
  Search,
  Crown,
  AlertCircle,
  User
} from "lucide-react";
import { PLATFORM_ROLES, ROLE_DESCRIPTIONS, isAdmin } from "@/components/utils/permissions";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RoleManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (!isAdmin(user)) {
        alert('Access denied: Admin only');
        window.location.href = '/';
        return;
      }

      const users = await base44.entities.User.list();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId, role) => {
    try {
      const user = allUsers.find(u => u.id === userId);
      if (!user) return;

      const currentRoles = user.platform_roles || ['user'];
      let newRoles;

      if (currentRoles.includes(role)) {
        newRoles = currentRoles.filter(r => r !== role);
        if (newRoles.length === 0) newRoles = ['user'];
      } else {
        newRoles = [...currentRoles, role];
      }

      await base44.entities.User.update(userId, {
        platform_roles: newRoles
      });

      await base44.entities.Notification.create({
        user_id: userId,
        type: 'message',
        title: '👑 Role Updated',
        message: `Your platform roles have been updated. You now have: ${newRoles.join(', ')}`,
        link: '/profile'
      });

      await loadData();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Crown className="w-8 h-8 text-yellow-400" />
          Role Management
        </h1>
        <p className="text-gray-400">Manage user roles and permissions</p>
      </div>

      <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/30">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <AlertDescription className="text-yellow-300 text-sm">
          Admins only: Assign granular roles to delegate platform responsibilities without giving full admin access
        </AlertDescription>
      </Alert>

      <Card className="glass-card border-0 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Available Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ROLE_DESCRIPTIONS).map(([roleKey, roleInfo]) => (
              <div key={roleKey} className="glass-card rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{roleInfo.icon}</span>
                  <h3 className="text-white font-semibold text-sm">{roleInfo.name}</h3>
                </div>
                <p className="text-gray-400 text-xs">{roleInfo.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center glass-card rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 text-white placeholder-gray-500 text-sm p-0 h-auto focus:ring-0"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const userRoles = user.platform_roles || (user.role === 'admin' ? ['admin'] : ['user']);
          
          return (
            <Card key={user.id} className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{user.full_name}</h3>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Level {user.level} • {user.xp_points} XP
                      </p>
                    </div>
                  </div>

                  {user.id === currentUser.id && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                      You
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(PLATFORM_ROLES).map(([key, role]) => {
                    const hasThisRole = userRoles.includes(role);
                    const roleInfo = ROLE_DESCRIPTIONS[role];
                    
                    return (
                      <button
                        key={role}
                        onClick={() => toggleUserRole(user.id, role)}
                        disabled={user.id === currentUser.id && role === 'admin'}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          hasThisRole
                            ? `bg-${roleInfo.color}-500/20 border-${roleInfo.color}-500/50 text-${roleInfo.color}-400`
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        } ${user.id === currentUser.id && role === 'admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{roleInfo.icon}</span>
                          <span className="text-xs font-semibold">{roleInfo.name}</span>
                        </div>
                        <p className="text-xs opacity-75 line-clamp-2">{roleInfo.description}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 text-xs">Current roles:</span>
                  {userRoles.map(role => (
                    <Badge 
                      key={role} 
                      className={`bg-${ROLE_DESCRIPTIONS[role]?.color}-500/20 text-${ROLE_DESCRIPTIONS[role]?.color}-400 border-0 text-xs`}
                    >
                      {ROLE_DESCRIPTIONS[role]?.icon} {ROLE_DESCRIPTIONS[role]?.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="glass-card border-0">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
            <p className="text-gray-400">Try a different search term</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}