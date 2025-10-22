import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bot, Edit, Trash2, Power, CheckCircle, RefreshCw, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';
import VapiSyncButton from '../components/VapiSyncButton';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [makingCall, setMakingCall] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await api.get('/api/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await api.delete(`/api/agents/${id}`);
      toast.success('Agent deleted');
      loadAgents();
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  const makeCall = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (!selectedAgent) {
      toast.error('No agent selected');
      return;
    }

    try {
      setMakingCall(true);
      const response = await api.post('/api/vapi/call/outbound', {
        phoneNumber: phoneNumber.trim(),
        agentId: selectedAgent.id
      });

      toast.success(`Call initiated successfully! Call ID: ${response.data.callId}`);
      setShowCallModal(false);
      setPhoneNumber('');
      setSelectedAgent(null);
    } catch (error) {
      console.error('Call failed:', error);
      const errorMessage = error.response?.data?.error || 'Failed to initiate call';
      toast.error(errorMessage);
    } finally {
      setMakingCall(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
          <p className="mt-2 text-gray-600">Manage your AI call agents - automatically synced with Vapi</p>
        </div>
        <div className="flex gap-3">
          <Link to="/vapi-sync" className="btn btn-secondary flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Sync with Vapi
          </Link>
          <Link to="/agents/new" className="btn btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create Agent
          </Link>
        </div>
      </div>

      {/* Vapi Integration Info */}
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-start">
          <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Automatic Vapi Sync</h3>
            <p className="text-sm text-gray-600 mb-3">
              Agents created here automatically sync to Vapi as assistants. You can also import existing assistants from Vapi.
            </p>
            <VapiSyncButton 
              type="assistants-from" 
              onSyncComplete={() => loadAgents()}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 card">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents yet</h3>
          <p className="text-gray-600 mb-6">Create your first AI agent to start handling calls</p>
          <Link to="/agents/new" className="btn btn-primary inline-flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map(agent => (
            <div key={agent.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Bot className="h-8 w-8 text-primary-600" />
                </div>
                <span className={`badge ${agent.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                  {agent.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Language: {agent.language}</p>
              <p className="text-sm text-gray-600 mb-2">Voice: {agent.voice}</p>
              {agent.vapi_assistant_id && (
                <p className="text-xs text-green-600 mb-2 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Synced with Vapi
                </p>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-600">Active</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedAgent(agent);
                      setShowCallModal(true);
                    }}
                    className="text-green-600 hover:text-green-700"
                    title="Make outbound call"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                  <Link to={`/agents/${agent.id}/edit`} className="text-primary-600 hover:text-primary-700">
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button 
                    onClick={() => deleteAgent(agent.id)}
                    className="text-danger-600 hover:text-danger-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Make Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Make Outbound Call</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Agent: <span className="font-medium text-gray-900">{selectedAgent?.name}</span>
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="input"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the phone number to call (include country code)
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowCallModal(false);
                  setSelectedAgent(null);
                  setPhoneNumber('');
                }} 
                className="btn btn-secondary flex-1"
                disabled={makingCall}
              >
                Cancel
              </button>
              <button 
                onClick={makeCall} 
                disabled={makingCall}
                className="btn btn-primary flex-1 flex items-center justify-center"
              >
                {makingCall ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
