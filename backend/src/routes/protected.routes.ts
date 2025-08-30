import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import quizRoutes from "./quiz.routes";

const router = Router();

router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: "Welcome to the dashboard",
    user: req.user,
  });
});

router.use("/quiz", quizRoutes);

export default router;
