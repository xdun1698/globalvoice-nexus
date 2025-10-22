import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Bot, Phone, Mic, Play, CheckCircle, Lock, 
  AlertCircle, Trash2, Plus, X 
} from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

// Locked Bill Collection Template
const BILL_COLLECTION_TEMPLATE = {
  personality: 'Professional, firm but respectful, empathetic yet persistent. Maintains composure and follows FDCPA compliance guidelines. Focuses on finding solutions and payment arrangements.',
  greeting: 'Hey there! This is {AGENT_NAME} calling from the collections department. Hope I caught you at a good time. I\'m reaching out about your account balance, and I\'d like to work with you to get this resolved today. Do you have a few minutes to talk about some payment options?',
  system_prompt: `## COLLECTIONS STRATEGY - FOLLOW THIS EXACTLY

### PRIMARY GOAL: Collect Payment Today
Your #1 objective is to collect money TODAY. Use this negotiation hierarchy:

**PRIORITY 1: Full Payment (Best Outcome)**
- Start by asking for full payment
- "I see your balance is $[AMOUNT]. Can we get this taken care of in full today?"

**PRIORITY 2: Payment Plan with 25% Down (Good Outcome)**
- Offer payment plan requiring 1/4 down payment TODAY
- "I can break this into 4 payments of $[AMOUNT/4] each. Can you handle the first payment today?"

**PRIORITY 3: Smaller Down Payment (Acceptable Outcome)**
- Negotiate any amount today
- "What amount could you handle today to show good faith?"

**PRIORITY 4: Schedule Future Payment (Last Resort)**
- Only if no payment possible today
- Get specific date and amount

### CONVERSATION TECHNIQUES
- Build rapport: "I understand times are tough"
- Create urgency: "Getting this resolved today prevents additional fees"
- Handle objections: "What amount COULD you handle today?"
- Stay professional and empathetic
- Never threaten or be rude
- Document everything`,
  language: 'en-US',
  type: 'bill_collection'
};

