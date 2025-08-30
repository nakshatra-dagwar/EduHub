import { RequestHandler, Request, Response } from "express";
import pool from "../config/db";
import { sendEmail } from "../utils/sendEmail";
export const getAllParents: RequestHandler = async (req, res) => {
  // cast so we can read req.user
  const { user } = req;

  if (!user || user.role !== "TEACHER") {
    res.status(403).json({ message: "Access denied. Teachers only." });
    return;
  }

  const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit || "10"), 10), 1),
    100
  );
  const offset = (page - 1) * limit;

  try {
    const {
      rows: [countRow],
    } = await pool.query(
      `SELECT COUNT(DISTINCT pp.user_id) AS total
         FROM teacher_courses tc
         JOIN enrollments  e  ON e.course_id   = tc.course_id
         JOIN student_profiles sp ON sp.user_id = e.student_id
         JOIN parent_profiles  pp ON pp.user_id = sp.parent_id
        WHERE tc.teacher_id = $1`,
      [user.user_id]
    );
    const total = Number(countRow?.total || 0);

   const { rows: parents } = await pool.query(
    `SELECT DISTINCT
            pp.user_id,
            u.email,
            pp.full_name,
            pp.phone_no
      FROM teacher_courses tc
      JOIN enrollments e        ON e.course_id   = tc.course_id
      JOIN student_profiles sp  ON sp.user_id    = e.student_id
      JOIN parent_profiles pp   ON pp.user_id    = sp.parent_id
      JOIN users u              ON u.user_id     = pp.user_id
      WHERE tc.teacher_id = $1
      ORDER BY pp.full_name
      LIMIT $2 OFFSET $3`,
    [user.user_id, limit, offset]
  );


    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      parents,
    });
  } catch (err) {
    console.error("Error fetching parent list:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getTeacherProfile: RequestHandler = async (req, res): Promise<void> => {
  const { user } = req;

  if (!user || user.role !== "TEACHER") {
    res.status(403).json({ message: "Access denied. Teachers only." });
    return;
  }

  try {
    const teacherId = user.user_id;

    const { rows: profileRows } = await pool.query(
      `
      SELECT 
        u.email,
        u.created_at,
        tp.full_name,
        tp.bio,
        tp.avatar_url
      FROM users u
      JOIN teacher_profiles tp ON tp.user_id = u.user_id
      WHERE u.user_id = $1
      `,
      [teacherId]
    );

    if (profileRows.length === 0) {
      res.status(404).json({ message: "Teacher profile not found." });
      return;
    }

    const profile = profileRows[0];

    const { rows: courseRows } = await pool.query(
      `
      SELECT 
        c.course_id,
        c.title,
        c.description,
        c.base_price,
        c.created_at
      FROM teacher_courses tc
      JOIN courses c ON c.course_id = tc.course_id
      WHERE tc.teacher_id = $1
      `,
      [teacherId]
    );

    res.json({
      ...profile,
      courses: courseRows,
    });
  } catch (err) {
    console.error("getTeacherProfile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const uploadTest: RequestHandler = async (req, res): Promise<void> => {
  const { user } = req;

  if (!user || user.role !== "TEACHER") {
    res.status(403).json({ message: "Only teachers can upload tests." });
    return;
  }

  const { course_id, title, description, test_date, test_link } = req.body;

  if (!course_id || !title || !test_date || !test_link) {
    res.status(400).json({
      message: "course_id, title, test_date, and test_link are required.",
    });
    return;
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM teacher_courses WHERE teacher_id = $1 AND course_id = $2`,
      [user.user_id, course_id]
    );

    if (rows.length === 0) {
      res.status(403).json({
        message: "You are not assigned to this course.",
      });
      return;
    }

    await pool.query(
      `INSERT INTO tests (course_id, teacher_id, title, description, test_date, test_link)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [course_id, user.user_id, title, description || "", test_date, test_link]
    );

    res.status(201).json({ message: "Test uploaded successfully." });
  } catch (error) {
    console.error("Error uploading test:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
