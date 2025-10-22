import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { 
  TrendingUp, PhoneIncoming, PhoneOutgoing, Clock, Star, Globe, 
  AlertCircle, Users, Target, DollarSign, BarChart3, TrendingDown,
  CheckCircle, XCircle, Phone
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#a855f7', '#f97316', '#06b6d4', '#84cc16'];

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(Number(seconds))) return '0:00';
  const s = Math.floor(Number(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function Analytics() {
  // Mock data for comprehensive analytics (aligned with Dashboard stats)
  const mockStats = {
    total_calls: 1247,
    inbound_calls: 734,
    outbound_calls: 513,
    avg_duration: 272, // 4:32 in seconds
    avg_csat: 4.3,
    total_minutes: 5656,
    successful_calls: 1089,
    failed_calls: 158,
    conversion_rate: 28.5,
    revenue_generated: 45280
  };

  // 30-day trend data
  const callTrendData = [
    { date: 'Week 1', inbound: 178, outbound: 124, total: 302 },
    { date: 'Week 2', inbound: 185, outbound: 132, total: 317 },
    { date: 'Week 3', inbound: 192, outbound: 128, total: 320 },
    { date: 'Week 4', inbound: 179, outbound: 129, total: 308 }
  ];

  // Agent performance data
  const agentPerformanceData = [
    { name: 'Will - Collections', calls: 456, avgDuration: '5:12', successRate: 87, revenue: 18500 },
    { name: 'Customer Support', calls: 512, avgDuration: '4:05', successRate: 92, revenue: 15200 },
    { name: 'Sales Agent', calls: 279, avgDuration: '4:48', successRate: 73, revenue: 11580 }
  ];

  // Call outcome distribution
  const outcomeData = [
    { name: 'Successful', value: 1089, percentage: 87.3 },
    { name: 'No Answer', value: 89, percentage: 7.1 },
    { name: 'Busy', value: 42, percentage: 3.4 },
    { name: 'Failed', value: 27, percentage: 2.2 }
  ];

  // Language distribution (aligned with Dashboard)
  const languageData = [
    { name: 'English', value: 561, percentage: 45 },
    { name: 'Spanish', value: 312, percentage: 25 },
    { name: 'French', value: 187, percentage: 15 },
    { name: 'German', value: 125, percentage: 10 },
    { name: 'Others', value: 62, percentage: 5 }
  ];

  // Peak hours data
  const peakHoursData = [
    { hour: '8AM', calls: 45 },
    { hour: '9AM', calls: 78 },
    { hour: '10AM', calls: 95 },
    { hour: '11AM', calls: 112 },
    { hour: '12PM', calls: 98 },
    { hour: '1PM', calls: 87 },
    { hour: '2PM', calls: 105 },
    { hour: '3PM', calls: 118 },
    { hour: '4PM', calls: 92 },
    { hour: '5PM', calls: 68 }
  ];

  // Customer satisfaction trend
  const csatTrendData = [
    { week: 'Week 1', score: 4.1 },
    { week: 'Week 2', score: 4.2 },
    { week: 'Week 3', score: 4.4 },
    { week: 'Week 4', score: 4.3 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">Detailed performance insights (Mock data)</p>
        </div>
        <p className="text-sm text-gray-500">Last 30 days</p>
      </div>

      {/* Mock Data Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">Mock Data</h3>
            <p className="text-sm text-blue-700 mt-1">
              The analytics shown below are sample data for demonstration. Real analytics will appear once your agents start handling calls.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{mockStats.total_calls.toLocaleString()}</p>
              <p className="mt-1 text-xs text-success-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12.5% from last month
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
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{((mockStats.successful_calls / mockStats.total_calls) * 100).toFixed(1)}%</p>
              <p className="mt-1 text-xs text-gray-500">{mockStats.successful_calls} successful</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg CSAT Score</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{mockStats.avg_csat.toFixed(1)}</p>
              <p className="mt-1 text-xs text-success-600">Excellent rating</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Generated</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${(mockStats.revenue_generated / 1000).toFixed(1)}k</p>
              <p className="mt-1 text-xs text-gray-500">From collections</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Call Trends Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Volume Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={callTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="inbound" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" name="Inbound" />
            <Area type="monotone" dataKey="outbound" stackId="1" stroke="#22c55e" fill="#22c55e" name="Outbound" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Call Outcomes */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Outcomes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outcomeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {outcomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Language Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={languageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" name="Calls" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peak Hours Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Call Hours</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={peakHoursData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="calls" stroke="#8b5cf6" strokeWidth={2} name="Call Volume" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Agent Performance Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agentPerformanceData.map((agent, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {agent.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.calls}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.avgDuration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${agent.successRate >= 85 ? 'badge-success' : 'badge-warning'}`}>
                      {agent.successRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ${agent.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSAT Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={csatTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} name="CSAT Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
