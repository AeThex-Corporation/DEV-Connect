import React from 'react';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const AdminHeader = ({ 
  title, 
  subtitle, 
  onSearch, 
  searchPlaceholder = "Search...",
  onExport, 
  primaryAction 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {onSearch && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-9 bg-zinc-900/50 border-zinc-800 text-sm focus:ring-indigo-500/20 transition-all"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onExport && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport} 
              className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          
          {primaryAction && (
            <Button 
              size="sm" 
              onClick={primaryAction.onClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
            >
              {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};