import { useState, useEffect } from 'react';
import { Phone, Plus, Edit, Trash2, Link as LinkIcon, ExternalLink, CheckCircle, XCircle, RefreshCw, Download, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';
import VapiSyncButton from '../components/VapiSyncButton';
import VapiSyncStatus from '../components/VapiSyncStatus';

export default function PhoneNumbers() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [newPhone, setNewPhone] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const [vapiAssistants, setVapiAssistants] = useState([]);
  const [showOnlyVapi, setShowOnlyVapi] = useState(true); // Default to showing only Vapi numbers

  useEffect(() => {
    loadData();
    autoSyncFromVapi();
  }, []);

  const loadData = async () => {
    try {
      const [phonesRes, agentsRes] = await Promise.all([
        api.get('/api/phone-numbers'),
        api.get('/api/agents')
      ]);
      console.log('📞 Phone numbers loaded:', phonesRes.data.phoneNumbers);
      console.log('📊 Total numbers:', phonesRes.data.phoneNumbers.length);
      console.log('✅ Vapi numbers:', phonesRes.data.phoneNumbers.filter(p => p.vapi_phone_id).length);
      console.log('❌ Legacy numbers:', phonesRes.data.phoneNumbers.filter(p => !p.vapi_phone_id).length);
      
      setPhoneNumbers(phonesRes.data.phoneNumbers || []);
      setAgents(agentsRes.data.agents || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const autoSyncFromVapi = async () => {
    try {
      setSyncing(true);
      // Sync phone numbers from Vapi
      const syncRes = await api.post('/api/vapi-sync/phone-numbers/from-vapi');
      
      if (syncRes.data.results) {
        const { imported, updated, errors } = syncRes.data.results;
        
        // Show errors if any
        if (errors && errors.length > 0) {
          console.error('Sync errors:', errors);
          toast.error(`Sync completed with ${errors.length} error(s). Check console for details.`);
        }
        
        // Show success if numbers were imported/updated
        if (imported > 0 || updated > 0) {
          toast.success(`Synced ${imported + updated} phone numbers from Vapi`);
          loadData();
        } else if (!errors || errors.length === 0) {
          // Only show "no changes" if there were no errors
          toast.info('Phone numbers are already up to date');
        }
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
      toast.error(error.response?.data?.message || 'Failed to sync from Vapi. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  const addPhoneNumber = async () => {
    if (!newPhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      await api.post('/api/phone-numbers', { number: newPhone });
      toast.success('Phone number added successfully');
      setShowAddModal(false);
      setNewPhone('');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add phone number');
    }
  };

  const assignToAgent = async () => {
    if (!selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }

    try {
      await api.post(`/api/agents/${selectedAgentId}/phone-number`, {
        phoneNumber: selectedPhone.number
      });
      toast.success('Phone number assigned to agent');
      setShowAssignModal(false);
      setSelectedPhone(null);
      setSelectedAgentId('');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign phone number');
    }
  };

  const unassignPhone = async (phoneId) => {
    if (!confirm('Unassign this phone number from the agent?')) return;

    try {
      await api.delete(`/api/phone-numbers/${phoneId}/agent`);
      toast.success('Phone number unassigned');
      loadData();
    } catch (error) {
      toast.error('Failed to unassign phone number');
    }
  };

  const deletePhone = async (phoneId) => {
    if (!confirm('Are you sure you want to delete this phone number?')) return;

    try {
      await api.delete(`/api/phone-numbers/${phoneId}`);
      toast.success('Phone number deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete phone number');
    }
  };

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unknown Agent';
  };

  const getVapiAssistantName = (vapiAssistantId) => {
    if (!vapiAssistantId) return null;
    const agent = agents.find(a => a.vapi_assistant_id === vapiAssistantId);
    return agent ? agent.name : `Vapi Assistant (${vapiAssistantId.substring(0, 8)}...)`;
  };

  const getFilteredNumbers = () => {
    const filtered = showOnlyVapi 
      ? phoneNumbers.filter(p => p.vapi_phone_id) 
      : phoneNumbers;
    
    console.log(`🔍 Filter mode: ${showOnlyVapi ? 'Vapi Only' : 'All Numbers'}`);
    console.log(`📋 Filtered result: ${filtered.length} numbers`);
    
    return filtered;
  };

  const getAvailableNumbers = () => {
    return getFilteredNumbers().filter(p => !p.agent_id);
  };

  const getAssignedNumbers = () => {
    return getFilteredNumbers().filter(p => p.agent_id);
  };

  const getNonVapiNumbers = () => {
    return phoneNumbers.filter(p => !p.vapi_phone_id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phone Numbers</h1>
          <p className="mt-2 text-gray-600">
            Manage phone numbers from Vapi and assign them to agents
            {syncing && <span className="ml-2 text-blue-600 inline-flex items-center"><Loader2 className="h-4 w-4 mr-1 animate-spin" />Syncing...</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowOnlyVapi(!showOnlyVapi)} 
            className={`btn ${showOnlyVapi ? 'btn-primary' : 'btn-secondary'} flex items-center`}
            title={showOnlyVapi ? 'Showing only Vapi numbers' : 'Showing all numbers'}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {showOnlyVapi ? 'Vapi Only' : 'All Numbers'}
          </button>
          <button 
            onClick={() => setShowSyncStatus(!showSyncStatus)} 
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Sync Status
          </button>
          <button 
            onClick={autoSyncFromVapi} 
            disabled={syncing}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Refresh from Vapi
          </button>
        </div>
      </div>

      {/* Legacy Numbers Warning */}
      {!showOnlyVapi && getNonVapiNumbers().length > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start flex-1">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Legacy Numbers Detected</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Found {getNonVapiNumbers().length} phone number(s) not synced with Vapi. 
                  These may be duplicates or legacy entries. Consider removing them to avoid confusion.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Status Section */}
      {showSyncStatus && (
        <div className="card">
          <VapiSyncStatus autoRefresh={false} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Available Numbers</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{getAvailableNumbers().length}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Assigned Numbers</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{getAssignedNumbers().length}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <LinkIcon className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                {showOnlyVapi ? 'Vapi Numbers' : 'Total Numbers'}
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{getFilteredNumbers().length}</p>
              {!showOnlyVapi && phoneNumbers.length !== getFilteredNumbers().length && (
                <p className="text-xs text-purple-600 mt-1">
                  ({phoneNumbers.length} total including legacy)
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Phone className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Vapi Integration Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            <Phone className="h-6 w-6 text-blue-600 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Vapi Phone Numbers</h3>
              <p className="text-sm text-gray-600 mb-3">
                {showOnlyVapi 
                  ? 'Showing only phone numbers synced from Vapi. Use the "All Numbers" filter to see legacy numbers.'
                  : 'Phone numbers automatically sync from Vapi on page load. Each number can be assigned to one agent.'
                }
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://vapi.ai/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Manage in Vapi Dashboard
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Numbers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading phone numbers...</p>
        </div>
      ) : getFilteredNumbers().length === 0 ? (
        <div className="text-center py-12 card">
          <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {showOnlyVapi ? 'No Vapi phone numbers yet' : 'No phone numbers yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {showOnlyVapi 
              ? 'Click "Refresh from Vapi" to import phone numbers from your Vapi dashboard'
              : 'Import phone numbers from Vapi to get started'
            }
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={autoSyncFromVapi}
              disabled={syncing}
              className="btn btn-primary inline-flex items-center"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Refresh from Vapi
            </button>
            {!showOnlyVapi && phoneNumbers.length > 0 && (
              <button 
                onClick={() => setShowOnlyVapi(true)} 
                className="btn btn-secondary inline-flex items-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Show Vapi Only
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getFilteredNumbers().map(phone => (
            <div key={phone.id} className={`card hover:shadow-lg transition-shadow ${!phone.vapi_phone_id ? 'border-yellow-200 bg-yellow-50' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Phone className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {phone.agent_id ? (
                    <span className="badge badge-success flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Assigned
                    </span>
                  ) : (
                    <span className="badge badge-warning flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      Unassigned
                    </span>
                  )}
                  {!showOnlyVapi && !phone.vapi_phone_id && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      Legacy
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{phone.number}</h3>
              
              {phone.agent_id && (
                <div className="mb-3 p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Assigned to:</p>
                  <p className="text-sm font-medium text-gray-900">{getAgentName(phone.agent_id)}</p>
                </div>
              )}

              {phone.vapi_assistant_id && !phone.agent_id && (
                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Vapi Assignment</p>
                  <p className="text-sm text-gray-900">{getVapiAssistantName(phone.vapi_assistant_id)}</p>
                </div>
              )}

              <div className="text-sm text-gray-600 mb-4">
                <p>Country: {phone.country_code || 'N/A'}</p>
                {phone.vapi_phone_id && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Synced with Vapi
                  </p>
                )}
                {phone.vapi_assistant_id && (
                  <p className="text-xs text-purple-600 mt-1 flex items-center">
                    <LinkIcon className="h-3 w-3 mr-1" />
                    Linked to Vapi Assistant
                  </p>
                )}
                {phone.twilio_sid && (
                  <p className="text-xs text-gray-500 mt-1 truncate">Twilio SID: {phone.twilio_sid}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t gap-2">
                {phone.agent_id ? (
                  <button
                    onClick={() => unassignPhone(phone.id)}
                    className="text-sm text-warning-600 hover:text-warning-700 font-medium"
                  >
                    Unassign
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPhone(phone);
                      setShowAssignModal(true);
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Assign to Agent
                  </button>
                )}
                <button
                  onClick={() => deletePhone(phone.id)}
                  className="text-danger-600 hover:text-danger-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Phone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Phone Number</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1234567890"
                className="input"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the phone number from Vapi (include country code, e.g., +16826269224)
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={addPhoneNumber} className="btn btn-primary flex-1">
                Add Number
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign to Agent Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assign to Agent</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Phone: <span className="font-medium text-gray-900">{selectedPhone?.number}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent *
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="input"
              >
                <option value="">Choose an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => {
                setShowAssignModal(false);
                setSelectedPhone(null);
                setSelectedAgentId('');
              }} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={assignToAgent} className="btn btn-primary flex-1">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
