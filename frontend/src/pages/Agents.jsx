import { Link } from 'react-router-dom';
import { Plus, Bot, Edit, Trash2, Power } from 'lucide-react';

export default function Agents() {
  const agents = [
    { id: 1, name: 'Customer Support Agent', language: 'English', status: 'active', calls: 245 },
    { id: 2, name: 'Sales Agent', language: 'Spanish', status: 'active', calls: 189 },
    { id: 3, name: 'Technical Support', language: 'French', status: 'inactive', calls: 67 },
  ];

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
            <p className="text-sm text-gray-600 mb-4">Language: {agent.language}</p>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-gray-600">{agent.calls} calls</span>
              <div className="flex gap-2">
                <Link to={`/agents/${agent.id}/edit`} className="text-primary-600 hover:text-primary-700">
                  <Edit className="h-5 w-5" />
                </Link>
                <button className="text-gray-600 hover:text-gray-700">
                  <Power className="h-5 w-5" />
                </button>
                <button className="text-danger-600 hover:text-danger-700">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
