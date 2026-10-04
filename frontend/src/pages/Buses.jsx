import React, { useCallback, useEffect, useState } from 'react';
import Topbar from '../components/Topbar.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TableSkeleton from '../components/TableSkeleton.jsx';
import { api } from '../api';
import { useToast } from '../components/ToastContext.jsx';

export default function Buses() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getBuses();
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
      <Topbar title="Buses" subtitle="Fleet and assigned drivers" onRefresh={load} refreshing={loading} />

      <div className="panel table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bus Number</th>
              <th>Model</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Driver</th>
              <th>Driver Phone</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={7} cols={6} />
            ) : (
              rows.map((b) => (
                <tr key={b.bus_id}>
                  <td className="mono">{b.bus_number}</td>
                  <td>{b.bus_model}</td>
                  <td>{b.capacity}</td>
                  <td>
                    <Badge label={b.status} />
                  </td>
                  <td>{b.driver_name}</td>
                  <td className="mono">{b.driver_phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <EmptyState title="No buses found" />}
      </div>
    </div>
  );
}
