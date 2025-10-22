import { Plus, Search, Upload, AlertCircle, Mail, Phone, MapPin, Tag } from 'lucide-react';

export default function Contacts() {
  // Sample contact data for demonstration
  const sampleContacts = [
    {
      id: 1,
      name: 'John Anderson',
      email: 'john.anderson@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corporation',
      status: 'Active',
      tags: ['Customer', 'VIP'],
      lastContact: '2 days ago'
    },
    {
      id: 2,
      name: 'Sarah Martinez',
      email: 'sarah.m@techstartup.io',
      phone: '+1 (555) 234-5678',
      company: 'Tech Startup Inc',
      status: 'Active',
      tags: ['Lead', 'Hot'],
      lastContact: '5 days ago'
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'mchen@globalcorp.com',
      phone: '+1 (555) 345-6789',
      company: 'Global Corp',
      status: 'Pending',
      tags: ['Prospect'],
      lastContact: '1 week ago'
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      email: 'emily.r@consulting.com',
      phone: '+1 (555) 456-7890',
      company: 'Rodriguez Consulting',
      status: 'Active',
      tags: ['Customer', 'Partner'],
      lastContact: '3 days ago'
    },
    {
      id: 5,
      name: 'David Thompson',
      email: 'dthompson@enterprise.net',
      phone: '+1 (555) 567-8901',
      company: 'Enterprise Solutions',
      status: 'Active',
      tags: ['Customer'],
      lastContact: '1 day ago'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-2 text-gray-600">Manage your contact list (Sample data)</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import CSV
          </button>
          <button className="btn btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Sample Data Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">Sample Data</h3>
            <p className="text-sm text-blue-700 mt-1">
              The contacts shown below are sample data for demonstration purposes. Real contacts will appear here once you add them.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search contacts..." className="input pl-10" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        {contact.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        {contact.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      {contact.company}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      contact.status === 'Active' ? 'badge-success' : 'badge-warning'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.lastContact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
