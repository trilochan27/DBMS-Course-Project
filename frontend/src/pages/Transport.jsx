import React, { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Topbar from '../components/Topbar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TableSkeleton from '../components/TableSkeleton.jsx';
import { api } from '../api';
import { useToast } from '../components/ToastContext.jsx';

export default function Transport() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTransport({ search });
      setRows(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="page">
      <Topbar
        title="Transport"
        subtitle="Student → Pickup → Route → Bus → Driver (JOIN query)"
        onRefresh={load}
        refreshing={loading}
      />

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by student or route…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Pickup Point</th>
              <th>Drop Point</th>
              <th>Route</th>
              <th>Bus</th>
              <th>Driver</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : (
              rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.student_name}</td>
                  <td>{r.pickup_name}</td>
                  <td>{r.drop_name}</td>
                  <td>{r.route_name}</td>
                  <td className="mono">{r.bus_number}</td>
                  <td>{r.driver_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <EmptyState title="No transport assignments found" />}
      </div>
    </div>
  );
}
