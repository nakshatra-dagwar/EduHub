// Login page for all users. Redirects to the correct dashboard based on user role after login.
import Navbar from '../components/Navbar';
import styles from './login.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let dashboard = '/';
    if (user.role === 'STUDENT') dashboard = '/dashboard/student';
    else if (user.role === 'TEACHER') dashboard = '/dashboard/teacher';
    else if (user.role === 'ADMIN') dashboard = '/dashboard/admin';
    navigate(dashboard, { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (!passwordRegex.test(password)) {
        setMessage('Invalid password format. Use at least 8 chars including uppercase, lowercase, number, and special character.');
        setLoading(false);
        return;
      }
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password }, { withCredentials: true });
      setMessage(res.data.message || 'Login successful!');
      authLogin(res.data); // Save user info to context
      let dashboard = '/';
      if (res.data.role === 'STUDENT') dashboard = '/dashboard/student';
      else if (res.data.role === 'TEACHER') dashboard = '/dashboard/teacher';
      else if (res.data.role === 'ADMIN') dashboard = '/dashboard/admin';
      setTimeout(() => navigate(dashboard), 1000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <h2 className={styles.heading}>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={styles.input} placeholder="Enter your email" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className={styles.input} placeholder="Enter your password" />
                <button type="button" className={styles.toggleBtn} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {message && (
            <p className={`${styles.message} ${message.includes('success') ? styles.success : styles.error}`}>{message}</p>
          )}
          <div className={styles.linksRow}>
            <span>New user? </span>
            <Link to="/signup" className="text-brand" style={{ textDecoration: 'underline', fontWeight: 700 }}>Sign up</Link>
          </div>
          <div className={styles.linksRowSm}>
            <Link to="/forgot-password" className="text-brand" style={{ textDecoration: 'underline', fontWeight: 700 }}>Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 