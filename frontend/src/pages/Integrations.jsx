import { 
  Plus, CheckCircle, ExternalLink, Zap, Code, 
  Building2, Users, Database, Mail, Calendar,
  MessageSquare, FileText, Webhook, Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Integrations() {
  const navigate = useNavigate();
  // Handle CRM connection
  const handleConnectCRM = (crmName) => {
    toast.success(`${crmName} integration coming soon!`, {
      icon: '🔗',
      duration: 3000
    });
  };

  // Handle other integration connection
  const handleConnectIntegration = (integrationName) => {
    toast.success(`${integrationName} integration coming soon!`, {
      icon: '⚡',
      duration: 3000
    });
  };

  // Handle custom integration request
  const handleRequestCustom = () => {
    const subject = encodeURIComponent('Custom Integration Request');
    const body = encodeURIComponent(`Hi GlobalVoice Team,

I would like to request a custom integration for:

Integration Name: 
Business Need: 
Expected Features: 

Please contact me to discuss further.

Thank you!`);
    
    window.location.href = `mailto:support@globalvoice.com?subject=${subject}&body=${body}`;
  };

  // Handle API documentation
  const handleViewDocs = () => {
    navigate('/api-docs');
  };
  // Top-rated CRM integrations
  const crmIntegrations = [
    {
      name: 'Salesforce',
      description: 'World\'s #1 CRM platform for sales, service, and marketing',
      logo: '☁️',
      category: 'Enterprise CRM',
      rating: 4.4,
      features: ['Contact Sync', 'Call Logging', 'Lead Management', 'Custom Fields'],
      status: 'available',
      pricing: 'Enterprise'
    },
    {
      name: 'HubSpot',
      description: 'All-in-one CRM platform for growing businesses',
      logo: '🟠',
      category: 'Marketing & Sales CRM',
      rating: 4.5,
      features: ['Contact Management', 'Email Integration', 'Deal Tracking', 'Workflows'],
      status: 'available',
      pricing: 'Free - Enterprise'
    },
    {
      name: 'Zoho CRM',
      description: 'Affordable CRM with powerful automation capabilities',
      logo: '🔴',
      category: 'SMB CRM',
      rating: 4.3,
      features: ['Sales Automation', 'Analytics', 'Multi-channel', 'AI Assistant'],
      status: 'available',
      pricing: 'Starter - Enterprise'
    },
    {
      name: 'Pipedrive',
      description: 'Sales-focused CRM designed for pipeline management',
      logo: '🟢',
      category: 'Sales CRM',
      rating: 4.5,
      features: ['Visual Pipeline', 'Activity Tracking', 'Email Integration', 'Mobile App'],
      status: 'available',
      pricing: 'Essential - Enterprise'
    },
    {
      name: 'Microsoft Dynamics 365',
      description: 'Enterprise CRM integrated with Microsoft ecosystem',
      logo: '🔵',
      category: 'Enterprise CRM',
      rating: 4.2,
      features: ['Sales Insights', 'Customer Service', 'Field Service', 'Power BI'],
      status: 'available',
      pricing: 'Enterprise'
    },
    {
      name: 'Freshsales',
      description: 'AI-powered CRM for high-velocity sales teams',
      logo: '🟡',
      category: 'Sales CRM',
      rating: 4.4,
      features: ['AI Scoring', 'Email Tracking', 'Phone Integration', 'Reports'],
      status: 'available',
      pricing: 'Free - Enterprise'
    }
  ];

  // Other integration categories
  const otherIntegrations = [
    {
      name: 'Zapier',
      description: 'Connect with 5,000+ apps through automation',
      icon: Zap,
      category: 'Automation',
      status: 'available'
    },
    {
      name: 'Slack',
      description: 'Get call notifications and updates in Slack',
      icon: MessageSquare,
      category: 'Communication',
      status: 'available'
    },
    {
      name: 'Google Calendar',
      description: 'Sync call schedules and appointments',
      icon: Calendar,
      category: 'Productivity',
      status: 'coming-soon'
    },
    {
      name: 'Webhooks',
      description: 'Send real-time events to your custom endpoints',
      icon: Webhook,
      category: 'Developer',
      status: 'available'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="mt-2 text-gray-600">
          Connect with top-rated CRMs and tools to streamline your workflow
        </p>
      </div>

      {/* Custom Integration Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Code className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Need a Custom Integration?</h3>
            <p className="text-gray-700 mb-4">
              We can build custom integrations tailored to your specific business needs. Whether it's a proprietary CRM, 
              legacy system, or unique workflow, our team can create a seamless connection.
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleRequestCustom}
                className="btn btn-primary flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Request Custom Integration
              </button>
              <button 
                onClick={handleViewDocs}
                className="btn btn-secondary flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                View API Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CRM Integrations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Top-Rated CRM Integrations</h2>
          <span className="text-sm text-gray-500">{crmIntegrations.length} available</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crmIntegrations.map((crm, idx) => (
            <div key={idx} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{crm.logo}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{crm.name}</h3>
                    <p className="text-xs text-gray-500">{crm.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <span className="text-sm font-semibold">{crm.rating}</span>
                  <span className="text-xs">★</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{crm.description}</p>
              
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Key Features:</p>
                <div className="flex flex-wrap gap-1">
                  {crm.features.map((feature, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">{crm.pricing}</span>
                <button 
                  onClick={() => handleConnectCRM(crm.name)}
                  className="btn btn-sm btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other Integrations */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Integrations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherIntegrations.map((integration, idx) => (
            <div key={idx} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <integration.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                    <span className="text-xs text-gray-500">{integration.category}</span>
                  </div>
                </div>
                <div>
                  {integration.status === 'available' ? (
                    <button 
                      onClick={() => handleConnectIntegration(integration.name)}
                      className="btn btn-sm btn-secondary"
                    >
                      Connect
                    </button>
                  ) : (
                    <span className="text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Integrate?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Centralized Data</h4>
              <p className="text-sm text-gray-600">
                Keep all customer interactions and call data synced across your tools
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Automated Workflows</h4>
              <p className="text-sm text-gray-600">
                Trigger actions automatically based on call outcomes and events
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Team Collaboration</h4>
              <p className="text-sm text-gray-600">
                Share insights and updates with your team in real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
