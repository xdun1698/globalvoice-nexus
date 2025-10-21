import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Vapi Sync Status Component
 * Shows current sync status between Vapi and application database
 */
export default function VapiSyncStatus({ autoRefresh = false }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/vapi-sync/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sync status:', err);
      setError(err.response?.data?.message || 'Failed to fetch sync status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
        <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
        <span className="text-sm text-gray-600">Loading sync status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <span className="text-sm text-red-700">{error}</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const isFullySync = status.overallSync;

  return (
    <div className="space-y-3">
      {/* Overall Status */}
      <div className={`
        flex items-center gap-3 p-4 rounded-lg border-2
        ${isFullySync 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
        }
      `}>
        {isFullySync ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
        )}
        <div className="flex-1">
          <h3 className={`font-semibold ${isFullySync ? 'text-green-900' : 'text-yellow-900'}`}>
            {isFullySync ? 'Fully Synchronized' : 'Sync Required'}
          </h3>
          <p className={`text-sm ${isFullySync ? 'text-green-700' : 'text-yellow-700'}`}>
            {isFullySync 
              ? 'All data is synchronized with Vapi' 
              : 'Some data is out of sync with Vapi'
            }
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Detailed Status */}
      <div className="grid grid-cols-2 gap-3">
        {/* Phone Numbers Status */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Phone Numbers</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="font-medium">{status.phoneNumbers.database}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vapi:</span>
              <span className="font-medium">{status.phoneNumbers.vapi}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t">
              <span className="text-gray-600">Status:</span>
              {status.phoneNumbers.inSync ? (
                <span className="text-green-600 font-medium">✓ In Sync</span>
              ) : (
                <span className="text-yellow-600 font-medium">⚠ Out of Sync</span>
              )}
            </div>
          </div>
        </div>

        {/* Agents/Assistants Status */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Agents/Assistants</h4>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="font-medium">{status.agents.database}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vapi:</span>
              <span className="font-medium">{status.agents.vapi}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t">
              <span className="text-gray-600">Status:</span>
              {status.agents.inSync ? (
                <span className="text-green-600 font-medium">✓ In Sync</span>
              ) : (
                <span className="text-yellow-600 font-medium">⚠ Out of Sync</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center">
        Last checked: {new Date(status.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
