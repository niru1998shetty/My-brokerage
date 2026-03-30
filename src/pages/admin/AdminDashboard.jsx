import { useState, useEffect } from 'react';
import { vendorAPI, customerAPI } from '../../services/api';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
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
    try {
      await customerAPI.updateStatus(customerId, newStatus);
      setCustomers((prev) =>
        prev.map((c) => (c._id === customerId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error('Failed to update status:', err.message);
    }
  };

  const statusClass = (status) => (STATUS_DISPLAY[status] || status).toLowerCase().replace(/\s+/g, '-');

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
              {customers.map((c) => {
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
                      <select
                        className="status-select"
                        value={c.status}
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In-Progress</option>
                        <option value="BOOKED">Booked</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards">
          {customers.map((c) => {
            const vendor = getVendor(c.vendorId);
            return (
              <div className="mobile-card" key={c._id}>
                <div className="mobile-card-header">
                  <h4>{c.customerName}</h4>
                  <span className={`status-badge ${statusClass(c.status)}`}>{STATUS_DISPLAY[c.status] || c.status}</span>
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
                <div style={{ marginTop: '0.75rem' }}>
                  <select
                    className="status-select"
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
