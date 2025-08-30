import { Router } from "express";
import {
  getCurrentQuiz,
  quizEnrollment,
  submitQuizAnswer,
  submitFullQuiz,
  getTotalQuizScore,
} from "../controllers/quiz.controller";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/active-quiz", authenticateToken, getCurrentQuiz);
router.post("/quiz-enrollment", authenticateToken, quizEnrollment);
router.post(
  "/:quizId/question/:questionNumber/answer",
  authenticateToken,
  submitQuizAnswer
);
router.post("/:quizId/submit", authenticateToken, submitFullQuiz);
router.get("/:quizId/score", authenticateToken, getTotalQuizScore);
export default router;
