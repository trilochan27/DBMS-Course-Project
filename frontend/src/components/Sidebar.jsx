import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Route as RouteIcon, Bus, MapPinned,
  ClipboardList, Wallet, Waypoints,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/transport', label: 'Transport', icon: Waypoints },
  { to: '/routes', label: 'Routes', icon: RouteIcon },
  { to: '/buses', label: 'Buses', icon: Bus },
  { to: '/pickup-drop', label: 'Pickup & Drop Points', icon: MapPinned },
  { to: '/pickup-records', label: 'Pickup Records', icon: ClipboardList },
  { to: '/transport-fees', label: 'Transport Fees', icon: Wallet },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <Bus size={18} />
        </div>
        <div>
          <div className="brand-title">Transport MS</div>
          <div className="brand-subtitle">school_transport_db</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-dot" />
        <span>Connected to MySQL</span>
      </div>
    </aside>
  );
}
