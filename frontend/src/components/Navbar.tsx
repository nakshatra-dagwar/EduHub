// Global navigation bar. Shows links, user dropdown, and handles dashboard navigation and logout.
import { Link, useNavigate } from 'react-router-dom';
import EduHubLogo from './EduHubLogo';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdown, setDropdown] = useState(false);
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'STUDENT') return '/dashboard/student';
    if (user.role === 'TEACHER') return '/dashboard/teacher';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    return '/';
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand brand">
        <EduHubLogo width={36} height={36} ariaLabel="EduHub" />
      </span>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
         <Link to="/courses" className="navbar-link">Get Courses</Link>
        {user ? (
          <div
            className="navbar-user"
            onMouseEnter={() => setDropdown(true)}
            onMouseLeave={() => setDropdown(false)}
          >
            <span className="userIcon">👤</span>
            {dropdown && (
              <div className="userMenu">
                <button className="userMenuBtn" onClick={() => { setDropdown(false); navigate(getDashboardPath()); }}>
                  Dashboard
                </button>
                <button className="userMenuBtn" onClick={logout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="navbar-link">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 