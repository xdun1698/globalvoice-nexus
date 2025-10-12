import { useQuery } from '@tanstack/react-query';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  TrendingUp,
  Users,
  Clock,
  Activity,
  Globe,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalCalls: 1247,
    activeCalls: 8,
    avgDuration: '4:32',
    resolution: 73,
    callsToday: 156,
    callsChange: 12.5,
  };

  const callsData = [
    { name: 'Mon', inbound: 45, outbound: 32 },
    { name: 'Tue', inbound: 52, outbound: 38 },
    { name: 'Wed', inbound: 48, outbound: 42 },
    { name: 'Thu', inbound: 61, outbound: 45 },
    { name: 'Fri', inbound: 55, outbound: 40 },
    { name: 'Sat', inbound: 38, outbound: 28 },
    { name: 'Sun', inbound: 42, outbound: 30 },
  ];

  const languageData = [
    { name: 'English', value: 45 },
    { name: 'Spanish', value: 25 },
    { name: 'French', value: 15 },
    { name: 'German', value: 10 },
    { name: 'Others', value: 5 },
  ];

  const sentimentData = [
    { name: 'Positive', value: 65 },
    { name: 'Neutral', value: 25 },
    { name: 'Negative', value: 10 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your AI agents today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalCalls.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-success-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{stats.callsChange}% from last week
              </p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Phone className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Calls</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.activeCalls}
              </p>
              <p className="mt-1 text-sm text-gray-500">In progress now</p>
            </div>
            <div className="p-3 bg-success-50 rounded-lg">
              <Activity className="h-8 w-8 text-success-600 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.avgDuration}
              </p>
              <p className="mt-1 text-sm text-gray-500">Per call</p>
            </div>
            <div className="p-3 bg-warning-50 rounded-lg">
              <Clock className="h-8 w-8 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.resolution}%
              </p>
              <p className="mt-1 text-sm text-success-600">Above target</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calls Over Time */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Calls This Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={callsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="inbound" fill="#0ea5e9" name="Inbound" />
              <Bar dataKey="outbound" fill="#22c55e" name="Outbound" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Language Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Language Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Calls
          </h3>
          <a href="/calls" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { time: '2 min ago', direction: 'inbound', phone: '+1 (555) 123-4567', language: 'English', duration: '3:45', status: 'completed' },
                { time: '15 min ago', direction: 'outbound', phone: '+34 612 345 678', language: 'Spanish', duration: '5:12', status: 'completed' },
                { time: '32 min ago', direction: 'inbound', phone: '+33 6 12 34 56 78', language: 'French', duration: '2:30', status: 'completed' },
                { time: '1 hour ago', direction: 'outbound', phone: '+49 151 12345678', language: 'German', duration: '4:18', status: 'completed' },
                { time: '2 hours ago', direction: 'inbound', phone: '+86 138 0000 0000', language: 'Chinese', duration: '6:05', status: 'completed' },
              ].map((call, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {call.direction === 'inbound' ? (
                        <PhoneIncoming className="h-4 w-4 text-primary-600 mr-2" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-success-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-900 capitalize">
                        {call.direction}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{call.language}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-success">
                      {call.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
