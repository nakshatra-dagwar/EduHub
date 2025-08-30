import { RequestHandler, Response, Request } from "express";
import pool from "../config/db";
import multer from "multer";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const upload = multer({ dest: "uploads/" });

//POST /api/student/verify-id

export const uploadIdCard: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req;
  if (!user || user.role !== "STUDENT") {
    res.sendStatus(403);
    return;
  }

  const {
    region_id,
    full_name,
    age,
    grade_level,
    phone_no,
    parent_full_name,
    parent_email,
    parent_phone_no,
  } = req.body;

  if (
    !req.file ||
    !region_id ||
    !full_name ||
    !age ||
    !grade_level ||
    !phone_no
  ) {
    res.status(400).json({
      message:
        "Missing required fields: file, region_id, full_name, age, grade_level, phone_no",
    });
    return;
  }

  const grade = Number(grade_level);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let parentId: number | null = null;

    if (grade <= 8) {
      if (!parent_full_name || !parent_email || !parent_phone_no) {
        res
          .status(400)
          .json({ message: "Parent info required for grade ≤ 8." });
        return;
      }

      const { rows: existing } = await client.query(
        `SELECT user_id FROM users WHERE email=$1 AND role='PARENT'`,
        [parent_email]
      );

      if (existing.length > 0) {
        parentId = existing[0].user_id;
      } else {
        const tempPassword = uuidv4();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const { rows: newParent } = await client.query(
          `INSERT INTO users (email, password_hash, role)
           VALUES ($1, $2, 'PARENT') RETURNING user_id`,
          [parent_email, hashedPassword]
        );

        parentId = newParent[0].user_id;

        await client.query(
          `INSERT INTO parent_profiles (user_id, full_name, phone_no)
           VALUES ($1, $2, $3)`,
          [parentId, parent_full_name, parent_phone_no]
        );
      }
    }

    // Build public file URL
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    const {
      rows: [existingStudent],
    } = await client.query(
      `SELECT full_name, grade_level, phone_no FROM student_profiles WHERE user_id = $1`,
      [user.user_id]
    );

    if (!existingStudent) {
      res.status(404).json({ message: "Student profile not found" });
      return;
    }

    await client.query(
      `UPDATE student_profiles
         SET full_name = $1,
             age = $2,
             grade_level = $3,
             phone_no = $4,
             region_id = $5,
             id_proof_url = $6,
             is_verified = FALSE,
             parent_id = $7
       WHERE user_id = $8`,
      [
        full_name,
        age,
        grade_level,
        phone_no,
        region_id,
        fileUrl,
        parentId,
        user.user_id,
      ]
    );

    await client.query("COMMIT");
    res.status(200).json({
      message:
        "Student profile submitted successfully. Awaiting admin approval.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("uploadIdCard error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

/*
  GET /api/student/courses/:courseId/price
*/
export const getCoursePriceForStudent: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req;
  if (!user) {
    res.sendStatus(401);
    return;
  }

  const courseId = Number(req.params.courseId);

  const {
    rows: [profile],
  } = await pool.query(
    `SELECT region_id, is_verified FROM student_profiles WHERE user_id=$1`,
    [user.user_id]
  );

  if (!profile) {
    res.status(404).json({ message: "Student profile not found" });
    return;
  }

  const { rows } = await pool.query(
    `SELECT price FROM course_prices WHERE course_id=$1 AND region_id=$2 LIMIT 1`,
    [courseId, profile.region_id]
  );

  const price = rows.length ? rows[0].price : null;

  const fallback = await pool.query(
    `SELECT base_price FROM courses WHERE course_id=$1`,
    [courseId]
  );

  res.json({
    price: price ?? fallback.rows[0]?.base_price ?? null,
    is_verified: profile.is_verified,
  });
};

//POST /api/student/courses/:courseId/enroll
export const enrollStudent: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user } = req;
  if (!user || user.role !== "STUDENT") {
    res.sendStatus(403);
    return;
  }

  const courseId = Number(req.params.courseId);

  const {
    rows: [profile],
  } = await pool.query(
    `SELECT is_verified FROM student_profiles WHERE user_id=$1`,
    [user.user_id]
  );

  if (!profile?.is_verified) {
    res.status(403).json({ message: "ID verification required to enroll." });
    return;
  }

  await pool.query(
    `INSERT INTO enrollments (course_id, student_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [courseId, user.user_id]
  );

  res.json({ message: "Enrolled successfully." });
};



export const getStudentProfile: RequestHandler = async (req, res) => {
  const { user } = req;

  if (!user || user.role !== "STUDENT") {
    res.status(403).json({ message: "Access denied. Students only." });
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
         sp.parent_id,
         sp.age
       FROM users u
       LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
       WHERE u.user_id = $1`,
      [user.user_id]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



export const getAvailableTestsForStudent: RequestHandler = async (req, res) => {
  const { user } = req;

  if (!user || user.role !== "STUDENT") {
    res.status(403).json({ message: "Only students can access this route." });
    return;
  }

  try {
    const enrolledCourses = await pool.query(
      `SELECT course_id FROM enrollments WHERE student_id = $1`,
      [user.user_id]
    );

    const courseIds = enrolledCourses.rows.map((row) => row.course_id);

    if (courseIds.length === 0) {
      res.json({ message: "You are not enrolled in any courses.", tests: [] });
      return;
    }

    const { rows: tests } = await pool.query(
      `SELECT 
         t.test_id,
         t.title,
         t.description,
         t.test_date,
         t.test_link,
         c.title AS course_title
       FROM tests t
       JOIN courses c ON c.course_id = t.course_id
       WHERE t.course_id = ANY($1::int[])
       ORDER BY t.test_date ASC`,
      [courseIds]
    );

    const now = new Date();

    const result = tests.map((test) => {
      const testStartTime = new Date(test.test_date);
      return {
        ...test,
        is_joinable: testStartTime <= now,
      };
    });

    res.json({ tests: result });
  } catch (err) {
    console.error("Error fetching tests for student:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/student/enrolled-courses
 * Returns the list of courses the current student is enrolled in
 */
export const getEnrolledCourses: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { user } = req;
  if (!user || user.role !== 'STUDENT') {
    res.status(403).json({ message: 'Only students can access this route.' });
    return;
  }

  try {
    const { rows } = await pool.query(
      `SELECT c.course_id, c.title, c.description
         FROM enrollments e
         JOIN courses c ON c.course_id = e.course_id
        WHERE e.student_id = $1
        ORDER BY c.title ASC`,
      [user.user_id]
    );
    res.json({ courses: rows });
  } catch (error) {
    console.error('getEnrolledCourses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /api/student/classes
 * Returns all scheduled classes for the student's enrolled courses
 */
export const getStudentClasses: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { user } = req;
  if (!user || user.role !== 'STUDENT') {
    res.status(403).json({ message: 'Only students can access this route.' });
    return;
  }

  try {
    const { rows: courseRows } = await pool.query(
      `SELECT course_id FROM enrollments WHERE student_id = $1`,
      [user.user_id]
    );
    const courseIds: number[] = courseRows.map(r => r.course_id);
    if (!courseIds.length) {
      res.json({ classes: [] });
      return;
    }

    const { rows } = await pool.query(
      `SELECT id, course_id, topic, start_time, duration, join_url, start_url
         FROM classes
        WHERE course_id = ANY($1::int[])
        ORDER BY start_time DESC`,
      [courseIds]
    );

    res.json({ classes: rows });
  } catch (error) {
    console.error('getStudentClasses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};