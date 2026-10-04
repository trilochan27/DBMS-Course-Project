import React, { useCallback, useEffect, useState } from 'react';
import { Search, Plus, Trash2, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import Topbar from '../components/Topbar.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import TableSkeleton from '../components/TableSkeleton.jsx';
import { api } from '../api';
import { useToast } from '../components/ToastContext.jsx';

const COURSES = ['B.Tech AIML', 'B.Tech CSE', 'B.Tech ECE', 'B.Tech EEE', 'BBA', 'B.Com', 'B.Sc'];
const SECTIONS = ['A', 'B', 'C', 'D'];

const EMPTY_FORM = {
  studentId: '',
  studentName: '',
  course: '',
  section: '',
  parentName: '',
  parentContact: '',
};

const DEMO_FORM = {
  studentId: 'S286',
  studentName: 'Trilochan Demo',
  course: 'B.Tech AIML',
  section: 'A',
  parentName: 'Demo Parent',
  parentContact: '9876543210',
};

export default function Students() {
  const toast = useToast();

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getStudents({ search, course, page, limit: 15 });
      setRows(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, course, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, course]);

  function validate(f) {
    const errors = {};
    if (!f.studentId.trim()) errors.studentId = 'Student ID is required';
    if (!f.studentName.trim()) errors.studentName = 'Student name is required';
    if (!f.course.trim()) errors.course = 'Course is required';
    if (!f.section.trim()) errors.section = 'Section is required';
    if (!f.parentName.trim()) errors.parentName = 'Parent name is required';
    if (!/^[0-9]{10,15}$/.test(f.parentContact.trim())) {
      errors.parentContact = 'Enter a valid phone number';
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      await api.createStudent(form);
      toast.success('Student added successfully');
      setShowAdd(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setPage(1);
      load();
    } catch (err) {
      if (err.status === 409) {
        setFormErrors({ studentId: 'Student ID already exists' });
      }
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteStudent(deleteTarget.student_id);
      toast.success('Student deleted successfully');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page">
      <Topbar title="Students" subtitle="Live view from the student table" onRefresh={load} refreshing={loading} />

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search by ID, name or parent…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="select" value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="">All Courses</option>
          {COURSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="toolbar-spacer" />

        <button
          className="btn btn-ghost"
          onClick={() => {
            setForm(DEMO_FORM);
            setFormErrors({});
            setShowAdd(true);
          }}
        >
          <GraduationCap size={16} />
          Load Demo Student
        </button>

        <button
          className="btn btn-primary"
          onClick={() => {
            setForm(EMPTY_FORM);
            setFormErrors({});
            setShowAdd(true);
          }}
        >
          <Plus size={16} />
          Add Student
        </button>
      </div>

      <div className="panel table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Section</th>
              <th>Parent Name</th>
              <th>Parent Contact</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={8} cols={7} />
            ) : (
              rows.map((s) => (
                <tr key={s.student_id} className={s.student_id === 'S286' ? 'row-demo' : ''}>
                  <td className="mono">{s.student_id}</td>
                  <td>{s.student_name}</td>
                  <td>
                    <span className="course-chip">{s.course}</span>
                  </td>
                  <td>{s.section}</td>
                  <td>{s.parent_name}</td>
                  <td className="mono">{s.parent_contact}</td>
                  <td className="col-actions">
                    <button className="icon-btn danger" onClick={() => setDeleteTarget(s)} aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && rows.length === 0 && (
          <EmptyState title="No students found" subtitle="Try a different search term or clear filters." />
        )}

        {!loading && rows.length > 0 && (
          <div className="pagination">
            <span>
              Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total students
            </span>
            <div className="pagination-controls">
              <button
                className="icon-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
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

      {showAdd && (
        <Modal
          title="Add Student"
          onClose={() => setShowAdd(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" form="add-student-form" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Add Student'}
              </button>
            </>
          }
        >
          <form id="add-student-form" className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label>Student ID</label>
              <input
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                placeholder="S286"
              />
              {formErrors.studentId && <span className="field-error">{formErrors.studentId}</span>}
            </div>

            <div className="field">
              <label>Student Name</label>
              <input
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                placeholder="Trilochan Demo"
              />
              {formErrors.studentName && <span className="field-error">{formErrors.studentName}</span>}
            </div>

            <div className="field">
              <label>Course</label>
              <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                <option value="">Select course</option>
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {formErrors.course && <span className="field-error">{formErrors.course}</span>}
            </div>

            <div className="field">
              <label>Section</label>
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                <option value="">Select section</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {formErrors.section && <span className="field-error">{formErrors.section}</span>}
            </div>

            <div className="field">
              <label>Parent Name</label>
              <input
                value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                placeholder="Demo Parent"
              />
              {formErrors.parentName && <span className="field-error">{formErrors.parentName}</span>}
            </div>

            <div className="field">
              <label>Parent Contact</label>
              <input
                value={form.parentContact}
                onChange={(e) => setForm({ ...form, parentContact: e.target.value })}
                placeholder="9876543210"
              />
              {formErrors.parentContact && <span className="field-error">{formErrors.parentContact}</span>}
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this student?"
          message={`Are you sure you want to delete ${deleteTarget.student_name} (${deleteTarget.student_id})? This action cannot be undone.`}
          confirmLabel="Delete Student"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
