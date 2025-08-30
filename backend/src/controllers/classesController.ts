import { RequestHandler } from 'express';
import pool from '../config/db';
import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { CreateClassBody } from '../types/classes.types';

dotenv.config();

const ZOOM_TOKEN_URL   = 'https://zoom.us/oauth/token';
const ZOOM_MEETING_URL = 'https://api.zoom.us/v2/users/me/meetings';

interface JWTPayload {
  user_id: number;
  full_name: string;
  role: string;
  email?:string;
}
interface AuthRequest extends Request {
  user?: JWTPayload;
}

interface JoinRequest extends Request {
  params: any;
  user?: JWTPayload;
}

/**
 * POST /api/classes
 * Teachers schedule a 10‑week recurring Zoom meeting for a course.
 */
export const createClass = async (req: CreateClassBody, res:any) => {
  const user = req.user;
  if (!user || user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Only teachers may schedule classes.' });
  }

  const { course_id, topic, start_time, duration } = req.body;
  if (!course_id || !topic || !start_time || !duration) {
    return res
      .status(400)
      .json({ message: 'Required: course_id, topic, start_time, duration.' });
  }

  try {
    // Verify if the teacher actually teaches this course
    const tc = await pool.query(
      `SELECT 1
         FROM teacher_courses
        WHERE teacher_id = $1
          AND course_id  = $2`,
      [user.user_id, course_id]
    );
    if (!tc.rows.length) {
      return res.status(403).json({ message: "You don't teach this course." });
    }

    // 2) Fetch & refresh Zoom tokens if needed
    const { rows: tokenRows } = await pool.query(
      `SELECT access_token, refresh_token, expires_at
         FROM zoom_credentials
        WHERE user_id = $1`,
      [user.user_id]
    );
    if (!tokenRows.length) {
      return res
        .status(400)
        .json({ message: 'Zoom not connected. Call /api/zoom/auth first.' });
    }
    let { access_token, refresh_token, expires_at } = tokenRows[0] as {
      access_token: string;
      refresh_token: string;
      expires_at: Date;
    };

    if (new Date(expires_at).getTime() <= Date.now()) {
      const basicAuth = Buffer.from(
        `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
      ).toString('base64');

      const tokenRes: AxiosResponse = await axios.post(
        `${ZOOM_TOKEN_URL}` +
          `?grant_type=refresh_token` +
          `&refresh_token=${encodeURIComponent(refresh_token)}`,
        {},
        { headers: { Authorization: `Basic ${basicAuth}` } }
      );
      const data = tokenRes.data as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
      access_token  = data.access_token;
      refresh_token = data.refresh_token;
      expires_at    = new Date(Date.now() + data.expires_in * 1000);

      await pool.query(
        `UPDATE zoom_credentials
            SET access_token  = $1,
                refresh_token = $2,
                expires_at    = $3
          WHERE user_id = $4`,
        [access_token, refresh_token, expires_at, user.user_id]
      );
    }

    // 10‑week recurring Zoom meeting, since a single meeting link will be provided
    const weekday = new Date(start_time).getUTCDay() + 1; // Zoom uses 1=Sunday
    const meetingPayload = {
      topic,
      type: 8, // recurring meeting
      start_time,
      duration,
      timezone: 'UTC',
      recurrence: {
        type:            2,          // weekly
        repeat_interval: 1,
        weekly_days:     String(weekday),
        end_times:       10          // 10 sessions
      }
    };
    const meetingRes: AxiosResponse = await axios.post(
      ZOOM_MEETING_URL,
      meetingPayload,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const { id: zoom_meeting_id, join_url, start_url } = meetingRes.data;


    const { rows: profRows } = await pool.query(
      `SELECT full_name FROM teacher_profiles WHERE user_id = $1`,
      [user.user_id]
    );
    const full_name = profRows[0]?.full_name;
    if (!full_name) {
      return res.status(500).json({ message: 'Instructor name not found.' });
    }

    // 4) Save into classes table
    const insert = await pool.query(
      `INSERT INTO classes
         (course_id, user_id, full_name, topic, start_time, duration,
          zoom_meeting_id, join_url, start_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        course_id,
        user.user_id,
        full_name,
        topic,
        start_time,
        duration,
        zoom_meeting_id,
        join_url,
        start_url
      ]
    );
    const class_id = insert.rows[0].id;

    return res.status(201).json({ class_id, join_url });
  } catch (err) {
    console.error('createClass error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /api/classes/:id/join
 * Redirect any user into the Zoom meeting.
 */
export const joinClass = async (req: JoinRequest, res: any) => {
  
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  //students may join via this route
  if (user.role !== 'STUDENT') {
    return res.status(403).json({ message: 'Only students may join classes' });
  }

  // Validate class ID
  const class_id = Number(req.params.id);
  if (isNaN(class_id)) {
    return res.status(400).json({ message: 'Invalid class ID' });
  }

  // Fetch the class to get its course_id and join_url
  const { rows: classRows } = await pool.query(
    `SELECT course_id, join_url
       FROM classes
      WHERE id = $1`,
    [class_id]
  );
  if (!classRows.length) {
    return res.status(404).json({ message: 'Class not found' });
  }
  const { course_id, join_url } = classRows[0];

  // Check enrollment
  const { rows: enrollRows } = await pool.query(
    `SELECT 1
       FROM enrollments
      WHERE course_id = $1
        AND student_id = $2`,
    [course_id, user.user_id]
  );
  if (!enrollRows.length) {
    return res.status(403).json({ message: 'You are not enrolled in this class' });
  }

  // redirect them to Zoom
  return res.redirect(join_url);
};

export const getClass = async (req: any, res: any) => {
  const class_id = Number(req.params.id);
  if (isNaN(class_id)) return res.status(400).json({message:'Invalid class ID'});
  const { rows } = await pool.query(
    `SELECT id, topic, start_time, duration, join_url, start_url
       FROM classes WHERE id=$1`,
    [class_id]
  );
  if (!rows.length) return res.status(404).json({message:'Not found'});
  res.json(rows[0]);
}