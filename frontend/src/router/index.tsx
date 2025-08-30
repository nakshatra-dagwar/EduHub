// App routing setup. Defines all routes, including protected dashboard routes for each user role.
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/home';
import Login from '../pages/login';
import Signup from '../pages/signup';
import VerifyEmail from '../pages/verify-email';
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import TeacherDashboard from '../pages/dashboard/TeacherDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import ProtectedRoute from '../components/ProtectedRoute';
import "../index.css";
import CourseDetailsPage from '../pages/courseDetailsPage';
import Courses from '../pages/coursesPage';
import ForgotPassword from '../pages/forgot-password';
import ResetPassword from '../pages/reset-password';
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetailsPage />} />
      <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/teacher" element={<ProtectedRoute allowedRoles={['TEACHER']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;