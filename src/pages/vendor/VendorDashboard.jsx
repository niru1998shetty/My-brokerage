import { useState, useEffect } from 'react';
import { customerAPI, requestTypeAPI } from '../../services/api';
import Modal from '../../components/Modal';
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Bookmark,
  Search,
} from 'lucide-react';
import '../Dashboard.css';

const STATUS_DISPLAY = {
  NEW: 'New',
  IN_PROGRESS: 'In-Progress',
  BOOKED: 'Booked',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function VendorDashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [requestTypes, setRequestTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    area: '',
    typeOfRequest: '',
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const [custRes, typesRes] = await Promise.all([
          customerAPI.getMine({ limit: 100 }),
          requestTypeAPI.getAll(),
        ]);
        setCustomers(custRes.data);
        setRequestTypes(typesRes.data);
      } catch (err) {
        console.error('Failed to load data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const newCount = customers.filter((c) => c.status === 'NEW').length;
  const inProgress = customers.filter((c) => c.status === 'IN_PROGRESS').length;
  const booked = customers.filter((c) => c.status === 'BOOKED').length;
  const completed = customers.filter((c) => c.status === 'COMPLETED').length;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.mobile) return;
    setSubmitting(true);
    try {
      const res = await customerAPI.create(form);
      setCustomers((prev) => [res.data, ...prev]);
      setForm({ customerName: '', mobile: '', area: '', typeOfRequest: '' });
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to add customer:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (customerId, newStatus) => {
    setUpdatingId(customerId);
    try {
      await customerAPI.updateStatus(customerId, newStatus);
      setCustomers((prev) =>
        prev.map((c) => (c._id === customerId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error('Failed to update status:', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const statusClass = (status) => (STATUS_DISPLAY[status] || status).toLowerCase().replace(/\s+/g, '-');

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      c.customerName?.toLowerCase().includes(q) ||
      c.mobile?.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q) ||
      c.typeOfRequest?.toLowerCase().includes(q) ||
      (STATUS_DISPLAY[c.status] || c.status).toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="empty-state"><p>Loading customers...</p></div>;
  }

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon cyan">
            <Bookmark size={24} />
          </div>
          <div className="stat-info">
            <h3>{newCount}</h3>
            <p>New</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{inProgress}</h3>
            <p>In-Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{booked}</h3>
            <p>Booked</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{completed}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>My Customers</h2>
        <button className="add-btn" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="list-controls">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, mobile, area, request…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className={`filter-select ${statusFilter !== 'ALL' ? statusClass(statusFilter) : ''}`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In-Progress</option>
          <option value="BOOKED">Booked</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile</th>
                <th>Area</th>
                <th>Type of Request</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <p>{customers.length === 0 ? 'No customers yet. Click "Add Customer" to get started.' : 'No customers match your search.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isAdminOnly = c.status === 'COMPLETED' || c.status === 'CANCELLED';
                  return (
                    <tr key={c._id}>
                      <td style={{ color: 'white', fontWeight: 500 }}>{c.customerName}</td>
                      <td>{c.mobile}</td>
                      <td>{c.area}</td>
                      <td>{c.typeOfRequest}</td>
                      <td>
                        {isAdminOnly ? (
                          <span className={`status-badge ${statusClass(c.status)}`}>
                            {STATUS_DISPLAY[c.status] || c.status}
                          </span>
                        ) : (
                          <div className="status-select-wrapper">
                            <select
                              className={`status-select ${statusClass(c.status)}`}
                              value={c.status}
                              onChange={(e) => handleStatusChange(c._id, e.target.value)}
                              disabled={updatingId === c._id}
                            >
                              <option value="NEW">New</option>
                              <option value="IN_PROGRESS">In-Progress</option>
                              <option value="BOOKED">Booked</option>
                            </select>
                            {updatingId === c._id && <span className="status-spinner" />}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards">
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <p>{customers.length === 0 ? 'No customers yet. Click "Add Customer" to get started.' : 'No customers match your search.'}</p>
            </div>
          ) : (
            filteredCustomers.map((c) => {
              const isAdminOnly = c.status === 'COMPLETED' || c.status === 'CANCELLED';
              return (
                <div className="mobile-card" key={c._id}>
                  <div className="mobile-card-header">
                    <h4>{c.customerName}</h4>
                    <span className={`status-badge ${statusClass(c.status)}`}>
                      {updatingId === c._id && <span className="status-spinner" />}
                      {STATUS_DISPLAY[c.status] || c.status}
                    </span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Mobile</span>
                    <span className="mobile-card-value">{c.mobile}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Area</span>
                    <span className="mobile-card-value">{c.area}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Request</span>
                    <span className="mobile-card-value">{c.typeOfRequest}</span>
                  </div>
                  {!isAdminOnly && (
                    <div className="status-select-wrapper" style={{ marginTop: '0.75rem', width: '100%' }}>
                      {updatingId === c._id ? (
                        <div className="status-loading-mobile">
                          <span className="status-spinner" />
                          <span>{STATUS_DISPLAY[c.status] || c.status}</span>
                        </div>
                      ) : (
                        <select
                          className={`status-select ${statusClass(c.status)}`}
                          value={c.status}
                          onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          style={{ width: '100%' }}
                        >
                          <option value="NEW">New</option>
                          <option value="IN_PROGRESS">In-Progress</option>
                          <option value="BOOKED">Booked</option>
                        </select>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Customer">
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name</label>
            <input
              name="customerName"
              placeholder="Enter customer name"
              value={form.customerName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input
              name="mobile"
              placeholder="Enter mobile number"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Area</label>
            <input
              name="area"
              placeholder="Enter area"
              value={form.area}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Type of Request</label>
            <select name="typeOfRequest" value={form.typeOfRequest} onChange={handleChange} required>
              <option value="">Select request type</option>
              {requestTypes.map((rt) => (
                <option key={rt._id} value={rt.name}>{rt.name}</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
