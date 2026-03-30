import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(mobile.trim(), password);
      if (result.success) {
        navigate(result.role === 'admin' ? '/admin' : '/vendor');
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-particles">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Building2 size={32} />
          </div>
          <h1>My-Brokerage</h1>
          <p>Management Portal</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label>Mobile Number</label>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
              <Phone />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            <span>
              {loading ? 'Signing In...' : 'Sign In'} {!loading && <ArrowRight size={18} />}
            </span>
          </button>
        </form>

        <div className="demo-creds">
          <p>Demo Credentials</p>
          <div className="cred-row">
            <span className="cred-chip">Admin: 9999999999 / admin@123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
