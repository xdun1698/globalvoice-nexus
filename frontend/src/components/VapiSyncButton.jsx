import React, { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Vapi Sync Button Component
 * Provides UI for syncing data between Vapi and application database
 */
export default function VapiSyncButton({ type = 'full', onSyncComplete }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const syncLabels = {
    full: 'Full Sync',
    'phone-numbers-from': 'Import Phone Numbers',
    'phone-numbers-to': 'Export Phone Numbers',
    'assistants-from': 'Import Assistants',
    'agents-to': 'Export Agents'
  };

  const syncEndpoints = {
    full: '/api/vapi-sync/full',
    'phone-numbers-from': '/api/vapi-sync/phone-numbers/from-vapi',
    'phone-numbers-to': '/api/vapi-sync/phone-numbers/to-vapi',
    'assistants-from': '/api/vapi-sync/assistants/from-vapi',
    'agents-to': '/api/vapi-sync/agents/to-vapi'
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}${syncEndpoints[type]}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setResult(response.data);
      
      // Call parent callback if provided
      if (onSyncComplete) {
        onSyncComplete(response.data);
      }
    } catch (err) {
      console.error('Sync error:', err);
      setError(err.response?.data?.message || err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={syncing}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${syncing 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        <RefreshCw 
          className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} 
        />
        {syncing ? 'Syncing...' : syncLabels[type]}
      </button>

      {/* Success Result */}
      {result && result.success && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-green-900">{result.message}</p>
            {type === 'full' && result.results && (
              <div className="mt-2 space-y-1 text-green-700">
                <p>Phone Numbers: {result.results.phoneNumbers?.fromVapi?.imported || 0} imported, {result.results.phoneNumbers?.fromVapi?.updated || 0} updated</p>
                <p>Assistants: {result.results.assistants?.fromVapi?.imported || 0} imported, {result.results.assistants?.fromVapi?.updated || 0} updated</p>
              </div>
            )}
            {type === 'phone-numbers-from' && result.results && (
              <p className="mt-1 text-green-700">
                {result.results.imported} imported, {result.results.updated} updated
              </p>
            )}
            {type === 'assistants-from' && result.results && (
              <p className="mt-1 text-green-700">
                {result.results.imported} imported, {result.results.updated} updated
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Result */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-red-900">Sync Failed</p>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Partial Success with Errors */}
      {result && !result.success && result.results?.errors?.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-yellow-900">Sync Completed with Errors</p>
            <p className="mt-1 text-yellow-700">{result.results.errors.length} errors occurred</p>
          </div>
        </div>
      )}
    </div>
  );
}
