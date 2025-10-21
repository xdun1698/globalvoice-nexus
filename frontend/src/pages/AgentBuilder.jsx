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

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
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

  const [elevenLabsVoices, setElevenLabsVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

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
    const loadAgent = async () => {
      if (isEditing) {
        try {
          const response = await api.get(`/api/agents/${id}`);
          const agent = response.data.agent;
          
          setValue('name', agent.name || '');
          setValue('description', agent.description || '');
          setValue('greeting', agent.greeting || 'Hello! How can I help you today?');
          setValue('language', agent.language || 'en');
          setValue('voice', agent.voice || 'female');
          setValue('elevenlabs_voice', agent.elevenlabs_voice || 'ErXwobaYiN019PkySvjV');
          setValue('personality', agent.personality || 'professional');
          setValue('enableVoiceCloning', agent.enable_voice_cloning || false);
          
          // Set intents and workflows
          if (agent.intents && Array.isArray(agent.intents)) {
            setIntents(agent.intents.length > 0 ? agent.intents : [
              { id: 1, name: 'greeting', examples: ['hello', 'hi', 'hey'], response: 'Hello! How can I assist you?' },
              { id: 2, name: 'farewell', examples: ['goodbye', 'bye', 'see you'], response: 'Thank you for calling. Have a great day!' },
            ]);
          }
          
          if (agent.workflows && Array.isArray(agent.workflows)) {
            setWorkflows(agent.workflows.length > 0 ? agent.workflows : [
              { id: 1, trigger: 'greeting', action: 'respond', value: 'greeting_response' },
              { id: 2, trigger: 'question_asked', action: 'search_knowledge_base', value: '' },
            ]);
          }
        } catch (error) {
          console.error('Failed to load agent:', error);
          toast.error('Failed to load agent');
          navigate('/agents');
        }
      }
    };
    
    const fetchElevenLabsVoices = async () => {
      try {
        setLoadingVoices(true);
        const response = await api.get('/api/agents/voices/elevenlabs');
        if (response.data.voices) {
          setElevenLabsVoices(response.data.voices);
        }
      } catch (error) {
        console.error('Failed to fetch ElevenLabs voices:', error);
      } finally {
        setLoadingVoices(false);
      }
    };
    
    loadAgent();
    fetchElevenLabsVoices();
  }, [isEditing, id, navigate, setValue]);

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
                Voice Provider & Type
              </label>
              <select {...register('elevenlabs_voice')} className="input">
                <optgroup label="⭐⭐⭐⭐⭐ PREMIUM - Best for Customer-Facing">
                  {loadingVoices ? (
                    <option value="">Loading voices...</option>
                  ) : elevenLabsVoices.length > 0 ? (
                    elevenLabsVoices
                      .filter(v => v.rating === 5)
                      .map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender}, {voice.accent}) - {voice.tone}
                        </option>
                      ))
                  ) : (
                    <>
                      <option value="ErXwobaYiN019PkySvjV">Antoni/Will ⭐⭐⭐⭐⭐ (Male, US) - Collections/Sales</option>
                      <option value="21m00Tcm4TlvDq8ikWAM">Rachel ⭐⭐⭐⭐⭐ (Female, US) - Support</option>
                      <option value="pNInz6obpgDQGcFmaJgB">Adam ⭐⭐⭐⭐⭐ (Male, US) - Corporate</option>
                      <option value="EXAVITQu4vr4xnSDxMaL">Bella ⭐⭐⭐⭐⭐ (Female, US) - Hospitality</option>
                      <option value="TxGEqnHWrfWFTfGW9XjX">Josh ⭐⭐⭐⭐⭐ (Male, US) - Tech/Startups</option>
                    </>
                  )}
                </optgroup>
                <optgroup label="⭐⭐⭐⭐ EXCELLENT - Professional Quality">
                  {elevenLabsVoices.length > 0 ? (
                    elevenLabsVoices
                      .filter(v => v.rating === 4)
                      .map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender}, {voice.accent}) - {voice.tone}
                        </option>
                      ))
                  ) : (
                    <>
                      <option value="AZnzlk1XvdvUeBnXmlld">Domi ⭐⭐⭐⭐ (Female, US) - Sales/Leadership</option>
                      <option value="yoZ06aMxZJJ28mfd3POQ">Sam ⭐⭐⭐⭐ (Male, US) - Storytelling</option>
                      <option value="MF3mGyEYCl7XYWbV9V6O">Elli ⭐⭐⭐⭐ (Female, US) - Empathetic</option>
                      <option value="VR6AewLTigWG4xSOukaG">Arnold ⭐⭐⭐⭐ (Male, US) - Technical</option>
                      <option value="pFZP5JQG7iQjIQuC4Bku">Lily ⭐⭐⭐⭐ (Female, UK) - British</option>
                      <option value="oWAxZDx7w5VEj9dCyTzz">Grace ⭐⭐⭐⭐ (Female, US Southern) - Hospitality</option>
                      <option value="N2lVS1w4EtoT3dr4eOWO">Tom ⭐⭐⭐⭐ (Male, US) - Collections</option>
                    </>
                  )}
                </optgroup>
                <optgroup label="⭐⭐⭐ GOOD - Solid Performance">
                  {elevenLabsVoices.length > 0 ? (
                    elevenLabsVoices
                      .filter(v => v.rating === 3)
                      .map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender}, {voice.accent})
                        </option>
                      ))
                  ) : (
                    <>
                      <option value="onwK4e9ZLuTAKqWW03F9">Daniel (Male, UK)</option>
                      <option value="XrExE9yKIg1WjnnlVkGX">Matilda (Female, US)</option>
                      <option value="ZQe5CZNOzWyzPSCn5a3c">James (Male, Australian)</option>
                      <option value="LcfcDJNUP1GQjkzn1xUU">Emily (Female, US)</option>
                      <option value="GBv7mTt0atIp3Br8iCZE">Thomas (Male, US)</option>
                    </>
                  )}
                </optgroup>
                <optgroup label="🔊 AWS POLLY (Standard - Basic Voices)">
                  <option value="Polly.Joanna">Joanna (Female, US)</option>
                  <option value="Polly.Matthew">Matthew (Male, US)</option>
                  <option value="Polly.Kendra">Kendra (Female, US)</option>
                  <option value="Polly.Joey">Joey (Male, US)</option>
                  <option value="Polly.Amy">Amy (Female, UK)</option>
                  <option value="Polly.Brian">Brian (Male, UK)</option>
                </optgroup>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                <span className="font-semibold">⭐ Rating:</span> 5=Premium, 4=Excellent, 3=Good | 
                <span className="font-semibold"> Will/Antoni</span> = Best for collections
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expertise & Knowledge Base
              </label>
              <textarea
                {...register('personality')}
                rows={8}
                className="input"
                placeholder="You are an expert in [your field] with [X years] of experience. You know about:&#10;&#10;- [Knowledge area 1]&#10;- [Knowledge area 2]&#10;- [Knowledge area 3]&#10;&#10;You speak in a [communication style] manner and are [personality traits].&#10;&#10;Example: You are an expert deer hunting guide with 20 years of experience. You know about whitetail deer behavior, hunting techniques, equipment selection, and regulations. You speak in a friendly, down-to-earth country style."
              />
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-1">💡 Pro Tip: Be Specific!</p>
                  <p className="text-sm text-blue-700">
                    The more detailed you are about the agent's expertise, the better it will perform. 
                    Include specific knowledge areas, terminology, and communication style. 
                    The AI will act as an expert in whatever you describe here.
                  </p>
                </div>
                
                <details className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    📚 View Examples
                  </summary>
                  <div className="mt-3 space-y-3 text-sm text-gray-600">
                    <div>
                      <p className="font-medium text-gray-800 mb-1">Deer Hunting Expert:</p>
                      <p className="text-xs bg-white p-2 rounded border">
                        You are an expert deer hunting guide with 20 years of experience. You know about whitetail deer behavior, rutting season, hunting techniques (stand hunting, calling, scent control), equipment (rifles, bows, tree stands), and regulations. You speak in a friendly, down-to-earth country style using phrases like "partner" and "reckon."
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 mb-1">Healthcare Support:</p>
                      <p className="text-xs bg-white p-2 rounded border">
                        You are a registered nurse with 15 years of experience. You know about common health issues, medications, preventive care, and when to seek medical attention. You're warm, patient, and empathetic. You explain medical concepts in simple terms and never diagnose but help people understand when to see a doctor.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 mb-1">Tech Support:</p>
                      <p className="text-xs bg-white p-2 rounded border">
                        You are a senior IT specialist with 10 years of experience. You know about Windows/Mac troubleshooting, networking, software issues, and hardware problems. You're patient and methodical, breaking down complex issues into simple steps. You never assume technical knowledge.
                      </p>
                    </div>
                  </div>
                </details>
              </div>
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

            {/* Phone Numbers Section */}
            {isEditing && (
              <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Assigned Phone Numbers</h3>
                    <p className="text-xs text-gray-500 mt-1">Phone numbers assigned to this agent</p>
                  </div>
                </div>
                {watch('phone_numbers') && watch('phone_numbers').length > 0 ? (
                  <div className="space-y-2">
                    {watch('phone_numbers').map((phone, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="font-medium text-gray-900">{phone.number}</span>
                        <span className="text-xs text-gray-500">{phone.country_code}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No phone numbers assigned yet. Go to Phone Numbers page to assign one.</p>
                )}
              </div>
            )}

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
