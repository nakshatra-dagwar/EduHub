import express, { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import pool from '../config/db';
import { authenticateToken } from '../middleware/authMiddleware';
import { AuthenticatedReq } from '../types/auth.types';

dotenv.config();
const router = express.Router();


router.get('/auth', authenticateToken,(req: AuthenticatedReq, res: any) => {
    //Verify role
    if (req.user?.role !== 'TEACHER') {
      return res.status(403).json({ message: 'Only teachers may connect Zoom.' });
    }

    
    const userId      = req.user.user_id;
    const clientId    = process.env.ZOOM_CLIENT_ID!;
    const redirectUri = process.env.ZOOM_REDIRECT_URI!;
    // We pass userId in state so we know who’s coming back
    const state       = encodeURIComponent(String(userId));

    const url =
      `https://zoom.us/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;

    // 3️⃣ Redirect browser to Zoom’s consent screen
    res.redirect(url);
  }
);

// ─── STEP 2: Handle Zoom’s callback ───────────────────────────────────────────
// Zoom will redirect here with ?code=…&state=<userId>
router.get('/callback', async (req: Request, res: any) => {
  const code  = req.query.code  as string | undefined;
  const state = req.query.state as string | undefined;
  if (!code || !state) {
    return res.status(400).send('Missing code or state');
  }

  // 1️⃣ Recover userId from state
  const userId = parseInt(decodeURIComponent(state), 10);
  if (isNaN(userId)) {
    return res.status(400).send('Invalid state');
  }

  // 2️⃣ Exchange code for tokens
  const clientId     = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;
  const redirectUri  = process.env.ZOOM_REDIRECT_URI!;
  const tokenUrl     = 'https://zoom.us/oauth/token';

  // Basic Auth header: “ClientID:ClientSecret”
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const tokenRes: AxiosResponse = await axios.post(
      `${tokenUrl}` +
        `?grant_type=authorization_code` +
        `&code=${encodeURIComponent(code)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}`,
      {},
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 3️⃣ Read tokens
    const { access_token, refresh_token, expires_in } = tokenRes.data as {
      access_token:  string;
      refresh_token: string;
      expires_in:    number;
    };

    // 4️⃣ Compute absolute expiry time
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // 5️⃣ Upsert into zoom_credentials
    await pool.query(
      `INSERT INTO zoom_credentials
         (user_id, access_token, refresh_token, expires_at)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id) DO UPDATE
         SET access_token  = EXCLUDED.access_token,
             refresh_token = EXCLUDED.refresh_token,
             expires_at    = EXCLUDED.expires_at`,
      [userId, access_token, refresh_token, expiresAt]
    );

    // 6️⃣ Done—redirect to your frontend dashboard
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard/teacher?zoom_connected=true`);
  } catch (err: any) {
    console.error('Zoom OAuth error:', err.response?.data || err.message);
    res.status(500).send('Zoom authentication failed');
  }
});

export default router;