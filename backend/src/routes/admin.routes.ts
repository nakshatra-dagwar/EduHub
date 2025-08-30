import express from "express";
import {
  createRegion,
  createCourseWithPrices,
  verifyStudent,
  createQuiz,
  createCorrectQuizAnswer,
  getAllQuizzes,
  updateQuizStatus,
  assignCourseToTeacher,
  getAllStudents,
  getAllTeachers,
  getAllRegions,
} from "../controllers/adminController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authenticateToken);

// POST : api/admin/regions
router.post("/regions", createRegion);

// GET : api/admin/regions
router.get("/regions", getAllRegions);

// POST : api/admin/courses
router.post("/courses", createCourseWithPrices);

// PATCH : api/admin/students/:id/verify
router.patch("/students/:id/verify", verifyStudent);

// GET : api/admin/students
router.get("/students", getAllStudents);

// GET : api/admin/teachers
router.get("/teachers", getAllTeachers);

// POST : api/admin/assign-course
router.post("/assign-course", assignCourseToTeacher);

// POST : api/admin/quizzes
router.post("/quizzes", createQuiz);

// POST : api/admin/quizzes/:quizId/answer
router.post("/quizzes/:quizId/answer", createCorrectQuizAnswer);

// GET : api/admin/quizzes
router.get("/quizzes", getAllQuizzes);

// PATCH : api/admin/quizzes/:quizId/status
router.patch("/quizzes/:quizId/status", updateQuizStatus);

export default router;
