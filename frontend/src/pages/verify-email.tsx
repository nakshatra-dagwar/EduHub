import Navbar from '../components/Navbar';
import styles from './verify-email.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as any).email) {
      setEmail((location.state as any).email);
    }
  }, [location.state]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, { email, otp });
      setMessage(res.data.message || 'Email verified!');
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, { email });
      setMessage(res.data.message || 'OTP resent!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Resend failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <h2 className={styles.heading}>Verify Email</h2>
          <form onSubmit={handleVerify}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>OTP</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required className={styles.input} />
            </div>
            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          <button onClick={handleResend} disabled={resending || !email} className={styles.button}>
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
          {message && (
            <p className={`${styles.message} ${message.includes('success') || message.includes('verified') ? styles.success : styles.error}`}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 