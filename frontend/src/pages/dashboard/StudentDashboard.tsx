// StudentDashboard: Modern UI for students.
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import styles from './studentDashboard.module.css';
import { useNavigate } from 'react-router-dom';

const sidebarItems = [
  { key: 'home', label: 'Home' },
  { key: 'profile', label: 'Profile' },
  { key: 'classes', label: 'Classes' },
  { key: 'courses', label: 'Courses Enrolled' },
  { key: 'quizzes', label: 'Quizzes' },
];

const StudentDashboard = () => {
  const [activePage, setActivePage] = useState('home');
  const [profile, setProfile] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [idUploadMsg, setIdUploadMsg] = useState('');
  const [idUploading, setIdUploading] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const idCardRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editMsg, setEditMsg] = useState('');
  const navigate = useNavigate();
  const [joinClassId, setJoinClassId] = useState('');
  const [joinClassInfo, setJoinClassInfo] = useState<any>(null);
  const [joinClassMsg, setJoinClassMsg] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [scheduledClasses, setScheduledClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/dashboard/profile`, { withCredentials: true });
        setProfile(profRes.data);
        setEditForm(profRes.data);
        const coursesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/enrolled-courses`, { withCredentials: true });
        setEnrolledCourses(coursesRes.data.courses || []);
        const classesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/classes`, { withCredentials: true });
        
        // Filter out classes older than 2 days
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const filteredClasses = (classesRes.data.classes || []).filter((cl: any) => {
          const classDate = new Date(cl.start_time);
          return classDate >= twoDaysAgo;
        });
        setScheduledClasses(filteredClasses);
        
        const testsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/dashboard/tests`, { withCredentials: true });
        
        // Filter out tests older than 2 days
        const filteredTests = (testsRes.data.tests || []).filter((test: any) => {
          const testDate = new Date(test.test_date);
          return testDate >= twoDaysAgo;
        });
        setTests(filteredTests);
        
        const quizRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/quiz/active-quiz`, { withCredentials: true });
        setQuiz(quizRes.data.quiz || null);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleIdUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdUploading(true);
    setIdUploadMsg('');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/student/verify-id`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIdUploadMsg(res.data.message || 'Submitted!');
    } catch (err: any) {
      setIdUploadMsg(err.response?.data?.message || 'Upload failed');
    } finally {
      setIdUploading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMsg('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/student/verify-id`, {
        ...editForm,
      }, { withCredentials: true });
      setEditMsg('Profile updated!');
      setEditing(false);
      setProfile(editForm);
    } catch (err: any) {
      setEditMsg(err.response?.data?.message || 'Update failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Could not load profile.</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.nav}>
        <Navbar />
      </div>
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div className={styles.sidebarTitle}>Student</div>
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
          <button onClick={handleLogout} className={styles.logout}>
            Log out
          </button>
        </aside>
        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.container}>
            {activePage === 'home' && (
              <div className={`${styles.card} ${styles.cardNarrow}`}>
                <h2 className={styles.cardTitle} style={{ fontSize: 28 }}>Welcome, {profile?.full_name || 'Student'}!</h2>
                <p className={styles.muted} style={{ fontSize: 18 }}>Use the sidebar to navigate your profile, classes, courses, and quizzes.</p>
              </div>
            )}
            {activePage === 'profile' && profile && (
              <div className={`${styles.card} ${styles.cardNarrow}`}>
                <h2 className={styles.cardTitle}>Profile</h2>
                <div style={{ marginBottom: 24, fontSize: 17 }}>
                  <strong>Name:</strong> {profile.full_name}<br />
                  <strong>Email:</strong> {profile.email}<br />
                  <strong>Grade Level:</strong> {profile.grade_level}<br />
                  <strong>Phone No:</strong> {profile.phone_no}<br />
                  <strong>Age:</strong> {profile.age}<br />
                  <strong>Parent ID:</strong> {profile.parent_id}<br />
                </div>
                <div className={styles.sectionBox} style={{ maxWidth: 440 }}>
                  <h3 className={styles.cardTitle} style={{ fontSize: 20 }}>ID Card Upload & Verification</h3>
                  <form onSubmit={handleIdUpload} className={styles.form}>
                    <label style={{ fontWeight: 500, fontSize: 15 }}>ID Card (file upload)
                      <input type="file" name="id_card" ref={idCardRef} required className={styles.input} placeholder="Upload ID Card" title="ID Card" />
                    </label>
                    <label style={{ fontWeight: 500, fontSize: 15 }}>Region ID
                      <input type="text" name="region_id" placeholder="Region ID" required title="Region ID" className={styles.input} />
                    </label>
                    <label style={{ fontWeight: 500, fontSize: 15 }}>Full Name
                      <input type="text" name="full_name" placeholder="Full Name" required title="Full Name" className={styles.input} />
                    </label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <label style={{ fontWeight: 500, fontSize: 15, flex: 1 }}>Age
                        <input type="number" name="age" placeholder="Age" required title="Age" className={styles.input} />
                      </label>
                      <label style={{ fontWeight: 500, fontSize: 15, flex: 1 }}>Grade Level
                        <input type="number" name="grade_level" placeholder="Grade Level" required title="Grade Level" className={styles.input} />
                      </label>
                    </div>
                    <label style={{ fontWeight: 500, fontSize: 15 }}>Phone Number
                      <input type="text" name="phone_no" placeholder="Phone Number" required title="Phone Number" className={styles.input} />
                    </label>
                    {Number(profile.grade_level) <= 8 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <label style={{ fontWeight: 500, fontSize: 15 }}>Parent Full Name
                          <input type="text" name="parent_full_name" placeholder="Parent Full Name" required title="Parent Full Name" className={styles.input} />
                        </label>
                        <label style={{ fontWeight: 500, fontSize: 15 }}>Parent Email
                          <input type="email" name="parent_email" placeholder="Parent Email" required title="Parent Email" className={styles.input} />
                        </label>
                        <label style={{ fontWeight: 500, fontSize: 15 }}>Parent Phone Number
                          <input type="text" name="parent_phone_no" placeholder="Parent Phone Number" required title="Parent Phone Number" className={styles.input} />
                        </label>
                      </div>
                    )}
                    <button type="submit" disabled={idUploading} className={styles.buttonPrimary}>
                      {idUploading ? 'Uploading...' : 'Submit'}
                    </button>
                  </form>
                  {idUploadMsg && (
                    <div className={idUploadMsg.includes('success') ? styles.alertOk : styles.alertErr}>{idUploadMsg}</div>
                  )}
                </div>
              </div>
            )}
            {activePage === 'classes' && (
              <div className={`${styles.card} ${styles.cardWide}`}>
                <h2 className={styles.cardTitle}>Classes</h2>
                {enrolledCourses.length === 0 ? (
                  <em>No enrolled courses.</em>
                ) : (
                  <>
                    {enrolledCourses.map(course => {
                      const courseClasses = scheduledClasses.filter((cl: any) => cl.course_id === course.course_id);
                      return (
                        <div key={course.course_id} className={styles.sectionBox} style={{ marginBottom: 24 }}>
                          <h4 style={{ fontWeight: 600, fontSize: 19 }}>{course.title}</h4>
                          {courseClasses.length === 0 ? (
                            <em>No class scheduled.</em>
                          ) : (
                            <ul style={{ fontSize: 16, marginTop: 8 }}>
                              {courseClasses.map((cl: any) => (
                                <li key={cl.id} style={{ marginBottom: 10 }}>
                                  <strong>Topic:</strong> {cl.topic}<br />
                                  <strong>Start Time:</strong> {new Date(cl.start_time).toLocaleString()}<br />
                                  <strong>Duration:</strong> {cl.duration} min<br />
                                  <a href={cl.join_url} target="_blank" rel="noopener noreferrer" className={styles.joinLink}>
                                    Join
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
            {activePage === 'courses' && (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 6px 24px rgba(15,23,42,0.06)', padding: 32, marginBottom: 32, maxWidth: 600, width: '100%' }}>
                <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 18, color: '#00BC83' }}>Courses Enrolled</h2>
                {enrolledCourses.length === 0 ? (
                  <em>You are not enrolled in any courses.</em>
                ) : (
                  <ul style={{ fontSize: 17 }}>
                    {enrolledCourses.map((course: any) => (
                      <li key={course.course_id} style={{ marginBottom: 16 }}>
                        <strong>{course.title}</strong>
                        {course.description ? <> — {course.description}</> : null}
                        <button
                          style={{ marginLeft: 12, background: '#00BC83', color: '#fff', border: 'none', borderRadius: 6, padding: '0.3rem 0.9rem', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}
                          onClick={() => setSelectedCourse(course)}
                        >
                          View Details
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {selectedCourse && (
                  <div style={{ background: '#FFFCF0', border: '1px solid #FFF4C2', borderRadius: 8, boxShadow: '0 6px 24px rgba(15,23,42,0.06)', padding: 24, marginTop: 24, maxWidth: 500 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Course Details</h3>
                    <strong>Title:</strong> {selectedCourse.title}<br />
                    {selectedCourse.description && (<><strong>Description:</strong> {selectedCourse.description}<br /></>)}
                    <button
                      style={{ marginTop: 18, background: '#FFFCF0', color: '#0B0F0D', border: '1px solid #FFF4C2', borderRadius: 6, padding: '0.3rem 0.9rem', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                      onClick={() => setSelectedCourse(null)}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
            {activePage === 'quizzes' && (
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 6px 24px rgba(15,23,42,0.06)', padding: 32, marginBottom: 32, maxWidth: 700, width: '100%' }}>
                <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Quizzes</h2>
                <h3 style={{ fontWeight: 600, fontSize: 19, marginBottom: 10 }}>Available Tests</h3>
                {tests.length === 0 ? <div>No tests available.</div> : (
                  <ul style={{ fontSize: 17 }}>
                    {tests.map((test: any) => (
                      <li key={test.test_id} style={{ marginBottom: 12 }}>
                        <strong>{test.title}</strong> ({test.course_title})<br />
                        {test.description}<br />
                        Date: {new Date(test.test_date).toLocaleString()}<br />
                        {test.is_joinable ? <a href={test.test_link} style={{ color: '#00BC83', fontWeight: 700 }}>Join Test</a> : <span>Not yet available</span>}
                      </li>
                    ))}
                  </ul>
                )}
                <h3 style={{ marginTop: 32, fontWeight: 600, fontSize: 19 }}>Active Quiz</h3>
                {quiz ? (
                  <div>
                    <strong>{quiz.title}</strong><br />
                    {quiz.description}<br />
                  </div>
                ) : (
                  <div>No active quiz at the moment.</div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard; 