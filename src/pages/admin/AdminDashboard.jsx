import { useState, useEffect } from 'react';
import { vendorAPI, customerAPI } from '../../services/api';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
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

export default function AdminDashboard() {
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorRes, customerRes] = await Promise.all([
          vendorAPI.getAll(),
          customerAPI.getAll({ limit: 100 }),
        ]);
        setVendors(vendorRes.data);
        setCustomers(customerRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inProgress = customers.filter((c) => c.status === 'IN_PROGRESS').length;
  const completed = customers.filter((c) => c.status === 'COMPLETED').length;
  const cancelled = customers.filter((c) => c.status === 'CANCELLED').length;

  const getVendor = (vendorId) => {
    if (typeof vendorId === 'object' && vendorId !== null) return vendorId;
    return vendors.find((v) => v._id === vendorId);
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
    const vendor = getVendor(c.vendorId);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      c.customerName?.toLowerCase().includes(q) ||
      c.mobile?.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q) ||
      c.typeOfRequest?.toLowerCase().includes(q) ||
      (STATUS_DISPLAY[c.status] || c.status).toLowerCase().includes(q) ||
      vendor?.name?.toLowerCase().includes(q) ||
      vendor?.mobile?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="empty-state"><p>Loading dashboard...</p></div>;
  }

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{customers.length}</h3>
            <p>Total Customers</p>
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
          <div className="stat-icon green">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{cancelled}</h3>
            <p>Cancelled</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>All Customers</h2>
      </div>

      <div className="list-controls">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, mobile, area, request, vendor…"
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
                <th>Vendor</th>
                <th>Vendor Mobile</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><p>No customers match your search.</p></div></td></tr>
              ) : filteredCustomers.map((c) => {
                const vendor = getVendor(c.vendorId);
                return (
                  <tr key={c._id}>
                    <td style={{ color: 'white', fontWeight: 500 }}>{c.customerName}</td>
                    <td>{c.mobile}</td>
                    <td>{c.area}</td>
                    <td>{c.typeOfRequest}</td>
                    <td>{vendor?.name || '—'}</td>
                    <td>{vendor?.mobile || '—'}</td>
                    <td>
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
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        {updatingId === c._id && <span className="status-spinner" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards">
          {filteredCustomers.length === 0 ? (
            <div className="empty-state"><p>No customers match your search.</p></div>
          ) : filteredCustomers.map((c) => {
            const vendor = getVendor(c.vendorId);
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
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Vendor</span>
                  <span className="mobile-card-value">{vendor?.name} ({vendor?.mobile})</span>
                </div>
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
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
