import React from 'react';

export default function StatCard({ icon: Icon, label, value, loading, accent = 'blue' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon accent-${accent}`}>
        <Icon size={20} />
      </div>
      <div className="stat-body">
        <div className="stat-value">{loading ? <span className="skeleton skeleton-stat" /> : value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
