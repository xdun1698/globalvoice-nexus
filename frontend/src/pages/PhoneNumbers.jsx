import { useState, useEffect } from 'react';
import { Phone, Plus, Edit, Trash2, Link as LinkIcon, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';

export default function PhoneNumbers() {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [newPhone, setNewPhone] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [phonesRes, agentsRes] = await Promise.all([
        api.get('/api/phone-numbers'),
        api.get('/api/agents')
      ]);
      setPhoneNumbers(phonesRes.data.phoneNumbers || []);
      setAgents(agentsRes.data.agents || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phone Numbers</h1>
          <p className="mt-2 text-gray-600">Manage virtual phone numbers and assign them to agents</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add Phone Number
        </button>
      </div>

      {/* Twilio Setup Info */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="flex items-start">
          <Phone className="h-6 w-6 text-primary-600 mr-3 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Twilio Phone Numbers</h3>
            <p className="text-sm text-gray-600 mb-3">
              Purchase phone numbers from Twilio and add them here. Each number can be assigned to one agent.
            </p>
            <a 
              href="https://console.twilio.com/us1/develop/phone-numbers/manage/search?frameUrl=%2Fconsole%2Fphone-numbers%2Fsearch%3Fx-target-region%3Dus1&currentFrameUrl=%2Fconsole%2Fphone-numbers%2Fsearch%3FisoCountry%3DUS%26types%255B%255D%3DLocal%26types%255B%255D%3DTollfree%26capabilities%255B%255D%3DVoice%26capabilities%255B%255D%3DSMS%26capabilities%255B%255D%3DMMS%26searchTerm%3D%26searchFilter%3Dleft%26searchType%3Dnumber%26x-target-region%3Dus1%26__override_layout__%3Dembed%26bifrost%3Dtrue" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Buy Phone Numbers on Twilio
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Phone Numbers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading phone numbers...</p>
        </div>
      ) : phoneNumbers.length === 0 ? (
        <div className="text-center py-12 card">
          <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No phone numbers yet</h3>
          <p className="text-gray-600 mb-6">Add your first Twilio phone number to start receiving calls</p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary inline-flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Number
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {phoneNumbers.map(phone => (
            <div key={phone.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Phone className="h-6 w-6 text-primary-600" />
                </div>
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
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{phone.number}</h3>
              
              {phone.agent_id && (
                <div className="mb-3 p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Assigned to:</p>
                  <p className="text-sm font-medium text-gray-900">{getAgentName(phone.agent_id)}</p>
                </div>
              )}

              <div className="text-sm text-gray-600 mb-4">
                <p>Country: {phone.country_code || 'N/A'}</p>
                {phone.twilio_sid && (
                  <p className="text-xs text-gray-500 mt-1 truncate">SID: {phone.twilio_sid}</p>
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
                Enter the phone number from your Twilio account (include country code)
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
