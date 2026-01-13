import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const OnlineUsersList = ({ users }) => {
  if (!users?.length) return <div className="p-4 text-sm text-gray-500 text-center">No users online.</div>;

  return (
    <div className="max-h-[300px] overflow-y-auto p-2">
        {users.map((u) => (
            <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors group">
                <div className="relative">
                    <Avatar className="h-8 w-8 border border-gray-700">
                        <AvatarImage src={u.avatar_url} />
                        <AvatarFallback className="bg-gray-800 text-gray-400 uppercase">{u.display_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-gray-900 bg-green-500" />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white truncate">{u.display_name}</span>
                    <span className="text-xs text-gray-500 truncate">@{u.username}</span>
                </div>
            </Link>
        ))}
     </div>
  );
};