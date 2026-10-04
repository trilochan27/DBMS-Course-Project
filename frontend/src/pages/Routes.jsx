import React, { useCallback, useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import Topbar from '../components/Topbar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { api } from '../api';
import { useToast } from '../components/ToastContext.jsx';

function CapacityBar({ assigned, capacity }) {
  const pct = capacity > 0 ? Math.min(100, Math.round((assigned / capacity) * 100)) : 0;
  const tone = pct >= 100 ? 'red' : pct >= 75 ? 'amber' : 'green';
  return (
    <div className="capacity-bar">
      <div className="capacity-track">
        <div className={`capacity-fill fill-${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="capacity-label">
        {assigned}/{capacity}
      </span>
    </div>
  );
}

export default function Routes() {
  const toast = useToast();
  const [routes, setRoutes] = useState([]);
  const [capacity, setCapacity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([api.getRoutes(), api.getBusCapacity()]);
      setRoutes(r1.data);
      setCapacity(r2.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const capacityByRoute = Object.fromEntries(capacity.map((c) => [c.route_id, c]));

  return (
    <div className="page">
      <Topbar title="Routes" subtitle="Route paths, stops, and live bus capacity" onRefresh={load} refreshing={loading} />

      {loading ? (
        <div className="skeleton-cards">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="panel skeleton-card" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <EmptyState title="No routes found" />
      ) : (
        <div className="route-grid">
          {routes.map((r) => {
            const cap = capacityByRoute[r.route_id];
            return (
              <div key={r.route_id} className="panel route-card">
                <div className="route-card-header">
                  <div>
                    <div className="route-id-tag">{r.route_id}</div>
                    <h3>{r.route_name}</h3>
                    <p className="route-path">
                      {r.start_location} <span>→</span> {r.end_location}
                    </p>
                  </div>
                  <div className="route-meta">
                    <div className="route-meta-item">
                      <span className="mono">{r.bus_number}</span>
                      <small>Bus</small>
                    </div>
                    <div className="route-meta-item">
                      <span>{r.distance_km} km</span>
                      <small>Distance</small>
                    </div>
                  </div>
                </div>

                {cap && <CapacityBar assigned={cap.assigned_students} capacity={cap.capacity} />}

                <div className="stop-list">
                  {r.stops.map((s) => (
                    <div key={s.pickupId} className="stop-item">
                      <div className="stop-dot">
                        <MapPin size={11} />
                      </div>
                      <span>
                        {s.order}. {s.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
