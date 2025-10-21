import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { TrendingUp, PhoneIncoming, PhoneOutgoing, Clock, Star, Globe } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#a855f7', '#f97316', '#06b6d4', '#84cc16'];

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(Number(seconds))) return '0:00';
  const s = Math.floor(Number(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default function Analytics() {
  const { startISO, endISO } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { startISO: start.toISOString(), endISO: end.toISOString() };
  }, []);

  const { data: dashboard, isLoading: loadingStats, isError: statsError } = useQuery({
    queryKey: ['analytics-dashboard', startISO, endISO],
    queryFn: async () => {
      const { data } = await api.get('/api/analytics/dashboard', { params: { startDate: startISO, endDate: endISO } });
      return data?.stats || {};
    }
  });

  const { data: languages, isLoading: loadingLang, isError: langError } = useQuery({
    queryKey: ['analytics-languages'],
    queryFn: async () => {
      const { data } = await api.get('/api/analytics/languages');
      return data?.languages || [];
    }
  });

  const langChart = useMemo(() => {
    return (languages || []).map(l => ({
      name: l.detected_language || 'unknown',
      value: Number(l.count) || 0
    }));
  }, [languages]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Last 30 days</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{loadingStats ? '—' : Number(dashboard.total_calls || 0).toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">All calls</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inbound</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{loadingStats ? '—' : Number(dashboard.inbound_calls || 0)}</p>
              <p className="mt-1 text-xs text-gray-500">Received</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <PhoneIncoming className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outbound</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{loadingStats ? '—' : Number(dashboard.outbound_calls || 0)}</p>
              <p className="mt-1 text-xs text-gray-500">Placed</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <PhoneOutgoing className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{loadingStats ? '—' : formatDuration(dashboard.avg_duration)}</p>
              <p className="mt-1 text-xs text-gray-500">Per call</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg CSAT</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{loadingStats ? '—' : (dashboard.avg_csat ? Number(dashboard.avg_csat).toFixed(2) : 'N/A')}</p>
              <p className="mt-1 text-xs text-gray-500">Customer satisfaction</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Language Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Language Distribution</h3>
            <Globe className="h-5 w-5 text-gray-500" />
          </div>
          <div className="w-full h-64">
            {loadingLang ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
            ) : langError ? (
              <div className="text-red-600 text-sm">Failed to load languages</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={langChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {langChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {(statsError || langError) && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          There was an error loading analytics. Please try again.
        </div>
      )}
    </div>
  );
}
