import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import AgentBuilder from './pages/AgentBuilder';
import Calls from './pages/Calls';
import CallDetails from './pages/CallDetails';
import Contacts from './pages/Contacts';
import Analytics from './pages/Analytics';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import PhoneNumbers from './pages/PhoneNumbers';
import VapiSync from './pages/VapiSync';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/new" element={<AgentBuilder />} />
        <Route path="/agents/:id/edit" element={<AgentBuilder />} />
        <Route path="/calls" element={<Calls />} />
        <Route path="/calls/:id" element={<CallDetails />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/phone-numbers" element={<PhoneNumbers />} />
        <Route path="/vapi-sync" element={<VapiSync />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
