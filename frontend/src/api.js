const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = body?.message || 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return body;
}

export const api = {
  health: () => request('/health'),

  dashboardStats: () => request('/dashboard/stats'),

  getStudents: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/students${qs ? `?${qs}` : ''}`);
  },
  getCourses: () => request('/students/courses'),
  createStudent: (payload) =>
    request('/students', { method: 'POST', body: JSON.stringify(payload) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  getTransport: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/transport${qs ? `?${qs}` : ''}`);
  },

  getRoutes: () => request('/routes'),
  getBusCapacity: () => request('/routes/capacity'),
  getBuses: () => request('/buses'),
  getPickupDropPoints: () => request('/pickup-points'),

  getPickupRecords: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/pickup-records${qs ? `?${qs}` : ''}`);
  },

  getTransportFees: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/transport-fees${qs ? `?${qs}` : ''}`);
  },
};
