import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { getAllParents, getTeacherProfile, uploadTest } from "../controllers/teacherController";


const router = Router();

// e.g. GET /api/teacher/parents?page=2&limit=20
router.get("/dashboard/parents", authenticateToken, getAllParents);
router.get("/dashboard/profile", authenticateToken, getTeacherProfile);
router.post("/dashboard/upload-test", authenticateToken, uploadTest);
export default router;
