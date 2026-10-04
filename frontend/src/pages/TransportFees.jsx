import React, { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Topbar from '../components/Topbar.jsx';
import Badge from '../components/Badge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TableSkeleton from '../components/TableSkeleton.jsx';
import { api } from '../api';
import { useToast } from '../components/ToastContext.jsx';

export default function TransportFees() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTransportFees({ search, page, limit: 15 });
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
      <Topbar title="Transport Fees" subtitle="Fee records and payment status" onRefresh={load} refreshing={loading} />

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
              <th>Fee ID</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Payment Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={10} cols={6} />
            ) : (
              rows.map((f) => (
                <tr key={f.fee_id}>
                  <td className="mono">{f.fee_id}</td>
                  <td>{f.student_name}</td>
                  <td className="mono">₹{Number(f.amount).toLocaleString('en-IN')}</td>
                  <td>{new Date(f.due_date).toLocaleDateString()}</td>
                  <td>{f.payment_date ? new Date(f.payment_date).toLocaleDateString() : '—'}</td>
                  <td>
                    <Badge label={f.payment_status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && rows.length === 0 && <EmptyState title="No transport fee records found" />}

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
