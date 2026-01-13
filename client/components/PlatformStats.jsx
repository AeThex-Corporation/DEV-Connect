import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Briefcase, UserCheck } from 'lucide-react';

const PlatformStats = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-200">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">${stats?.totalRevenue?.toLocaleString() || 0}</div>
          <p className="text-xs text-gray-500">+12% from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-200">Active Users</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats?.totalUsers?.toLocaleString() || 0}</div>
          <p className="text-xs text-gray-500">+5% from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-200">Total Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats?.totalJobs?.toLocaleString() || 0}</div>
          <p className="text-xs text-gray-500">+8% from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-200">Approved Contractors</CardTitle>
          <UserCheck className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats?.activeContractors?.toLocaleString() || 0}</div>
          <p className="text-xs text-gray-500">Vetted professionals</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformStats;