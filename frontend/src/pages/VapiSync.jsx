import React from 'react';
import { RefreshCw, Database, ArrowRightLeft, Download, Upload, Shield, AlertCircle, Lock } from 'lucide-react';
import VapiSyncButton from '../components/VapiSyncButton';
import VapiSyncStatus from '../components/VapiSyncStatus';
import { useAuthStore } from '../stores/authStore';

/**
 * Vapi Sync Page
 * Centralized page for managing bidirectional sync between Vapi and application
 * ADMIN ONLY - Normal users cannot manually sync
 */
export default function VapiSync() {
  const { user } = useAuthStore();
  
  // Check if user is admin (you can adjust this logic based on your user model)
  // For now, checking if email is admin@test.com
  const isAdmin = user?.email === 'admin@test.com';
  
  const handleSyncComplete = (result) => {
    console.log('Sync completed:', result);
    // Refresh the page or update state
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vapi Synchronization</h1>
          <p className="mt-2 text-gray-600">
            Keep your application data synchronized with Vapi.ai
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Database className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Bidirectional Sync</span>
        </div>
      </div>

      {/* Admin Only Notice for Non-Admin Users */}
      {!isAdmin && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">🔒 Admin Access Required</h3>
              <p className="text-sm text-amber-800 mb-2">
                Manual Vapi synchronization is restricted to <strong>administrators only</strong>. This prevents accidental data conflicts and ensures system integrity.
              </p>
              <ul className="text-sm text-amber-700 space-y-1 ml-4 list-disc">
                <li><strong>Automatic sync</strong> happens when you create or update agents</li>
                <li><strong>Your agents</strong> are automatically synced to Vapi in real-time</li>
                <li><strong>No manual action</strong> needed for normal operations</li>
                <li><strong>Contact admin</strong> if you need to perform a manual sync</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Safe Mode Banner - Only show for admins */}
      {isAdmin && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">🛡️ Safe Mode Enabled</h3>
              <p className="text-sm text-green-800 mb-2">
                Sync operations are <strong>additive only</strong> - they will <strong>never delete</strong> your agents or phone numbers from either system.
              </p>
              <ul className="text-sm text-green-700 space-y-1 ml-4 list-disc">
                <li><strong>Import</strong> adds new items from Vapi to your database</li>
                <li><strong>Export</strong> creates missing items in Vapi from your database</li>
                <li><strong>Full Sync</strong> ensures both systems have all items</li>
                <li><strong>Never deletes</strong> - your data is always protected</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sync Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Sync Status</h2>
        <VapiSyncStatus autoRefresh={true} />
      </div>

      {/* Quick Actions - Only show for admins */}
      {isAdmin ? (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Sync */}
              <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Full Synchronization</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Sync all phone numbers and assistants in both directions. Recommended for initial setup or after making changes directly in Vapi.
                </p>
                <VapiSyncButton type="full" onSyncComplete={handleSyncComplete} />
              </div>

              {/* Import from Vapi */}
              <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Import from Vapi</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Import phone numbers and assistants from Vapi into the application database.
                </p>
                <div className="space-y-2">
                  <VapiSyncButton 
                    type="phone-numbers-from" 
                    onSyncComplete={handleSyncComplete} 
                  />
                  <VapiSyncButton 
                    type="assistants-from" 
                    onSyncComplete={handleSyncComplete} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Sync Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Sync Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export to Vapi */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Export to Vapi</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Push local changes to Vapi. Use this if you've made changes in the application that need to be reflected in Vapi.
                </p>
                <div className="space-y-2">
                  <VapiSyncButton 
                    type="phone-numbers-to" 
                    onSyncComplete={handleSyncComplete} 
                  />
                  <VapiSyncButton 
                    type="agents-to" 
                    onSyncComplete={handleSyncComplete} 
                  />
                </div>
              </div>

              {/* Sync Information */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRightLeft className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">How Sync Works</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Import:</strong> Brings data from Vapi into the application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Export:</strong> Pushes application data to Vapi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Full Sync:</strong> Performs both import and export</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Automatic:</strong> Agents sync to Vapi automatically on create/update</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Best Practices</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Run a <strong>Full Sync</strong> after making changes directly in Vapi dashboard</li>
              <li>• Use <strong>Import</strong> when you've added phone numbers or assistants in Vapi</li>
              <li>• Agents created in the application automatically sync to Vapi</li>
              <li>• Check sync status regularly to ensure data consistency</li>
              <li>• If you see "Out of Sync", run the appropriate sync action</li>
            </ul>
          </div>
        </>
      ) : (
        /* Non-Admin View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Automatic Sync</h2>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Your agents sync automatically</h3>
              <p className="text-sm text-gray-600 mb-3">
                When you create or update an agent, it's automatically synchronized with Vapi in real-time. 
                No manual action is required.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Create agent → Automatically synced to Vapi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Update agent → Changes synced immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Delete agent → Removed from Vapi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
