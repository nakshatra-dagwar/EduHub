import { Router } from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { generateAccessToken, verifyRefreshToken } from "../utils/jwt";
import { Request, Response } from "express";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post("/refresh-token", (req: Request, res: any) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken({
      user_id: payload.user_id,
      role: payload.role,
    });

    return res.status(200).json({ token: newAccessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
});

export default router;
