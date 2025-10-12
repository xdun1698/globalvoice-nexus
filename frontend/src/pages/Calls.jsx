import { Phone, PhoneIncoming, PhoneOutgoing, Search } from 'lucide-react';

export default function Calls() {
  const calls = [
    { id: 1, time: '10 min ago', direction: 'inbound', phone: '+1 (555) 123-4567', language: 'English', duration: '3:45', status: 'completed' },
    { id: 2, time: '25 min ago', direction: 'outbound', phone: '+34 612 345 678', language: 'Spanish', duration: '5:12', status: 'completed' },
    { id: 3, time: '1 hour ago', direction: 'inbound', phone: '+33 6 12 34 56 78', language: 'French', duration: '2:30', status: 'completed' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Call History</h1>
        <p className="mt-2 text-gray-600">View and manage all your calls</p>
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
