import { Phone, PhoneIncoming, PhoneOutgoing, Search, AlertCircle } from 'lucide-react';

export default function Calls() {
  // Mock test data for demonstration
  const calls = [
    { id: 1, time: '2 min ago', direction: 'inbound', phone: '+1 (817) 541-7385', language: 'English', duration: '4:23', status: 'completed', agent: 'Will - Collections' },
    { id: 2, time: '15 min ago', direction: 'outbound', phone: '+1 (555) 234-5678', language: 'English', duration: '6:45', status: 'completed', agent: 'Customer Support' },
    { id: 3, time: '32 min ago', direction: 'inbound', phone: '+34 612 345 678', language: 'Spanish', duration: '3:12', status: 'completed', agent: 'Sales Agent' },
    { id: 4, time: '1 hour ago', direction: 'inbound', phone: '+33 6 12 34 56 78', language: 'French', duration: '5:30', status: 'completed', agent: 'Customer Support' },
    { id: 5, time: '1 hour ago', direction: 'outbound', phone: '+49 151 12345678', language: 'German', duration: '2:18', status: 'completed', agent: 'Sales Agent' },
    { id: 6, time: '2 hours ago', direction: 'inbound', phone: '+1 (555) 987-6543', language: 'English', duration: '7:05', status: 'completed', agent: 'Will - Collections' },
    { id: 7, time: '2 hours ago', direction: 'outbound', phone: '+86 138 0000 0000', language: 'Chinese', duration: '4:42', status: 'completed', agent: 'Customer Support' },
    { id: 8, time: '3 hours ago', direction: 'inbound', phone: '+44 7700 900123', language: 'English', duration: '3:55', status: 'completed', agent: 'Sales Agent' },
    { id: 9, time: '3 hours ago', direction: 'inbound', phone: '+1 (555) 456-7890', language: 'English', duration: '8:20', status: 'completed', agent: 'Will - Collections' },
    { id: 10, time: '4 hours ago', direction: 'outbound', phone: '+81 90-1234-5678', language: 'Japanese', duration: '5:15', status: 'completed', agent: 'Customer Support' },
    { id: 11, time: '5 hours ago', direction: 'inbound', phone: '+39 320 1234567', language: 'Italian', duration: '4:08', status: 'completed', agent: 'Sales Agent' },
    { id: 12, time: '6 hours ago', direction: 'inbound', phone: '+1 (555) 321-0987', language: 'English', duration: '6:33', status: 'completed', agent: 'Will - Collections' },
    { id: 13, time: '7 hours ago', direction: 'outbound', phone: '+55 11 98765-4321', language: 'Portuguese', duration: '3:47', status: 'completed', agent: 'Customer Support' },
    { id: 14, time: '8 hours ago', direction: 'inbound', phone: '+91 98765 43210', language: 'Hindi', duration: '5:52', status: 'completed', agent: 'Sales Agent' },
    { id: 15, time: '9 hours ago', direction: 'inbound', phone: '+1 (555) 111-2222', language: 'English', duration: '4:15', status: 'completed', agent: 'Will - Collections' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Call History</h1>
        <p className="mt-2 text-gray-600">View and manage all your calls (Test data)</p>
      </div>

      {/* Test Data Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">Test Data</h3>
            <p className="text-sm text-blue-700 mt-1">
              The calls shown below are sample data for demonstration purposes. Real call data will appear here once your agents start handling calls.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search calls..." className="input pl-10" />
          </div>
          <select className="input w-48">
            <option>All Directions</option>
            <option>Inbound</option>
            <option>Outbound</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calls.map(call => (
                <tr key={call.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {call.direction === 'inbound' ? (
                        <PhoneIncoming className="h-4 w-4 text-primary-600 mr-2" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4 text-success-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-900 capitalize">{call.direction}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.agent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.language}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge badge-success">{call.status}</span>
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
