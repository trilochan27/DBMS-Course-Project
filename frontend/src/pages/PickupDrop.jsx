import React, { useCallback, useEffect, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TableSkeleton from '../components/TableSkeleton.jsx';
import { api } from '../api';
import { useToast } from '../components/ToastContext.jsx';

export default function PickupDrop() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPickupDropPoints();
      setRows(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page">
      <Topbar title="Pickup & Drop Points" subtitle="Stops grouped by route, in order" onRefresh={load} refreshing={loading} />

      <div className="panel table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Stop #</th>
              <th>Pickup Point</th>
              <th>Pickup Time</th>
              <th>Drop Point</th>
              <th>Drop Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : (
              rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.route_name}</td>
                  <td>
                    <span className="order-chip">{r.stop_order}</span>
                  </td>
                  <td>{r.pickup_name}</td>
                  <td className="mono">{r.pickup_time}</td>
                  <td>{r.drop_name || '—'}</td>
                  <td className="mono">{r.drop_time || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <EmptyState title="No pickup/drop points found" />}
      </div>
    </div>
  );
}
