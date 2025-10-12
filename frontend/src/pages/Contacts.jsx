import { Plus, Search, Upload } from 'lucide-react';

export default function Contacts() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-2 text-gray-600">Manage your contact list</p>
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

      <div className="card">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search contacts..." className="input pl-10" />
        </div>
        <p className="text-center text-gray-500 py-8">No contacts yet. Add your first contact to get started.</p>
      </div>
    </div>
  );
}
