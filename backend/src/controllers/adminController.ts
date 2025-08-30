import { RequestHandler, Request, Response } from "express";
import { currentQuiz, QuizCorrectAnswer } from "../types/quiz.types";
import pool from "../config/db";

/* GET /api/admin/regions */
export const getAllRegions: RequestHandler = async (req: Request, res) => {
  if (req.user?.role !== "ADMIN") {
    res.sendStatus(403);
    return;
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM regions ORDER BY name"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching regions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* POST /api/admin/regions */
export const createRegion: RequestHandler = async (req: Request, res) => {
  if (req.user?.role !== "ADMIN") {
    res.sendStatus(403);
    return;
  }

  const { name, currency, country_code } = req.body;
  if (!name) {
    res.status(400).json({ message: "name required" });
    return;
  }

  const { rows } = await pool.query(
    `INSERT INTO regions (name, currency, country_code)
     VALUES ($1,$2,$3) RETURNING region_id`,
    [name, currency, country_code]
  );

  res.status(201).json({ region_id: rows[0].region_id });
};

/* GET /api/admin/students */
export const getAllStudents: RequestHandler = async (req: Request, res) => {
  if (req.user?.role !== "ADMIN") {
    res.sendStatus(403);
    return;
  }

  try {
    const { rows } = await pool.query(
      `SELECT 
        u.user_id,
        u.email,
        u.created_at,
        sp.full_name,
        sp.grade_level,
        sp.phone_no,
        sp.is_verified
       FROM users u
       LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
       WHERE u.role = 'STUDENT'
       ORDER BY sp.full_name`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* GET /api/admin/teachers */
export const getAllTeachers: RequestHandler = async (req: Request, res) => {
  if (req.user?.role !== "ADMIN") {
    res.sendStatus(403);
    return;
  }

  try {
    const { rows } = await pool.query(
      `SELECT 
        u.user_id,
        u.email,
        u.created_at,
        tp.full_name,
        tp.bio
       FROM users u
       LEFT JOIN teacher_profiles tp ON u.user_id = tp.user_id
       WHERE u.role = 'TEACHER'
       ORDER BY tp.full_name`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* POST /api/admin/courses */
export const createCourseWithPrices: RequestHandler = async (
  req: Request,
  res
) => {
  if (req.user?.role !== "ADMIN") {
    res.sendStatus(403);
    return;
  }

  const {
    title,
    description,
    base_price,
    start_date,
    duration,
    target_audience,
    weekly_outline,
    prices
  } = req.body;

  if (!title || !Array.isArray(prices)) {
    res.status(400).json({ message: "title and prices array required" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO courses (
        title,
        description,
        base_price,
        start_date,
        duration,
        target_audience,
        weekly_outline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING course_id`,
      [
        title,
        description || '',
        base_price || null,
        start_date || null,
        duration || '',
        target_audience || '',
        weekly_outline || ''
      ]
    );

    const courseId = rows[0].course_id;

    for (const p of prices) {
      await client.query(
        `INSERT INTO course_prices (course_id, region_id, price)
         VALUES ($1, $2, $3)`,
        [courseId, p.region_id, p.price]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ course_id: courseId });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ message: "Error creating course" });
  } finally {
    client.release();
  }
};


/* PATCH /api/admin/students/:id/verify */
export const verifyStudent: RequestHandler = async (req: Request, res) => {
  if (req.user?.role !== "ADMIN") {
    res.sendStatus(403);
    return;
  }

  const studentId = Number(req.params.id);
  const { is_verified } = req.body;

  await pool.query(
    `UPDATE student_profiles SET is_verified=$1 WHERE user_id=$2`,
    [!!is_verified, studentId]
  );

  res.json({ message: "Student verification updated" });
};

export const assignCourseToTeacher: RequestHandler = async (req, res) => {
  const { user } = req;

  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }

  const { teacher_id, course_id } = req.body;

  if (!teacher_id || !course_id) {
    res.status(400).json({ message: "teacher_id and course_id are required." });
    return;
  }

  try {
    const teacherResult = await pool.query(
      `SELECT * FROM users WHERE user_id = $1 AND role = 'TEACHER'`,
      [teacher_id]
    );
    if (teacherResult.rows.length === 0) {
      res.status(404).json({ message: `Teacher ID ${teacher_id} does not exist or is not a TEACHER.` });
      return;
    }

    const courseResult = await pool.query(
      `SELECT * FROM courses WHERE course_id = $1`,
      [course_id]
    );
    if (courseResult.rows.length === 0) {
      res.status(404).json({ message: `Course ID ${course_id} does not exist.` });
      return;
    }

    const existingAssignment = await pool.query(
      `SELECT * FROM teacher_courses WHERE teacher_id = $1 AND course_id = $2`,
      [teacher_id, course_id]
    );
    if (existingAssignment.rows.length > 0) {
      res.status(400).json({ message: "This course is already assigned to the teacher." });
      return;
    }

    await pool.query(
      `INSERT INTO teacher_courses (teacher_id, course_id) VALUES ($1, $2)`,
      [teacher_id, course_id]
    );

    res.status(200).json({
      message: `Course ID ${course_id} assigned to Teacher ID ${teacher_id}.`,
    });
  } catch (err) {
    console.error("Error assigning course:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------------------ MATHWAVE Controllers -----------------------------------------
// POST : /api/admin/quizzes
export const createQuiz = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can create quiz" });
    }

    const {
      title,
      description,
      available_from,
      available_until,
      difficulty_level,
      date,
      pdf_url,
    } = req.body;

    if (
      !title ||
      !pdf_url ||
      !available_from ||
      !available_until ||
      !date ||
      !description ||
      !difficulty_level
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (new Date(available_from) >= new Date(available_until)) {
      return res
        .status(400)
        .json({ message: "'available_from' must be before 'available_until'" });
    }

    const result = await pool.query(
      `INSERT INTO quizzes 
      (title, description, available_from, available_until, difficulty_level, date, pdf_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        title,
        description,
        available_from,
        available_until,
        difficulty_level,
        date,
        pdf_url,
      ]
    );

    const quiz: currentQuiz = result.rows[0];

    return res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    console.log(error + "Error while creating quiz");
    return res.status(500).json({ message: +"Internal Server Error" });
  }
};

// POST : /api/admin/quizzes/:quizId/answer
export const createCorrectQuizAnswer = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can access" });
    }

    const { quizId } = req.params;
    const answers: QuizCorrectAnswer[] = req.body.answers;

    if (!Array.isArray(answers) || answers.length !== 5) {
      return res
        .status(400)
        .json({ message: "Exactly 5 answers must be provided." });
    }

    await pool.query("DELETE FROM quiz_correct_answers WHERE quiz_id = $1", [
      quizId,
    ]);

    for (const answer of answers) {
      const { question_number, correct_answer } = answer;

      if (
        typeof question_number !== "number" ||
        question_number < 1 ||
        question_number > 5 ||
        typeof correct_answer !== "string" ||
        correct_answer.trim() === ""
      ) {
        return res
          .status(400)
          .json({ message: "Invalid input format in answers." });
      }

      await pool.query(
        `INSERT INTO quiz_correct_answers (quiz_id, question_number, correct_answer)
         VALUES ($1, $2, $3)`,
        [quizId, question_number, correct_answer.trim()]
      );
    }

    return res
      .status(201)
      .json({ message: "Correct answers submitted successfully." });
  } catch (error) {
    console.log("Admin: Error while adding correct answer for quiz", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET : api/admin/quizzes
export const getAllQuizzes = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can access" });
    }

    const result = await pool.query(
      "SELECT * FROM quizzes ORDER BY created_at DESC"
    );

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      quizzes: result.rows,
    });
  } catch (error) {
    console.error("Admin: Error fetching quizzes", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH : api/admin/quizzes/:quizId/status
export const updateQuizStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Only admin can update quiz status" });
    }

    const { quizId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (status === "active") {
      await pool.query(
        "UPDATE quizzes SET status = 'inactive' WHERE status = 'active'"
      );
    }

    const updateRes = await pool.query(
      "UPDATE quizzes SET status = $1 WHERE quiz_id = $2 RETURNING *",
      [status, quizId]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.status(200).json({
      message: `Quiz status updated to '${status}'`,
      quiz: updateRes.rows[0],
    });
  } catch (error) {
    console.error("Error updating quiz status", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
