import React, { useEffect, useState } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { api } from '../api';

export default function Topbar({ title, subtitle, onRefresh, refreshing }) {
  const [health, setHealth] = useState('checking');

  useEffect(() => {
    let mounted = true;
    const check = () => {
      api
        .health()
        .then((r) => mounted && setHealth(r.database === 'connected' ? 'online' : 'offline'))
        .catch(() => mounted && setHealth('offline'));
    };
    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-actions">
        <div className={`health-pill health-${health}`}>
          {health === 'online' ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>
            {health === 'checking' ? 'Checking…' : health === 'online' ? 'MySQL Live' : 'DB Offline'}
          </span>
        </div>
        {onRefresh && (
          <button className="btn btn-ghost" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            Refresh
          </button>
        )}
      </div>
    </header>
  );
}
