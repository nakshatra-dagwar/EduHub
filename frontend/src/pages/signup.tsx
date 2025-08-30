// Signup page for all user roles. Shows dynamic form fields based on selected role.
import Navbar from '../components/Navbar';
import styles from './signup.module.css';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'STUDENT',
    grade_level: '',
    phone_no: '',
    parent_id: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const passwordRegex = useMemo(() =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
  , []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear password errors when user starts typing
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    if (!passwordRegex.test(form.password)) {
      setPasswordError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setPasswordError('');
    
    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      
      // Prepare payload based on role
      const payload: any = {
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        full_name: form.full_name,
        role: form.role,
      };
      
      if (form.role === 'STUDENT') {
        payload.grade_level = form.grade_level;
        payload.phone_no = form.phone_no;
        if (form.parent_id) payload.parent_id = form.parent_id;
      }
      
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, payload);
      setMessage(res.data.message || 'Signup successful!');
      setTimeout(() => navigate('/verify-email', { state: { email: form.email } }), 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.flexGrow}>
          <div className={styles.container}>
            <h2 className={styles.heading}>Create Account</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  className={styles.input} 
                  placeholder="Enter your email" 
                  title="Email" 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input 
                  type="text" 
                  name="full_name" 
                  value={form.full_name} 
                  onChange={handleChange} 
                  required 
                  className={styles.input} 
                  placeholder="Enter your full name" 
                  title="Full Name" 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    className={styles.input} 
                    placeholder="Enter your password" 
                    title="Password" 
                  />
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <small className={styles.helpText}>
                  Must include uppercase, lowercase, number, special character, min 8 characters
                </small>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrap}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    className={styles.input} 
                    placeholder="Confirm your password" 
                    title="Confirm Password" 
                  />
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              
              {passwordError && <p className={styles.error}>{passwordError}</p>}
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Role</label>
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={handleChange} 
                  className={styles.select} 
                  title="Role"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              {form.role === 'STUDENT' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Grade Level</label>
                    <input 
                      type="number" 
                      name="grade_level" 
                      value={form.grade_level} 
                      onChange={handleChange} 
                      required 
                      className={styles.input} 
                      min={1} 
                      max={12} 
                      placeholder="Enter grade level (1-12)" 
                      title="Grade Level" 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone_no" 
                      value={form.phone_no} 
                      onChange={handleChange} 
                      required 
                      className={styles.input} 
                      placeholder="Enter phone number" 
                      title="Phone Number" 
                    />
                  </div>
                </>
              )}
              
              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            {message && (
              <p className={`${styles.message} ${message.includes('success') ? styles.success : styles.error}`}>
                {message}
              </p>
            )}
            
            <p className={styles.loginLink}>
              Already have an account? <a href="/login" className={styles.link}>Login here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
