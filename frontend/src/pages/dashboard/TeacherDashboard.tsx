import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styles from './teacherDashboard.module.css';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = [
  { key: 'home', label: 'Home' },
  { key: 'profile', label: 'Profile' },
  { key: 'courses', label: 'Courses' },
  { key: 'schedule', label: 'Schedule Class' },
  { key: 'uploadTest', label: 'Upload Test' }, // Added upload test section
];

const TeacherDashboard = () => {
  const [activePage, setActivePage] = useState('home');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [classMsg, setClassMsg] = useState('');
  const [classJoinUrl, setClassJoinUrl] = useState('');
  const [classForm, setClassForm] = useState({ course_id: '', topic: '', start_time: '', duration: '' });
  const [zoomConnected, setZoomConnected] = useState(false);
  const [scheduledClasses, setScheduledClasses] = useState<{ [courseId: string]: any | null }>({});
  const [testForm, setTestForm] = useState({ course_id: '', title: '', description: '', test_date: '', test_link: '' });
  const [testMsg, setTestMsg] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    // Check for zoom_connected in URL query params or localStorage
    const params = new URLSearchParams(window.location.search);
    if (params.get('zoom_connected') === 'true') {
      setZoomConnected(true);
      localStorage.setItem('zoomConnected', 'true');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (localStorage.getItem('zoomConnected') === 'true') {
      setZoomConnected(true);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard/profile`, { withCredentials: true });
        setProfile(profRes.data);
      } catch {}
    };
    fetchProfile();
  }, []);


  useEffect(() => {
    const fetchScheduledClasses = async () => {
      if (!profile?.courses) return;
      const result: { [courseId: string]: any | null } = {};
      for (const course of profile.courses) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/classes/by-course/${course.course_id}`, { withCredentials: true });
          result[course.course_id] = res.data;
        } catch {
          result[course.course_id] = null;
        }
      }
      setScheduledClasses(result);
    };
    if (profile?.courses?.length) fetchScheduledClasses();
  }, [profile]);

  const handleClassChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setClassForm({ ...classForm, [e.target.name]: e.target.value });
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClassMsg('');
    setClassJoinUrl('');
    // Guard: teacher can act only on assigned courses
    const assigned = Array.isArray(profile?.courses) && profile.courses.some((c: any) => String(c.course_id) === String(classForm.course_id));
    if (!assigned) {
      setClassMsg("You are not assigned to this course.");
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/classes`, {
        ...classForm,
        duration: Number(classForm.duration),
      }, { withCredentials: true });
      setClassMsg('Class scheduled!');
      setClassJoinUrl(res.data.join_url);
    } catch (err: any) {
      setClassMsg(err.response?.data?.message || 'Failed to schedule class');
    }
  };

  const handleConnectZoom = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/zoom/auth`;
  };

  // Handle changes in the upload test form
  const handleTestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTestForm({ ...testForm, [e.target.name]: e.target.value });
  };
  // Handle upload test form submission
  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestMsg('');
    // Guard: teacher can act only on assigned courses
    const assigned = Array.isArray(profile?.courses) && profile.courses.some((c: any) => String(c.course_id) === String(testForm.course_id));
    if (!assigned) {
      setTestMsg("You are not assigned to this course.");
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/teacher/dashboard/upload-test`, {
        ...testForm,
      }, { withCredentials: true });
      setTestMsg('Test uploaded successfully!');
      setTestForm({ course_id: '', title: '', description: '', test_date: '', test_link: '' });
    } catch (err: any) {
      setTestMsg(err.response?.data?.message || 'Failed to upload test');
    }
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
            <div className={styles.sidebarTitle}>Teacher</div>
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
            {activePage === 'home' && (
              <div className={`${styles.card} ${styles.cardNarrow}`}>
                <h2 className={styles.cardTitle} style={{ fontSize: 28 }}>Welcome, {profile?.full_name || 'Teacher'}!</h2>
                <p className={styles.muted} style={{ fontSize: 18 }}>Use the sidebar to navigate your profile, courses, schedule classes, and view parents.</p>
              </div>
            )}
            {activePage === 'profile' && profile && (
              <div className={`${styles.card} ${styles.cardNarrow}`}>
                <h2 className={styles.cardTitle}>Profile</h2>
                <div style={{ marginBottom: 24, fontSize: 17 }}>
                  <strong>Name:</strong> {profile.full_name}<br />
                  <strong>Email:</strong> {profile.email}<br />
                  <strong>Bio:</strong> {profile.bio}<br />
                </div>
                {!zoomConnected && (
                  <div style={{ marginTop: 16 }}>
                    <button onClick={handleConnectZoom} style={{ background: '#00BC83', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 2rem', fontWeight: 600, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,23,42,0.10)' }}>Connect Zoom</button>
                    <div style={{ color: 'red', marginTop: 10, fontSize: 15 }}>You must connect Zoom before scheduling classes.</div>
                  </div>
                )}
              </div>
            )}
            {activePage === 'courses' && profile && (
              <div className={`${styles.card} ${styles.cardNarrow}`}>
                <h2 className={styles.cardTitle}>Courses</h2>
                <ul className={styles.list} style={{ fontSize: 17 }}>
                  {profile.courses?.map((c: any) => (
                    <li key={c.course_id} style={{ marginBottom: 10 }}><strong>{c.title}</strong> — {c.description}</li>
                  ))}
                </ul>
              </div>
            )}
            {activePage === 'schedule' && (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 6px 24px rgba(15,23,42,0.06)', padding: 0, marginBottom: 32, marginTop: 24, maxWidth: 600, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', padding: '32px 32px 24px 32px', borderBottom: '1px solid #e3e7ee', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 6 }}>Schedule a Class</h2>
                  <div style={{ height: 2, background: '#e3e7ee', margin: '12px 0 0 0', borderRadius: 1 }} />
                </div>
                <form onSubmit={handleClassSubmit} style={{ background: '#FFFCF0', borderRadius: 0, padding: '32px 32px 24px 32px', width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <label htmlFor="course_id" style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>Course</label>
                  <select id="course_id" name="course_id" value={classForm.course_id} onChange={handleClassChange} required title="Select Course" style={{ padding: '0.9rem', borderRadius: 7, border: '1.5px solid #bfc7d1', fontSize: 17, marginBottom: 8, background: '#fff', transition: 'border 0.2s' }}>
                    <option value="">Select Course</option>
                    {profile?.courses?.map((c: any) => (
                      <option key={c.course_id} value={c.course_id}>{c.title}</option>
                    ))}
                  </select>
                  <label htmlFor="topic" style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>Topic</label>
                  <input id="topic" type="text" name="topic" value={classForm.topic} onChange={handleClassChange} placeholder="Class Topic" required title="Class Topic" style={{ padding: '0.9rem', borderRadius: 7, border: '1.5px solid #bfc7d1', fontSize: 17, marginBottom: 8, background: '#fff', transition: 'border 0.2s' }} />
                  <label htmlFor="start_time" style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>Start Time</label>
                  <input id="start_time" type="datetime-local" name="start_time" value={classForm.start_time} onChange={handleClassChange} required title="Start Time" style={{ padding: '0.9rem', borderRadius: 7, border: '1.5px solid #bfc7d1', fontSize: 17, marginBottom: 8, background: '#fff', transition: 'border 0.2s' }} />
                  <label htmlFor="duration" style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>Duration (minutes)</label>
                  <input id="duration" type="number" name="duration" value={classForm.duration} onChange={handleClassChange} placeholder="Duration (minutes)" required title="Duration (minutes)" style={{ padding: '0.9rem', borderRadius: 7, border: '1.5px solid #bfc7d1', fontSize: 17, marginBottom: 8, background: '#fff', transition: 'border 0.2s' }} />
                  <button type="submit" disabled={!zoomConnected || !(profile?.courses?.length)} style={{ background: '#00BC83', color: '#fff', border: 'none', borderRadius: 8, padding: '1rem 2.2rem', fontWeight: 700, fontSize: 18, cursor: (zoomConnected && profile?.courses?.length) ? 'pointer' : 'not-allowed', marginTop: 10, boxShadow: '0 2px 8px rgba(15,23,42,0.10)', transition: 'background 0.2s' }}>Schedule Class</button>
                </form>
                {classMsg && <div style={{ background: classMsg.includes('scheduled') ? '#e6f9ed' : '#ffeaea', color: classMsg.includes('scheduled') ? '#1a7f37' : '#b71c1c', borderRadius: 7, padding: '10px 18px', marginTop: 10, fontSize: 16, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {classMsg.includes('scheduled') ? '✔️' : '❌'} {classMsg}
                </div>}
                 {classJoinUrl && <div style={{ marginTop: 12 }}><a href={classJoinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#00BC83', fontWeight: 700, fontSize: 16 }}>Join Class (Zoom)</a></div>}
                {/* Scheduled Classes Section */}
                <div style={{ marginTop: 36, width: '100%' }}>
                  <h3 style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>Scheduled Classes</h3>
                  {profile?.courses?.length === 0 ? <em>No courses assigned.</em> : (
                    <>
                      {profile.courses.map((course: any) => (
                        <div key={course.course_id} style={{ marginBottom: 22, background: '#f3f6fa', borderRadius: 8, padding: 18, boxShadow: '0 1px 4px rgba(30,60,90,0.04)' }}>
                          <strong>{course.title}</strong><br />
                          {scheduledClasses[course.course_id] ? (
                            <>
                              <strong>Topic:</strong> {scheduledClasses[course.course_id].topic}<br />
                              <strong>Start Time:</strong> {new Date(scheduledClasses[course.course_id].start_time).toLocaleString()}<br />
                              <strong>Duration:</strong> {scheduledClasses[course.course_id].duration} min<br />
                              <a
                                href={scheduledClasses[course.course_id].join_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-block', marginTop: 6, background: '#00BC83', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.3rem', fontWeight: 500, fontSize: 15, textDecoration: 'none' }}
                              >
                                Join
                              </a>
                            </>
                          ) : <em>No class scheduled for this course.</em>}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
            {activePage === 'uploadTest' && profile && (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 6px 24px rgba(15,23,42,0.06)', padding: 32, marginBottom: 32, maxWidth: 600, width: '100%' }}>
                <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 18, color: '#00BC83' }}>Upload Test</h2>
                {/* This form matches the backend endpoint /api/teacher/dashboard/upload-test */}
                <form onSubmit={handleTestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <label htmlFor="test_course_id" style={{ fontWeight: 600, fontSize: 16 }}>Course</label>
                  <select id="test_course_id" name="course_id" value={testForm.course_id} onChange={handleTestChange} required style={{ padding: '0.9rem', borderRadius: 7, border: '1.5px solid #bfc7d1', fontSize: 17, background: '#fff' }}>
                    <option value="">Select Course</option>
                    {profile?.courses?.map((c: any) => (
                      <option key={c.course_id} value={c.course_id}>{c.title}</option>
                    ))}
                  </select>
                  <label htmlFor="test_title" style={{ fontWeight: 600, fontSize: 16 }}>Title</label>
                  <input id="test_title" type="text" name="title" value={testForm.title} onChange={handleTestChange} placeholder="Test Title" required style={{ padding: '0.9rem', borderRadius: 7, border: '1.5px solid #bfc7d1', fontSize: 17, background: '#fff' }} />
                  <label htmlFor="test_description" style={{ fontWeight: 600, fontSize: 16 }}>Description</label>
                  <textarea id="test_description" name="description" value={testForm.description} onChange={handleTestChange} placeholder="Test Description" rows={3} style={{ padding: '0.9rem', borderRadius: 7, border: '1.5px solid #bfc7d1', fontSize: 17, background: '#fff' }} />
                  <label htmlFor="test_date" style={{ fontWeight: 600, fontSize: 16 }}>Test Date</label>
                  <input id="test_date" type="date" name="test_date" value={testForm.test_date} onChange={handleTestChange} required style={{ padding: '0.9rem', borderRadius: 7, border: '1.5px solid #bfc7d1', fontSize: 17, background: '#fff' }} />
                  <label htmlFor="test_link" style={{ fontWeight: 600, fontSize: 16 }}>Test Link</label>
                  <input id="test_link" type="url" name="test_link" value={testForm.test_link} onChange={handleTestChange} placeholder="Test Link (URL)" required style={{ padding: '0.9rem', borderRadius: 7, border: '1.5px solid #bfc7d1', fontSize: 17, background: '#fff' }} />
                  <button type="submit" style={{ background: '#00BC83', color: '#fff', border: 'none', borderRadius: 8, padding: '1rem 2.2rem', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginTop: 10, boxShadow: '0 2px 8px rgba(15,23,42,0.10)' }}>Upload Test</button>
                </form>
                {testMsg && <div style={{ background: testMsg.includes('success') ? '#e6f9ed' : '#ffeaea', color: testMsg.includes('success') ? '#1a7f37' : '#b71c1c', borderRadius: 7, padding: '10px 18px', marginTop: 10, fontSize: 16, fontWeight: 500 }}>{testMsg}</div>}
                {/* If you need to add more fields, update both frontend and backend accordingly. */}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard; 