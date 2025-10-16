import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bot, Edit, Trash2, Power } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
          <p className="mt-2 text-gray-600">Manage your AI call agents</p>
        </div>
        <Link to="/agents/new" className="btn btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Create Agent
        </Link>
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
              <p className="text-sm text-gray-600 mb-4">Voice: {agent.voice}</p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-600">Active</span>
                <div className="flex gap-2">
                  <Link to={`/agents/${agent.id}`} className="text-primary-600 hover:text-primary-700">
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
    </div>
  );
}
