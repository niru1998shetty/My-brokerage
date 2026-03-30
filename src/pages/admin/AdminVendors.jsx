import { useState, useEffect } from 'react';
import { vendorAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { Plus, Users, Search } from 'lucide-react';
import '../Dashboard.css';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    password: '',
    email: '',
    area: '',
    state: '',
    platformName: '',
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await vendorAPI.getAll();
        setVendors(res.data);
      } catch (err) {
        console.error('Failed to load vendors:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.password) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await vendorAPI.create(form);
      setVendors((prev) => [...prev, res.data]);
      setForm({ name: '', mobile: '', password: '', email: '', area: '', state: '', platformName: '' });
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="empty-state"><p>Loading vendors...</p></div>;
  }

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{vendors.length}</h3>
            <p>Total Vendors</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>Vendors</h2>
        <button className="add-btn" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          Add Vendor
        </button>
      </div>

      <div className="list-controls">
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, mobile, area, state, platform…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Mobile</th>
                <th>Area</th>
                <th>State</th>
                <th>Platform</th>
              </tr>
            </thead>
            <tbody>
              {vendors
                .filter((v) => {
                  const q = searchQuery.toLowerCase();
                  return !q ||
                    v.name?.toLowerCase().includes(q) ||
                    v.mobile?.toLowerCase().includes(q) ||
                    v.area?.toLowerCase().includes(q) ||
                    v.state?.toLowerCase().includes(q) ||
                    v.platformName?.toLowerCase().includes(q);
                })
                .map((v) => (
                <tr key={v._id}>
                  <td style={{ color: 'white', fontWeight: 500 }}>{v.name}</td>
                  <td>{v.mobile}</td>
                  <td>{v.area}</td>
                  <td>{v.state}</td>
                  <td>
                    <span className="status-badge new">{v.platformName}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards">
          {vendors
            .filter((v) => {
              const q = searchQuery.toLowerCase();
              return !q ||
                v.name?.toLowerCase().includes(q) ||
                v.mobile?.toLowerCase().includes(q) ||
                v.area?.toLowerCase().includes(q) ||
                v.state?.toLowerCase().includes(q) ||
                v.platformName?.toLowerCase().includes(q);
            })
            .map((v) => (
            <div className="mobile-card" key={v._id}>
              <div className="mobile-card-header">
                <h4>{v.name}</h4>
                <span className="status-badge new">{v.platformName}</span>
              </div>
              <div className="mobile-card-row">
                <span className="mobile-card-label">Mobile</span>
                <span className="mobile-card-value">{v.mobile}</span>
              </div>
              <div className="mobile-card-row">
                <span className="mobile-card-label">Area</span>
                <span className="mobile-card-value">{v.area}</span>
              </div>
              <div className="mobile-card-row">
                <span className="mobile-card-label">State</span>
                <span className="mobile-card-value">{v.state}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Vendor">
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="login-error" style={{ marginBottom: '0.5rem' }}>{error}</div>}
          <div className="form-group">
            <label>Vendor Name</label>
            <input
              name="name"
              placeholder="Enter vendor name"
              value={form.name}
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
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter password (min 6 chars)"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email (Optional)</label>
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
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
            <label>State</label>
            <input
              name="state"
              placeholder="Enter state"
              value={form.state}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Platform Name</label>
            <input
              name="platformName"
              placeholder="e.g. MagicBricks, 99acres"
              value={form.platformName}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
