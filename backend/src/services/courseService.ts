// services/courseService.ts
import pool from "../config/db";

export const fetchCourseById = async (courseId: number) => {
  const courseQuery = `
    SELECT 
      c.course_id,
      c.title,
      c.description,
      c.start_date,
      c.duration,
      c.target_audience,
      c.weekly_outline,
      c.base_price,
      c.created_at,
      json_agg(DISTINCT jsonb_build_object(
        'teacher_id', u.user_id,
        'full_name', tp.full_name,
        'bio', tp.bio,
        'avatar_url', tp.avatar_url
      )) AS teachers,
      json_agg(DISTINCT jsonb_build_object(
        'region_id', cp.region_id,
        'price', cp.price
      )) AS regional_prices
    FROM courses c
    LEFT JOIN teacher_courses tc ON c.course_id = tc.course_id
    LEFT JOIN teacher_profiles tp ON tp.user_id = tc.teacher_id
    LEFT JOIN users u ON u.user_id = tp.user_id
    LEFT JOIN course_prices cp ON cp.course_id = c.course_id
    WHERE c.course_id = $1
    GROUP BY c.course_id;
  `;

  const result = await pool.query(courseQuery, [courseId]);
  return result.rows[0];
};
