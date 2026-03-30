import { useState, useEffect } from 'react';
import { requestTypeAPI } from '../../services/api';
import { Plus, ListChecks, Trash2 } from 'lucide-react';
import '../Dashboard.css';
import './RequestTypes.css';

const FORMAT_REGEX = /^(Buy|Rent)\s*-\s*.+$/i;

export default function RequestTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await requestTypeAPI.getAll();
        setTypes(res.data);
      } catch (err) {
        console.error('Failed to load request types:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  const isValid = FORMAT_REGEX.test(newType.trim());

  const handleAdd = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await requestTypeAPI.create(newType.trim());
      setTypes((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewType('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isValid && !submitting) {
      handleAdd();
    }
  };

  const handleDeleteClick = (id) => setConfirmId(id);

  const handleDeleteConfirm = async () => {
    setDeletingId(confirmId);
    setConfirmId(null);
    try {
      await requestTypeAPI.delete(confirmId);
      setTypes((prev) => prev.filter((t) => t._id !== confirmId));
    } catch (err) {
      console.error('Failed to delete request type:', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="empty-state"><p>Loading request types...</p></div>;
  }

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-icon purple">
            <ListChecks size={24} />
          </div>
          <div className="stat-info">
            <h3>{types.length}</h3>
            <p>Request Types</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>Manage Request Types</h2>
      </div>

      <div className="rt-add-section">
        <div className="rt-input-row">
          <input
            type="text"
            className="rt-input"
            placeholder='e.g. Buy - Penthouse  or  Rent - 4BHK'
            value={newType}
            onChange={(e) => { setNewType(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="add-btn rt-add-btn"
            onClick={handleAdd}
            disabled={!isValid || submitting}
          >
            <Plus size={18} />
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </div>
        {newType && !isValid && (
          <p className="rt-hint">Format: <strong>Buy - &lt;type&gt;</strong> or <strong>Rent - &lt;type&gt;</strong></p>
        )}
        {error && <p className="rt-error">{error}</p>}
      </div>

      <div className="table-container">
        {confirmId && (
          <div className="rt-confirm-overlay">
            <div className="rt-confirm-box">
              <p>Delete <strong>{types.find((t) => t._id === confirmId)?.name}</strong>?</p>
              <div className="rt-confirm-actions">
                <button className="rt-confirm-cancel" onClick={() => setConfirmId(null)}>Cancel</button>
                <button className="rt-confirm-delete" onClick={handleDeleteConfirm}>Delete</button>
              </div>
            </div>
          </div>
        )}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Request Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {types.map((t, i) => (
                <tr key={t._id}>
                  <td>{i + 1}</td>
                  <td style={{ color: 'white', fontWeight: 500 }}>{t.name}</td>
                  <td className="rt-action-cell">
                    {deletingId === t._id ? (
                      <span className="status-spinner rt-delete-spinner" />
                    ) : (
                      <button className="rt-delete-btn" onClick={() => handleDeleteClick(t._id)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mobile-cards">
          {types.map((t, i) => (
            <div className="mobile-card" key={t._id}>
              <div className="mobile-card-header">
                <h4>{t.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="status-badge new">#{i + 1}</span>
                  {deletingId === t._id ? (
                    <span className="status-spinner" style={{ color: '#f87171' }} />
                  ) : (
                    <button className="rt-delete-btn" onClick={() => handleDeleteClick(t._id)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
