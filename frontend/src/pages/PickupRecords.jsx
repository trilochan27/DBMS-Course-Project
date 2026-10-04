import React, { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Topbar from '../components/Topbar.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TableSkeleton from '../components/TableSkeleton.jsx';
import { api } from '../api';
import { useToast } from '../components/ToastContext.jsx';

export default function PickupRecords() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPickupRecords({ search, page, limit: 15 });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="page">
      <Topbar title="Pickup Records" subtitle="Daily pickup status log" onRefresh={load} refreshing={loading} />

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search by student or status…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="panel table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Student</th>
              <th>Pickup Date</th>
              <th>Pickup Time</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={10} cols={6} />
            ) : (
              rows.map((r) => (
                <tr key={r.record_id}>
                  <td className="mono">{r.record_id}</td>
                  <td>{r.student_name}</td>
                  <td>{new Date(r.pickup_date).toLocaleDateString()}</td>
                  <td className="mono">{r.pickup_time}</td>
                  <td>
                    <Badge label={r.status} />
                  </td>
                  <td className="text-muted">{r.remarks || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && rows.length === 0 && <EmptyState title="No pickup records found" />}

        {!loading && rows.length > 0 && (
          <div className="pagination">
            <span>
              Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total records
            </span>
            <div className="pagination-controls">
              <button className="icon-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={16} />
              </button>
              <button
                className="icon-btn"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
