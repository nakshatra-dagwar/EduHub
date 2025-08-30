import Navbar from '../components/Navbar';
import styles from './login.module.css';
import { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message || 'If that account exists, you’ll get an email shortly.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'If that account exists, you’ll get an email shortly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <h2 className={styles.heading}>Forgot Password</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className={styles.input} placeholder="Enter your email" />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
          {message && (
            <p className={`${styles.message} ${message.includes('shortly') ? styles.success : styles.error}`}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
