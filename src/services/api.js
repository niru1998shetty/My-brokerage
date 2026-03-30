const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  const stored = localStorage.getItem('my-brokerage-user');
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  }
  return null;
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  login: (mobile, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, password }),
    }),
};

// ─── Vendors (Admin) ────────────────────────────────────
export const vendorAPI = {
  getAll: () => request('/vendors'),
  getById: (id) => request(`/vendors/${id}`),
  create: (vendorData) =>
    request('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendorData),
    }),
};

// ─── Customers ──────────────────────────────────────────
export const customerAPI = {
  // Vendor: get own customers
  getMine: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/customers${query ? `?${query}` : ''}`);
  },
  // Admin: get all customers
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/customers/all${query ? `?${query}` : ''}`);
  },
  // Vendor: add customer
  create: (customerData) =>
    request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    }),
  // Update status
  updateStatus: (id, status) =>
    request(`/customers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ─── Request Types ──────────────────────────────────────
export const requestTypeAPI = {
  getAll: () => request('/request-types'),
  create: (name) =>
    request('/request-types', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  delete: (id) =>
    request(`/request-types/${id}`, { method: 'DELETE' }),
};
