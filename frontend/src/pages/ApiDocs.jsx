import { useState } from 'react';
import { 
  Code, Copy, Check, ChevronDown, ChevronRight, 
  Lock, Zap, Phone, MessageSquare, Key, Book
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ApiDocs() {
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [apiKey, setApiKey] = useState('');

  const baseUrl = 'https://globalvoice-backend.fly.dev';

  // Copy code to clipboard
  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // API endpoints organized by category
  const apiCategories = [
    {
      name: 'Authentication',
      icon: Lock,
      color: 'blue',
      description: 'Manage user authentication and API tokens',
      endpoints: [
        {
          id: 'auth-register',
          method: 'POST',
          path: '/api/auth/register',
          title: 'Register New User',
          description: 'Create a new user account and receive authentication token',
          authRequired: false,
          requestBody: {
            email: 'user@example.com',
            password: 'SecurePass123!',
            name: 'John Doe'
          },
          response: {
            user: {
              id: 'uuid-here',
              email: 'user@example.com',
              name: 'John Doe'
            },
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        },
        {
          id: 'auth-login',
          method: 'POST',
          path: '/api/auth/login',
          title: 'Login',
          description: 'Authenticate and receive JWT token',
          authRequired: false,
          requestBody: {
            email: 'user@example.com',
            password: 'SecurePass123!'
          },
          response: {
            user: {
              id: 'uuid-here',
              email: 'user@example.com'
            },
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        },
        {
          id: 'auth-me',
          method: 'GET',
          path: '/api/auth/me',
          title: 'Get Current User',
          description: 'Get authenticated user information',
          authRequired: true,
          response: {
            user: {
              id: 'uuid-here',
              email: 'user@example.com',
              name: 'John Doe',
              created_at: '2025-10-22T10:00:00Z'
            }
          }
        }
      ]
    },
    {
      name: 'Agents',
      icon: MessageSquare,
      color: 'purple',
      description: 'Manage AI voice agents',
      endpoints: [
        {
          id: 'agents-list',
          method: 'GET',
          path: '/api/agents',
          title: 'List Agents',
          description: 'Get all agents for authenticated user',
          authRequired: true,
          response: {
            agents: [
              {
                id: 'uuid-here',
                name: 'Customer Support',
                greeting: 'Hello! How can I help you?',
                language: 'en',
                elevenlabs_voice: 'test_antoni',
                created_at: '2025-10-22T10:00:00Z'
              }
            ]
          }
        },
        {
          id: 'agents-create',
          method: 'POST',
          path: '/api/agents',
          title: 'Create Agent',
          description: 'Create a new AI voice agent',
          authRequired: true,
          requestBody: {
            name: 'Sales Agent',
            description: 'Handles sales inquiries',
            greeting: 'Hi! Ready to help with your purchase!',
            language: 'en',
            elevenlabs_voice: 'test_rachel',
            personality: 'Friendly and helpful sales expert'
          },
          response: {
            agent: {
              id: 'uuid-here',
              name: 'Sales Agent',
              vapi_assistant_id: 'vapi-uuid',
              created_at: '2025-10-22T10:00:00Z'
            }
          }
        },
        {
          id: 'agents-get',
          method: 'GET',
          path: '/api/agents/:id',
          title: 'Get Agent',
          description: 'Get details of a specific agent',
          authRequired: true,
          response: {
            agent: {
              id: 'uuid-here',
              name: 'Customer Support',
              description: '24/7 support agent',
              greeting: 'Hello! How can I help?',
              language: 'en',
              elevenlabs_voice: 'test_antoni',
              personality: 'Professional and helpful',
              vapi_assistant_id: 'vapi-uuid',
              created_at: '2025-10-22T10:00:00Z'
            }
          }
        },
        {
          id: 'agents-update',
          method: 'PUT',
          path: '/api/agents/:id',
          title: 'Update Agent',
          description: 'Update agent configuration',
          authRequired: true,
          requestBody: {
            name: 'Updated Agent Name',
            greeting: 'New greeting!',
            elevenlabs_voice: 'test_lily'
          },
          response: {
            agent: {
              id: 'uuid-here',
              name: 'Updated Agent Name',
              updated_at: '2025-10-22T11:00:00Z'
            }
          }
        },
        {
          id: 'agents-delete',
          method: 'DELETE',
          path: '/api/agents/:id',
          title: 'Delete Agent',
          description: 'Delete an agent permanently',
          authRequired: true,
          response: {
            message: 'Agent deleted successfully'
          }
        }
      ]
    },
    {
      name: 'Phone Numbers',
      icon: Phone,
      color: 'green',
      description: 'Manage phone numbers and assignments',
      endpoints: [
        {
          id: 'phones-list',
          method: 'GET',
          path: '/api/phone-numbers',
          title: 'List Phone Numbers',
          description: 'Get all phone numbers for authenticated user',
          authRequired: true,
          response: {
            phoneNumbers: [
              {
                id: 'uuid-here',
                number: '+16826269224',
                agent_id: 'agent-uuid',
                country_code: '+1',
                created_at: '2025-10-22T10:00:00Z'
              }
            ]
          }
        },
        {
          id: 'phones-search',
          method: 'GET',
          path: '/api/phone-numbers/search',
          title: 'Search Available Numbers',
          description: 'Search for available phone numbers by area code',
          authRequired: true,
          queryParams: {
            areaCode: '682',
            limit: '10'
          },
          response: {
            numbers: [
              {
                number: '+16826261234',
                locality: 'Fort Worth',
                region: 'TX',
                price: '$1.00/month'
              }
            ]
          }
        },
        {
          id: 'phones-buy',
          method: 'POST',
          path: '/api/phone-numbers/buy',
          title: 'Purchase Phone Number',
          description: 'Buy a phone number and assign to agent',
          authRequired: true,
          requestBody: {
            number: '+16826261234',
            agent_id: 'agent-uuid'
          },
          response: {
            phoneNumber: {
              id: 'uuid-here',
              number: '+16826261234',
              agent_id: 'agent-uuid',
              status: 'active'
            }
          }
        }
      ]
    },
    {
      name: 'Calls',
      icon: Zap,
      color: 'orange',
      description: 'Access call logs and transcripts',
      endpoints: [
        {
          id: 'calls-list',
          method: 'GET',
          path: '/api/calls',
          title: 'List Calls',
          description: 'Get call history with optional filters',
          authRequired: true,
          queryParams: {
            limit: '50',
            offset: '0',
            agent_id: 'agent-uuid'
          },
          response: {
            calls: [
              {
                id: 'uuid-here',
                agent_id: 'agent-uuid',
                from: '+15551234567',
                to: '+16826269224',
                status: 'completed',
                duration: 120,
                started_at: '2025-10-22T10:00:00Z',
                ended_at: '2025-10-22T10:02:00Z'
              }
            ],
            total: 150,
            limit: 50,
            offset: 0
          }
        },
        {
          id: 'calls-get',
          method: 'GET',
          path: '/api/calls/:id',
          title: 'Get Call Details',
          description: 'Get detailed information about a specific call',
          authRequired: true,
          response: {
            call: {
              id: 'uuid-here',
              agent_id: 'agent-uuid',
              from: '+15551234567',
              to: '+16826269224',
              status: 'completed',
              duration: 120,
              recording_url: 'https://...',
              transcript: 'Hello! How can I help you today?...',
              started_at: '2025-10-22T10:00:00Z',
              ended_at: '2025-10-22T10:02:00Z'
            }
          }
        }
      ]
    }
  ];

  // Generate cURL example
  const generateCurl = (endpoint) => {
    let curl = `curl -X ${endpoint.method} ${baseUrl}${endpoint.path}`;
    
    if (endpoint.authRequired) {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;
    }
    
    if (endpoint.requestBody) {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      curl += ` \\\n  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'`;
    }
    
    if (endpoint.queryParams) {
      const params = new URLSearchParams(endpoint.queryParams).toString();
      curl = curl.replace(endpoint.path, `${endpoint.path}?${params}`);
    }
    
    return curl;
  };

  // Generate JavaScript example
  const generateJavaScript = (endpoint) => {
    let js = `const response = await fetch('${baseUrl}${endpoint.path}', {\n`;
    js += `  method: '${endpoint.method}'`;
    
    if (endpoint.authRequired || endpoint.requestBody) {
      js += `,\n  headers: {`;
      if (endpoint.authRequired) {
        js += `\n    'Authorization': 'Bearer YOUR_TOKEN'`;
      }
      if (endpoint.requestBody) {
        if (endpoint.authRequired) js += ',';
        js += `\n    'Content-Type': 'application/json'`;
      }
      js += `\n  }`;
    }
    
    if (endpoint.requestBody) {
      js += `,\n  body: JSON.stringify(${JSON.stringify(endpoint.requestBody, null, 4)})`;
    }
    
    js += `\n});\n\nconst data = await response.json();\nconsole.log(data);`;
    
    return js;
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-700',
      POST: 'bg-green-100 text-green-700',
      PUT: 'bg-amber-100 text-amber-700',
      DELETE: 'bg-red-100 text-red-700'
    };
    return colors[method] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="mt-2 text-gray-600">
            Complete reference for GlobalVoice API endpoints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Book className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">v1.0.0</span>
        </div>
      </div>

      {/* Quick Start */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Getting Started</h3>
            <p className="text-gray-700 mb-4">
              All API requests require authentication using a Bearer token. Get your token by logging in:
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <code className="text-sm text-green-400">
                POST {baseUrl}/api/auth/login
              </code>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Paste your API token here..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input flex-1"
              />
              {apiKey && (
                <Check className="h-5 w-5 text-green-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Categories */}
      {apiCategories.map((category) => (
        <div key={category.name} className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
              <category.icon className={`h-6 w-6 text-${category.color}-600`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            {category.endpoints.map((endpoint) => (
              <div key={endpoint.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Endpoint Header */}
                <button
                  onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedEndpoint === endpoint.id ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    {endpoint.authRequired && (
                      <Lock className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm text-gray-600">{endpoint.title}</span>
                  </div>
                </button>

                {/* Endpoint Details */}
                {expandedEndpoint === endpoint.id && (
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                    <p className="text-sm text-gray-600">{endpoint.description}</p>

                    {/* Request Body */}
                    {endpoint.requestBody && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Request Body</h4>
                        <div className="bg-gray-900 rounded-lg p-4 relative">
                          <button
                            onClick={() => copyCode(JSON.stringify(endpoint.requestBody, null, 2), `${endpoint.id}-req`)}
                            className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded"
                          >
                            {copiedCode === `${endpoint.id}-req` ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <pre className="text-sm text-green-400 overflow-x-auto">
                            {JSON.stringify(endpoint.requestBody, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Query Parameters */}
                    {endpoint.queryParams && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Query Parameters</h4>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-sm text-blue-400 overflow-x-auto">
                            {Object.entries(endpoint.queryParams).map(([key, value]) => 
                              `${key}=${value}`
                            ).join('&')}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Response */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Response (200)</h4>
                      <div className="bg-gray-900 rounded-lg p-4 relative">
                        <button
                          onClick={() => copyCode(JSON.stringify(endpoint.response, null, 2), `${endpoint.id}-res`)}
                          className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded"
                        >
                          {copiedCode === `${endpoint.id}-res` ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <pre className="text-sm text-green-400 overflow-x-auto">
                          {JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Code Examples */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* cURL */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">cURL</h4>
                          <button
                            onClick={() => copyCode(generateCurl(endpoint), `${endpoint.id}-curl`)}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            {copiedCode === `${endpoint.id}-curl` ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3">
                          <pre className="text-xs text-gray-300 overflow-x-auto">
                            {generateCurl(endpoint)}
                          </pre>
                        </div>
                      </div>

                      {/* JavaScript */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">JavaScript</h4>
                          <button
                            onClick={() => copyCode(generateJavaScript(endpoint), `${endpoint.id}-js`)}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            {copiedCode === `${endpoint.id}-js` ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-3">
                          <pre className="text-xs text-gray-300 overflow-x-auto">
                            {generateJavaScript(endpoint)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Error Codes */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Code</th>
                <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4 text-sm font-mono">UNAUTHORIZED</td>
                <td className="py-2 px-4 text-sm">401</td>
                <td className="py-2 px-4 text-sm text-gray-600">Invalid or missing token</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4 text-sm font-mono">FORBIDDEN</td>
                <td className="py-2 px-4 text-sm">403</td>
                <td className="py-2 px-4 text-sm text-gray-600">Insufficient permissions</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4 text-sm font-mono">NOT_FOUND</td>
                <td className="py-2 px-4 text-sm">404</td>
                <td className="py-2 px-4 text-sm text-gray-600">Resource not found</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4 text-sm font-mono">VALIDATION_ERROR</td>
                <td className="py-2 px-4 text-sm">400</td>
                <td className="py-2 px-4 text-sm text-gray-600">Invalid request data</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4 text-sm font-mono">RATE_LIMIT_EXCEEDED</td>
                <td className="py-2 px-4 text-sm">429</td>
                <td className="py-2 px-4 text-sm text-gray-600">Too many requests</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-sm font-mono">SERVER_ERROR</td>
                <td className="py-2 px-4 text-sm">500</td>
                <td className="py-2 px-4 text-sm text-gray-600">Internal server error</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="card bg-amber-50 border-2 border-amber-200">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Rate Limiting</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">Authentication</p>
            <p className="text-2xl font-bold text-amber-600">10/min</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Read Operations</p>
            <p className="text-2xl font-bold text-blue-600">100/min</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Write Operations</p>
            <p className="text-2xl font-bold text-green-600">50/min</p>
          </div>
        </div>
      </div>
    </div>
  );
}
