import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import { ToastProvider } from './components/ToastContext.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import Transport from './pages/Transport.jsx';
import RoutesPage from './pages/Routes.jsx';
import Buses from './pages/Buses.jsx';
import PickupDrop from './pages/PickupDrop.jsx';
import PickupRecords from './pages/PickupRecords.jsx';
import TransportFees from './pages/TransportFees.jsx';

export default function App() {
  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/buses" element={<Buses />} />
            <Route path="/pickup-drop" element={<PickupDrop />} />
            <Route path="/pickup-records" element={<PickupRecords />} />
            <Route path="/transport-fees" element={<TransportFees />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
