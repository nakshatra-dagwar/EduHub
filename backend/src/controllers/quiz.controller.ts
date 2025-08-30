import { Request, Response } from "express";
import { currentQuiz, QuizSubmitAnswer } from "../types/quiz.types";
import pool from "../config/db";

export const getCurrentQuiz = async (
  req: Request,
  res: Response
): Promise<any> => {
  const client = await pool.connect();
  try {
    const currentQuiz = await pool.query(
      "SELECT * FROM quizzes WHERE status = 'active' LIMIT 1"
    );
    if (currentQuiz.rows.length === 0) {
      return res.status(404).json({ message: "No Active Quiz" });
    }
    const quiz: currentQuiz = currentQuiz.rows[0];
    return res.status(200).json({ message: "Quiz Found successfully", quiz });
  } catch (error) {
    console.log("Error while fetching quiz", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

export const quizEnrollment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorised" });
    }
    const userId = req.user.user_id;
    const userRole = req.user.role;

    if (userRole !== "STUDENT") {
      return res.status(403).json({ message: "Only student can enroll" });
    }
    const getUserGrade = await pool.query(
      "Select grade_level from student_profiles where user_id = $1",
      [userId]
    );

    const userGrade = getUserGrade.rows[0].grade_level;
    if (userGrade === undefined || userGrade > 8) {
      return res.status(403).json({
        message: "Only students in grade 8 or below are eligible to enroll.",
      });
    }
    const activeQuiz = await pool.query(
      "Select quiz_id from quizzes where status = 'active' LIMIT 1"
    );
    if (activeQuiz.rows.length === 0) {
      return res.status(404).json({ message: "No active quiz found." });
    }
    const quiz_id = activeQuiz.rows[0].quiz_id;
    await pool.query(
      "Insert into quiz_enrollments(user_id,quiz_id) values($1, $2)",
      [userId, quiz_id]
    );

    return res.status(200).json({ message: "User successfully enrolled" });
  } catch (error) {
    console.log("Error in enrolling student" + error);
    return res
      .status(500)
      .json({ message: "User not enrolled something went wrongs" });
  }
};

