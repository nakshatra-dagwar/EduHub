import { Request, Response, RequestHandler } from "express";
import pool from "../config/db";
import { fetchCourseById } from "../services/courseService";
export const getAllCourses: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        c.course_id,
        c.title,
        c.description,
        c.base_price,
        c.created_at,
        c.start_date,
        c.duration,
        c.target_audience,
        c.weekly_outline,
        json_agg(
          DISTINCT jsonb_build_object('region_id', cp.region_id, 'price', cp.price)
        ) AS prices,
        json_agg(
          DISTINCT jsonb_build_object('teacher_id', t.user_id, 'full_name', t.full_name, 'bio', t.bio, 'avatar_url', t.avatar_url)
        ) AS teachers
      FROM courses c
      LEFT JOIN course_prices cp ON cp.course_id = c.course_id
      LEFT JOIN teacher_courses tc ON tc.course_id = c.course_id
      LEFT JOIN teacher_profiles t ON t.user_id = tc.teacher_id
      GROUP BY c.course_id
      ORDER BY c.created_at DESC`
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getCourseById: RequestHandler<{ id: string }> = async (req, res): Promise<void> => {
  const courseId = parseInt(req.params.id);

  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  try {
    const course = await fetchCourseById(courseId);

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
