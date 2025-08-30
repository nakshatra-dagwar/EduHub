import express from 'express';
import { createClass, getClass, joinClass } from '../controllers/classesController';
import pool from '../config/db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Teachers schedule a course’s 10‑week Zoom meeting
router.post('/classes', authenticateToken, createClass);

// Students (or anyone) join via redirect
router.get('/classes/:id/join', authenticateToken, joinClass);

router.get('/classes/:id', authenticateToken, getClass)

// Teachers: list class by course for dashboard cards
router.get('/classes/by-course/:courseId', authenticateToken, async (req, res) => {
  const user = (req as any).user;
  if (!user || user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Only teachers may view classes for their course.' });
  }
  const courseId = Number(req.params.courseId);
  if (isNaN(courseId)) return res.status(400).json({ message: 'Invalid course ID' });
  try {
    const { rows } = await pool.query(
      `SELECT id, topic, start_time, duration, join_url, start_url
         FROM classes WHERE course_id = $1
         ORDER BY start_time DESC LIMIT 1`,
      [courseId]
    );
    if (!rows.length) return res.status(404).json({ message: 'No class scheduled for this course' });
    res.json(rows[0]);
  } catch (err) {
    console.error('by-course error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
})

export default router;