export const submitQuizAnswer = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.user_id;
    const userRole = req.user.role;

    if (userRole !== "STUDENT") {
      return res.status(403).json({ message: "Only students are allowed" });
    }

    const userGradeRes = await pool.query(
      "SELECT grade_level FROM student_profiles WHERE user_id = $1",
      [userId]
    );
    const userGrade = userGradeRes.rows[0]?.grade_level;

    if (userGrade === undefined || userGrade > 8) {
      return res.status(403).json({
        message: "Only students in grade 8 or below are eligible.",
      });
    }

    const { quizId, questionNumber } = req.params;
    const { answer } = req.body;

    const quiz_id = parseInt(quizId, 10);
    const question_number = parseInt(
      questionNumber,
      10
    ) as QuizSubmitAnswer["question_number"];

    if (
      isNaN(quiz_id) ||
      isNaN(question_number) ||
      question_number < 1 ||
      question_number > 5
    ) {
      return res
        .status(400)
        .json({ message: "Invalid quiz or question number." });
    }

    const quizCheck = await pool.query(
      "SELECT 1 FROM quizzes WHERE quiz_id = $1",
      [quiz_id]
    );
    if (quizCheck.rowCount === 0) {
      return res.status(404).json({ message: "Quiz not found." });
    }
    const submissionCheck = await pool.query(
      "SELECT is_submitted FROM quiz_enrollments WHERE user_id = $1 AND quiz_id = $2",
      [userId, quiz_id]
    );

    const isSubmitted = submissionCheck.rows[0]?.is_submitted;
    if (isSubmitted) {
      return res.status(403).json({
        message:
          "You have already submitted this quiz. No more answers are allowed.",
      });
    }

    const previousAttemptsQuery = await pool.query(
      "SELECT * FROM quiz_student_answers WHERE user_id = $1 AND quiz_id = $2 AND question_number = $3 ORDER BY attempt_number ASC",
      [userId, quiz_id, question_number]
    );
    const previousAttempts = previousAttemptsQuery.rows;

    if (previousAttempts.length >= 2) {
      return res
        .status(403)
        .json({ message: "No more attempts allowed for this question." });
    }

    const attempt_number = (previousAttempts.length +
      1) as QuizSubmitAnswer["attempt_number"];

    const correctAnswerRes = await pool.query(
      "SELECT correct_answer FROM quiz_correct_answers WHERE quiz_id = $1 AND question_number = $2",
      [quiz_id, question_number]
    );
    if (correctAnswerRes.rowCount === 0) {
      return res.status(500).json({ message: "Correct answer not found." });
    }

    const correctAnswer = correctAnswerRes.rows[0].correct_answer
      .trim()
      .toLowerCase();
    const isSkipped = !answer || answer.trim() === "";

    const submittedAnswer = isSkipped ? "" : answer.trim().toLowerCase();
    const is_correct: QuizSubmitAnswer["is_correct"] = isSkipped
      ? false
      : submittedAnswer === correctAnswer;

    let score: QuizSubmitAnswer["score"] = 0;

    if (attempt_number === 1) {
      score = is_correct ? 10 : 0;
    } else if (attempt_number === 2) {
      const firstAttempt = previousAttempts[0];
      if (firstAttempt.is_correct === true && is_correct === false) {
        score = 0;
        await pool.query(
          "UPDATE quiz_student_answers SET score = 0 WHERE answer_id = $1",
          [firstAttempt.answer_id]
        );
      } else if (firstAttempt.is_correct === false && is_correct === true) {
        score = 5;
      } else {
        score = 0;
      }
    }
    const record: QuizSubmitAnswer = {
      user_id: userId,
      quiz_id,
      question_number,
      attempt_number,
      answer: submittedAnswer,
      is_correct,
      score,
    };

    await pool.query(
      `INSERT INTO quiz_student_answers
        (user_id, quiz_id, question_number, attempt_number, answer, is_correct, score)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        record.user_id,
        record.quiz_id,
        record.question_number,
        record.attempt_number,
        record.answer,
        record.is_correct,
        record.score,
      ]
    );

    return res.status(200).json({
      message: isSkipped
        ? "Skipped successfully"
        : "Answer submitted successfully",
      attemptNumber: record.attempt_number,
      isCorrect: record.is_correct,
      score: record.score,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const submitFullQuiz = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.user_id;
    const { quizId } = req.params;

    const quiz_id = parseInt(quizId, 10);
    if (isNaN(quiz_id)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    const enrolled = await pool.query(
      "SELECT * FROM quiz_enrollments WHERE user_id = $1 AND quiz_id = $2",
      [userId, quiz_id]
    );

    if (enrolled.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this quiz." });
    }

    if (enrolled.rows[0].is_submitted) {
      return res.status(400).json({ message: "Quiz already submitted." });
    }

    await pool.query(
      "UPDATE quiz_enrollments SET is_submitted = true WHERE user_id = $1 AND quiz_id = $2",
      [userId, quiz_id]
    );

    return res.status(200).json({ message: "Quiz submitted successfully." });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTotalQuizScore = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.user_id;
    const userRole = req.user.role;

    if (userRole !== "STUDENT") {
      return res
        .status(403)
        .json({ message: "Only students can access their score" });
    }

    const { quizId } = req.params;
    const quiz_id = parseInt(quizId, 10);

    if (isNaN(quiz_id)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    const enrollmentRes = await pool.query(
      "SELECT is_submitted FROM quiz_enrollments WHERE user_id = $1 AND quiz_id = $2",
      [userId, quiz_id]
    );

    if (enrollmentRes.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this quiz" });
    }

    if (!enrollmentRes.rows[0].is_submitted) {
      return res.status(403).json({
        message: "You must submit the quiz before viewing your score",
      });
    }

    const scoreRes = await pool.query(
      `SELECT COALESCE(SUM(max_score), 0) AS total_score
       FROM (
         SELECT MAX(score) AS max_score
         FROM quiz_student_answers
         WHERE user_id = $1 AND quiz_id = $2
         GROUP BY question_number
       ) AS scores`,
      [userId, quiz_id]
    );

    const totalScore = parseInt(scoreRes.rows[0].total_score, 10);

    return res.status(200).json({
      message: "Total score retrieved successfully",
      quiz_id,
      totalScore,
    });
  } catch (error) {
    console.error("Error fetching quiz score:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
