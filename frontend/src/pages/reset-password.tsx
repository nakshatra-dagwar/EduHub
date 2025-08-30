import Navbar from '../components/Navbar';
import styles from './login.module.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token') || '';
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!passwordRegex.test(password)) {
      setMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        token,
        password,
        confirmPassword,
      });
      setMessage(res.data.message || 'Password has been reset successfully.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <h2 className={styles.heading}>Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="password">New Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className={styles.input} placeholder="Enter new password" />
              <small className="text-slate-600">Must include A-Z, a-z, 0-9, special char, min 8 chars.</small>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={styles.input} placeholder="Confirm new password" />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          {message && (
            <p className={`${styles.message} ${message.includes('successfully') ? styles.success : styles.error}`}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
