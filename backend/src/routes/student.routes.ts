import express from "express";
import {
  uploadIdCard,
  getCoursePriceForStudent,
  enrollStudent,
  upload,
  getAvailableTestsForStudent,
  getEnrolledCourses,
  getStudentClasses
} from "../controllers/studentController";
import { authenticateToken } from "../middleware/authMiddleware";
import { getStudentProfile } from "../controllers/studentController";

const router = express.Router();

router.use(authenticateToken);

// POST /api/student/verify-id (with file upload)
router.post("/verify-id", upload.single("id_card"), uploadIdCard);

// GET /api/student/courses/:courseId/price
router.get("/courses/:courseId/price", getCoursePriceForStudent);

// POST /api/student/courses/:courseId/enroll
router.post("/courses/:courseId/enroll", enrollStudent);

// GET /api/student/dashboard/profile
router.get("/dashboard/profile", authenticateToken, getStudentProfile);


// GET /api/student/dashboard/tests
router.get("/dashboard/tests", authenticateToken, getAvailableTestsForStudent);

// GET /api/student/enrolled-courses
router.get('/enrolled-courses', authenticateToken, getEnrolledCourses);

// GET /api/student/classes
router.get('/classes', authenticateToken, getStudentClasses);
export default router;
