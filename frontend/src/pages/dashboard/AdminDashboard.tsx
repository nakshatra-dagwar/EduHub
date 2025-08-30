import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import styles from './adminDashboard.module.css';

const sidebarItems = [
  { key: 'home', label: 'Home' },
  { key: 'regions', label: 'Regions' },
  { key: 'courses', label: 'Courses' },
  { key: 'students', label: 'Students' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'assignments', label: 'Assignments' },
];

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { logout } = useAuth();

  // Regions
  const [regions, setRegions] = useState<any[]>([]);
  const [regionForm, setRegionForm] = useState({ name: '', currency: '', country_code: '' });

  // Courses
  const [courses, setCourses] = useState<any[]>([]);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    base_price: '',
    start_date: '',
    duration: '',
    target_audience: '',
    weekly_outline: '',
    prices: [{ region_id: '', price: '' }]
  });

  // Students
  const [students, setStudents] = useState<any[]>([]);

  // Teachers
  const [teachers, setTeachers] = useState<any[]>([]);

  // Quizzes
  // Quizzes removed from Admin UI per request

  // Assignments
  const [assignmentForm, setAssignmentForm] = useState({ teacher_id: '', course_id: '' });

  useEffect(() => {
    if (activePage === 'regions') fetchRegions();
    if (activePage === 'courses' || activePage === 'assignments') fetchCourses();
    if (activePage === 'students') fetchStudents();
    if (activePage === 'teachers' || activePage === 'assignments') fetchTeachers();
  }, [activePage]);

  // Preload data once to ensure dropdowns have options immediately
  useEffect(() => {
    if (!teachers.length) fetchTeachers();
    if (!courses.length) fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRegions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/regions`, { withCredentials: true });
      setRegions(res.data);
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, { withCredentials: true });
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/students`, { withCredentials: true });
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/teachers`, { withCredentials: true });
      setTeachers(res.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  // Quizzes removed

  const handleRegionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/regions`, regionForm, { withCredentials: true });
      setMessage('Region created successfully!');
      setRegionForm({ name: '', currency: '', country_code: '' });
      fetchRegions();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to create region');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const courseData = {
        ...courseForm,
        base_price: Number(courseForm.base_price),
        prices: courseForm.prices.filter(p => p.region_id && p.price).map(p => ({
          region_id: Number(p.region_id),
          price: Number(p.price)
        }))
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/courses`, courseData, { withCredentials: true });
      setMessage('Course created successfully!');
      setCourseForm({
        title: '', description: '', base_price: '', start_date: '', duration: '',
        target_audience: '', weekly_outline: '', prices: [{ region_id: '', price: '' }]
      });
      fetchCourses();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentVerification = async (studentId: number, isVerified: boolean) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/students/${studentId}/verify`, 
        { is_verified: isVerified }, { withCredentials: true });
      setMessage(`Student verification ${isVerified ? 'approved' : 'rejected'}!`);
      fetchStudents();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update verification');
    }
  };

  // Quiz UI removed

  // Quiz UI removed

  // Quiz UI removed

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/assign-course`, assignmentForm, { withCredentials: true });
      setMessage('Course assigned successfully!');
      setAssignmentForm({ teacher_id: '', course_id: '' });
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to assign course');
    } finally {
      setLoading(false);
    }
  };

  const addPriceField = () => {
    setCourseForm(prev => ({
      ...prev,
      prices: [...prev.prices, { region_id: '', price: '' }]
    }));
  };

  const removePriceField = (index: number) => {
    setCourseForm(prev => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index)
    }));
  };

  const updatePriceField = (index: number, field: string, value: string) => {
    setCourseForm(prev => ({
      ...prev,
      prices: prev.prices.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.nav}>
        <Navbar />
      </div>
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div className={styles.sidebarTitle}>Admin</div>
            {sidebarItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`${styles.sideBtn} ${activePage === item.key ? styles.sideBtnActive : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button onClick={logout} className={styles.logout}>
            Log out
          </button>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.container}>
            {message && (
              <div className={`${styles.alert} ${message.includes('successfully') ? styles.alertOk : styles.alertErr}`}>
                {message}
              </div>
            )}

            {activePage === 'home' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle} style={{ fontSize: 28 }}>Welcome, Admin!</h2>
                <p className={styles.muted} style={{ fontSize: 18 }}>Use the sidebar to manage regions, courses, students, teachers, and assignments.</p>
              </div>
            )}

            {activePage === 'regions' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Manage Regions</h2>
                <form onSubmit={handleRegionSubmit} style={{ marginBottom: 24 }}>
                  <div className={styles.inputsGrid3}>
                    <input
                      type="text"
                      placeholder="Region Name"
                      value={regionForm.name}
                      onChange={(e) => setRegionForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Currency"
                      value={regionForm.currency}
                      onChange={(e) => setRegionForm(prev => ({ ...prev, currency: e.target.value }))}
                      className={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Country Code"
                      value={regionForm.country_code}
                      onChange={(e) => setRegionForm(prev => ({ ...prev, country_code: e.target.value }))}
                      className={styles.input}
                    />
                  </div>
                  <button type="submit" disabled={loading} className={styles.buttonPrimary}>
                    {loading ? 'Creating...' : 'Create Region'}
                  </button>
                </form>
                <div>
                  <h3 className={styles.sectionTitle}>Existing Regions</h3>
                  {regions.map(region => (
                    <div key={region.region_id} className={styles.listCream}>
                      <strong>{region.name}</strong> - {region.currency} ({region.country_code})
                    </div>
                  ))}
                </div>
              </div>
            )}

              {activePage === 'courses' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Create Course</h2>
                <form onSubmit={handleCourseSubmit}>
                  <div className={styles.inputsGrid2}>
                    <input
                      type="text"
                      placeholder="Course Title"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className={styles.input}
                    />
                    <input
                      type="number"
                      placeholder="Base Price"
                      value={courseForm.base_price}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, base_price: e.target.value }))}
                      className={styles.input}
                    />
                  </div>
                  <textarea
                    placeholder="Description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={styles.textarea}
                  />
                  <div className={styles.inputsGrid3}>
                    <input
                      type="date"
                      placeholder="Start Date"
                      value={courseForm.start_date}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, start_date: e.target.value }))}
                      className={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                      className={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Target Audience"
                      value={courseForm.target_audience}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, target_audience: e.target.value }))}
                      className={styles.input}
                    />
                  </div>
                  <textarea
                    placeholder="Weekly Outline"
                    value={courseForm.weekly_outline}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, weekly_outline: e.target.value }))}
                    rows={3}
                    className={styles.textarea}
                  />
                  
                  <div className={styles.mb16}>
                    <h4 className={styles.sectionTitle}>Regional Prices</h4>
                    {courseForm.prices.map((price, index) => (
                      <div key={index} className={styles.row}>
                        <select
                           value={price.region_id}
                           onChange={(e) => updatePriceField(index, 'region_id', e.target.value)}
                          className={styles.select}
                           aria-label={`Select region for price ${index + 1}`}
                         >
                           <option value="">Select Region</option>
                           {regions.map(region => (
                             <option key={region.region_id} value={region.region_id}>{region.name}</option>
                           ))}
                         </select>
                        <input
                          type="number"
                          placeholder="Price"
                          value={price.price}
                          onChange={(e) => updatePriceField(index, 'price', e.target.value)}
                          className={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => removePriceField(index)}
                          className={styles.danger}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPriceField}
                      className={styles.buttonPrimary}
                    >
                      Add Price
                    </button>
                  </div>
                  
                  <button type="submit" disabled={loading} className={styles.buttonPrimary}>
                    {loading ? 'Creating...' : 'Create Course'}
                  </button>
                </form>

                  <div className={styles.mt32}>
                  <h3 className={styles.sectionTitle}>Available Courses</h3>
                    {courses.length === 0 ? (
                      <em>No courses found.</em>
                    ) : (
                      <ul className={styles.list}>
                        {courses.map((c: any) => (
                          <li key={c.course_id} className={styles.listCream}>
                            <div style={{ fontWeight: 600 }}>{c.title}</div>
                            {c.description && <div style={{ color: '#334155', fontSize: 14 }}>{c.description}</div>}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
            )}

            {activePage === 'students' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Student Verification</h2>
                {students.map(student => (
                    <div key={student.user_id} className={styles.listItem}>
                    <div className={styles.flexBetween}>
                      <div>
                        <strong>{student.full_name}</strong> - {student.email}
                        <br />
                        Grade: {student.grade_level} | Phone: {student.phone_no}
                        <br />
                        Status: <span style={{ color: student.is_verified ? '#28a745' : '#dc3545' }}>
                          {student.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div>
                        {!student.is_verified && (
                          <button onClick={() => handleStudentVerification(student.user_id, true)} className={styles.buttonApprove} style={{ marginRight: 8 }}>
                            Approve
                          </button>
                        )}
                        {student.is_verified && (
                          <button onClick={() => handleStudentVerification(student.user_id, false)} className={styles.buttonSmallDanger}>
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activePage === 'teachers' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Teachers</h2>
                {teachers.length === 0 ? (
                  <em>No teachers found.</em>
                ) : (
                  <ul className={styles.list}>
                    {teachers.map((t) => (
                      <li key={t.user_id} className={styles.listItem}>
                        <strong>{t.full_name || t.email}</strong>
                        <div className={styles.muted} style={{ fontSize: 14 }}>{t.email}</div>
                        {t.bio && <div className={styles.muted} style={{ marginTop: 6 }}>{t.bio}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Quizzes UI removed intentionally per requirements */}

            {activePage === 'assignments' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Assign Courses to Teachers</h2>
                <form onSubmit={handleAssignmentSubmit}>
                  <div className={styles.inputsGrid2}>
                                         <select
                       value={assignmentForm.teacher_id}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, teacher_id: e.target.value }))}
                      required
                      className={styles.select}
                       aria-label="Select teacher to assign course to"
                     >
                       <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.user_id} value={teacher.user_id}>{teacher.full_name || teacher.email}</option>
                      ))}
                     </select>
                     <select
                       value={assignmentForm.course_id}
                      onChange={(e) => setAssignmentForm(prev => ({ ...prev, course_id: e.target.value }))}
                      required
                      className={styles.select}
                       aria-label="Select course to assign"
                     >
                       <option value="">Select Course</option>
                       {courses.map(course => (
                         <option key={course.course_id} value={course.course_id}>{course.title}</option>
                       ))}
                     </select>
                  </div>
                  <button type="submit" disabled={loading} className={styles.buttonPrimary}>
                    {loading ? 'Assigning...' : 'Assign Course'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;