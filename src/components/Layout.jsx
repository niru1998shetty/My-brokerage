import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  ListChecks,
} from 'lucide-react';
import './Layout.css';

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const adminLinks = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/vendors', icon: <Users size={20} />, label: 'Vendors' },
    { to: '/admin/request-types', icon: <ListChecks size={20} />, label: 'Request Types' },
  ];

  const vendorLinks = [
    { to: '/vendor', icon: <LayoutDashboard size={20} />, label: 'My Dashboard' },
    { to: '/vendor/request-types', icon: <ListChecks size={20} />, label: 'Request Types' },
  ];

  const links = role === 'admin' ? adminLinks : vendorLinks;
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="layout">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Building2 size={22} />
          </div>
          <h2>My-Brokerage</h2>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="topbar-title">
              <h1>{role === 'admin' ? 'Admin Panel' : 'Vendor Panel'}</h1>
              <p>Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-user-info">
              <div className="name">{user?.name}</div>
              <div className="role">{role}</div>
            </div>
            <div className="topbar-avatar">{initials}</div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