export default function AgentsSimplified() {
  const { user } = useAuthStore();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voices, setVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // Form states
  const [agentName, setAgentName] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testingCall, setTestingCall] = useState(false);

  useEffect(() => {
    loadAgents();
    loadVoices();
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

  const loadVoices = async () => {
    setLoadingVoices(true);
    try {
      const response = await api.get('/api/agents/voices/elevenlabs');
      setVoices(response.data.voices || []);
    } catch (error) {
      console.error('Failed to load voices:', error);
      // Fallback voices if API fails
      setVoices([
        { voice_id: 'antoni', name: 'Antoni (Professional Male)' },
        { voice_id: 'rachel', name: 'Rachel (Professional Female)' },
        { voice_id: 'josh', name: 'Josh (Confident Male)' },
        { voice_id: 'bella', name: 'Bella (Friendly Female)' },
      ]);
    } finally {
      setLoadingVoices(false);
    }
  };

  const openCreateModal = () => {
    setAgentName('');
    setSelectedVoice('antoni');
    setShowCreateModal(true);
  };

  const openEditModal = (agent) => {
    setSelectedAgent(agent);
    setAgentName(agent.name);
    setSelectedVoice(agent.elevenlabs_voice || agent.voice);
    setShowEditModal(true);
  };

  const openTestModal = (agent) => {
    setSelectedAgent(agent);
    setTestPhone('');
    setShowTestModal(true);
  };

  const createAgent = async () => {
    if (!agentName.trim()) {
      toast.error('Please enter an agent name');
      return;
    }

    try {
      const agentData = {
        name: agentName,
        voice: selectedVoice,
        elevenlabs_voice: selectedVoice,
        ...BILL_COLLECTION_TEMPLATE,
        greeting: BILL_COLLECTION_TEMPLATE.greeting.replace('{AGENT_NAME}', agentName.split(' ')[0])
      };

      await api.post('/api/agents', agentData);
      toast.success('Agent created and synced to Vapi!');
      setShowCreateModal(false);
      loadAgents();
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast.error('Failed to create agent');
    }
  };

  const updateAgent = async () => {
    if (!agentName.trim()) {
      toast.error('Please enter an agent name');
      return;
    }

    try {
      const agentData = {
        name: agentName,
        voice: selectedVoice,
        elevenlabs_voice: selectedVoice,
        ...BILL_COLLECTION_TEMPLATE,
        greeting: BILL_COLLECTION_TEMPLATE.greeting.replace('{AGENT_NAME}', agentName.split(' ')[0])
      };

      await api.put(`/api/agents/${selectedAgent.id}`, agentData);
      toast.success('Agent updated and synced to Vapi!');
      setShowEditModal(false);
      loadAgents();
    } catch (error) {
      console.error('Failed to update agent:', error);
      toast.error('Failed to update agent');
    }
  };

  const makeTestCall = async () => {
    if (!testPhone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(testPhone.replace(/[\s()-]/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setTestingCall(true);
    try {
      await api.post(`/api/agents/${selectedAgent.id}/test-call`, {
        phoneNumber: testPhone
      });
      toast.success('Test call initiated! You should receive a call shortly.');
      setShowTestModal(false);
    } catch (error) {
      console.error('Failed to make test call:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate test call');
    } finally {
      setTestingCall(false);
    }
  };

  const deleteAgent = async (id) => {
    if (!confirm('Are you sure you want to delete this agent? This will also remove it from Vapi.')) return;
    
    try {
      await api.delete(`/api/agents/${id}`);
      toast.success('Agent deleted');
      loadAgents();
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };

  const playVoicePreview = (voiceId) => {
    // This would play a sample of the voice
    toast.info(`Playing preview for ${voiceId}...`);
    // TODO: Implement actual voice preview
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bill Collection Agents</h1>
          <p className="mt-2 text-gray-600">Simple agent management - automatically synced with Vapi</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Create Agent
        </button>
      </div>

      {/* Template Info Banner */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">🔒 Professional Bill Collection Template</h3>
            <p className="text-sm text-blue-800 mb-2">
              All agents use our proven, FDCPA-compliant collections strategy. You can customize the agent name and voice, 
              but the collections script is locked to ensure compliance and effectiveness.
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
              <li><strong>What you can change:</strong> Agent name, Voice selection</li>
              <li><strong>What's locked:</strong> Collections strategy, Greeting, Personality, Compliance guidelines</li>
              <li><strong>Test before deploy:</strong> Make test calls to verify everything works</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Vapi Sync Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 text-sm">Automatic Vapi Sync</h3>
            <p className="text-sm text-green-700 mt-1">
              Agents are automatically synced to Vapi when created or updated. No manual sync needed!
            </p>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 card">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents yet</h3>
          <p className="text-gray-600 mb-6">Create your first bill collection agent to start collecting payments</p>
          <button onClick={openCreateModal} className="btn btn-primary inline-flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map(agent => (
            <div key={agent.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Bot className="h-8 w-8 text-primary-600" />
                </div>
                {agent.vapi_assistant_id && (
                  <span className="flex items-center text-xs text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Synced
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent.name}</h3>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-600 flex items-center">
                  <Mic className="h-4 w-4 mr-2 text-gray-400" />
                  Voice: {agent.elevenlabs_voice || agent.voice}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-400" />
                  Template: Bill Collection
                </p>
              </div>
              
              <div className="flex flex-col gap-2 pt-4 border-t">
                <button 
                  onClick={() => openEditModal(agent)}
                  className="btn btn-sm btn-secondary w-full flex items-center justify-center"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Change Voice
                </button>
                <button 
                  onClick={() => openTestModal(agent)}
                  className="btn btn-sm btn-primary w-full flex items-center justify-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Test Call
                </button>
                <button 
                  onClick={() => deleteAgent(agent.id)}
                  className="btn btn-sm btn-danger w-full flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Bill Collection Agent</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., Will, Shannon, Sarah"
                  className="input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">This name will be used in the greeting</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice Selection
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="input w-full"
                >
                  {voices.map(voice => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => playVoicePreview(selectedVoice)}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Preview Voice
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Template Locked</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Collections strategy, greeting, and personality are automatically applied
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={createAgent}
                  className="btn btn-primary flex-1"
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {showEditModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Agent</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice Selection
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="input w-full"
                >
                  {voices.map(voice => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => playVoicePreview(selectedVoice)}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Preview Voice
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Template Locked</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Collections strategy cannot be modified to ensure compliance
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={updateAgent}
                  className="btn btn-primary flex-1"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Call Modal */}
      {showTestModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Test Call</h2>
              <button onClick={() => setShowTestModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Test Your Agent</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Enter your phone number to receive a test call from <strong>{selectedAgent.name}</strong>. 
                      This will use the real Vapi integration so you can verify the voice and script.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  <strong>Agent:</strong> {selectedAgent.name}<br />
                  <strong>Voice:</strong> {selectedAgent.elevenlabs_voice || selectedAgent.voice}<br />
                  <strong>Template:</strong> Bill Collection
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="btn btn-secondary flex-1"
                  disabled={testingCall}
                >
                  Cancel
                </button>
                <button
                  onClick={makeTestCall}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                  disabled={testingCall}
                >
                  {testingCall ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Calling...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Make Test Call
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
