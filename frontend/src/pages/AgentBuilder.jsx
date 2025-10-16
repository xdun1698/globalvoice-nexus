import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';
import {
  Save,
  Play,
  Plus,
  Trash2,
  MessageSquare,
  Zap,
  Settings,
  Globe,
  Mic,
} from 'lucide-react';

export default function AgentBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      greeting: 'Hello! How can I help you today?',
      language: 'en',
      voice: 'female',
      personality: 'professional',
      enableVoiceCloning: false,
    }
  });

  const [intents, setIntents] = useState([
    { id: 1, name: 'greeting', examples: ['hello', 'hi', 'hey'], response: 'Hello! How can I assist you?' },
    { id: 2, name: 'farewell', examples: ['goodbye', 'bye', 'see you'], response: 'Thank you for calling. Have a great day!' },
  ]);

  const [workflows, setWorkflows] = useState([
    { id: 1, trigger: 'greeting', action: 'respond', value: 'greeting_response' },
    { id: 2, trigger: 'question_asked', action: 'search_knowledge_base', value: '' },
  ]);

  const addIntent = () => {
    setIntents([...intents, {
      id: Date.now(),
      name: '',
      examples: [],
      response: ''
    }]);
  };

  const removeIntent = (id) => {
    setIntents(intents.filter(intent => intent.id !== id));
  };

  const addWorkflow = () => {
    setWorkflows([...workflows, {
      id: Date.now(),
      trigger: '',
      action: '',
      value: ''
    }]);
  };

  const removeWorkflow = (id) => {
    setWorkflows(workflows.filter(workflow => workflow.id !== id));
  };

  const onSubmit = async (data) => {
    try {
      const agentData = {
        ...data,
        intents,
        workflows,
      };

      if (isEditing) {
        await api.put(`/api/agents/${id}`, agentData);
        toast.success('Agent updated successfully!');
      } else {
        const response = await api.post('/api/agents', agentData);
        toast.success('Agent created successfully!');
        
        // Assign phone number if available
        if (response.data.agent?.id) {
          try {
            await api.post(`/api/agents/${response.data.agent.id}/phone-number`, {
              phoneNumber: '+18175417385'
            });
            toast.success('Phone number assigned!');
          } catch (err) {
            console.error('Failed to assign phone number:', err);
          }
        }
      }
      
      navigate('/agents');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save agent');
    }
  };

  const testAgent = async () => {
    try {
      toast.loading('Initiating test call...');
      // This would make a test call to your phone
      toast.success('Test call feature coming soon!');
    } catch (error) {
      toast.error('Failed to initiate test call');
    }
  };

  // Load agent data if editing
  useEffect(() => {
    if (isEditing) {
      const loadAgent = async () => {
        try {
          const response = await api.get(`/api/agents/${id}`);
          const agent = response.data.agent;
          
          // Set form values
          Object.keys(agent).forEach(key => {
            if (key !== 'intents' && key !== 'workflows') {
              // setValue from react-hook-form would be used here
            }
          });
          
          if (agent.intents) setIntents(agent.intents);
          if (agent.workflows) setWorkflows(agent.workflows);
        } catch (error) {
          toast.error('Failed to load agent');
          navigate('/agents');
        }
      };
      loadAgent();
    }
  }, [isEditing, id, navigate]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Agent' : 'Create New Agent'}
          </h1>
          <p className="mt-2 text-gray-600">
            Build your AI call agent with custom intents and workflows
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={testAgent}
            className="btn btn-secondary flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Test Agent
          </button>
          <button
            type="submit"
            form="agent-form"
            className="btn btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update' : 'Create'} Agent
          </button>
        </div>
      </div>

      <form id="agent-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Settings className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="input"
                placeholder="e.g., Customer Support Agent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Language *
              </label>
              <select {...register('language')} className="input">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="ru">Russian</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input"
                placeholder="Describe what this agent does..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Type
              </label>
              <select {...register('voice')} className="input">
                <option value="Polly.Joanna">Joanna (US Female)</option>
                <option value="Polly.Matthew">Matthew (US Male)</option>
                <option value="Polly.Amy">Amy (UK Female)</option>
                <option value="Polly.Brian">Brian (UK Male)</option>
                <option value="Polly.Conchita">Conchita (Spanish Female)</option>
                <option value="Polly.Celine">Celine (French Female)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personality
              </label>
              <textarea
                {...register('personality')}
                rows={3}
                className="input"
                placeholder="You are a professional and friendly customer support agent. Be helpful, empathetic, and concise. Ask clarifying questions when needed."
              />
              <p className="mt-1 text-sm text-gray-500">Describe how the agent should behave and respond</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Greeting Message
              </label>
              <textarea
                {...register('greeting')}
                rows={2}
                className="input"
                placeholder="Hello! How can I help you today?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('enableVoiceCloning')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Enable voice cloning (requires voice sample upload)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Intents */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Intents & Responses
              </h2>
            </div>
            <button
              type="button"
              onClick={addIntent}
              className="btn btn-secondary btn-sm flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Intent
            </button>
          </div>

          <div className="space-y-4">
            {intents.map((intent, index) => (
              <div key={intent.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Intent #{index + 1}
                  </h3>
                  {intents.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeIntent(intent.id)}
                      className="text-danger-600 hover:text-danger-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intent Name
                    </label>
                    <input
                      type="text"
                      value={intent.name}
                      onChange={(e) => {
                        const updated = [...intents];
                        updated[index].name = e.target.value;
                        setIntents(updated);
                      }}
                      className="input"
                      placeholder="e.g., booking_inquiry"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Example Phrases (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={intent.examples.join(', ')}
                      onChange={(e) => {
                        const updated = [...intents];
                        updated[index].examples = e.target.value.split(',').map(s => s.trim());
                        setIntents(updated);
                      }}
                      className="input"
                      placeholder="book appointment, schedule meeting"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Response Template
                    </label>
                    <textarea
                      value={intent.response}
                      onChange={(e) => {
                        const updated = [...intents];
                        updated[index].response = e.target.value;
                        setIntents(updated);
                      }}
                      rows={2}
                      className="input"
                      placeholder="I'd be happy to help you book an appointment..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflows */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Workflows & Actions
              </h2>
            </div>
            <button
              type="button"
              onClick={addWorkflow}
              className="btn btn-secondary btn-sm flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Workflow
            </button>
          </div>

          <div className="space-y-4">
            {workflows.map((workflow, index) => (
              <div key={workflow.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Workflow #{index + 1}
                  </h3>
                  {workflows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWorkflow(workflow.id)}
                      className="text-danger-600 hover:text-danger-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trigger
                    </label>
                    <select
                      value={workflow.trigger}
                      onChange={(e) => {
                        const updated = [...workflows];
                        updated[index].trigger = e.target.value;
                        setWorkflows(updated);
                      }}
                      className="input"
                    >
                      <option value="">Select trigger...</option>
                      <option value="greeting">Greeting</option>
                      <option value="question_asked">Question Asked</option>
                      <option value="booking_request">Booking Request</option>
                      <option value="complaint">Complaint</option>
                      <option value="farewell">Farewell</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action
                    </label>
                    <select
                      value={workflow.action}
                      onChange={(e) => {
                        const updated = [...workflows];
                        updated[index].action = e.target.value;
                        setWorkflows(updated);
                      }}
                      className="input"
                    >
                      <option value="">Select action...</option>
                      <option value="respond">Send Response</option>
                      <option value="search_knowledge_base">Search Knowledge Base</option>
                      <option value="create_ticket">Create Ticket</option>
                      <option value="transfer_call">Transfer Call</option>
                      <option value="schedule_callback">Schedule Callback</option>
                      <option value="api_call">Make API Call</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value/Parameter
                    </label>
                    <input
                      type="text"
                      value={workflow.value}
                      onChange={(e) => {
                        const updated = [...workflows];
                        updated[index].value = e.target.value;
                        setWorkflows(updated);
                      }}
                      className="input"
                      placeholder="Enter value..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
