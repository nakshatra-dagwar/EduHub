import { Request, RequestHandler, Response } from "express";
import pool from "../config/db";
import {
  SignUpInput,
  LoginInput,
  ResetPasswordInput,
} from "../types/user.types";
import hashPassword from "../utils/hash";
import comparePassword from "../utils/comparePassword";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import generateOTP from "../utils/generateOTP";
import { sendEmail, otpEmailTemplate } from "../utils/sendEmail";
import { send } from "process";
import crypto from "crypto";

export const signup = async (req: Request, res: Response): Promise<any> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      email,
      password,
      confirmPassword,
      full_name,
      role,
      grade_level,
      phone_no,
      parent_id,
    } = req.body as SignUpInput;
    const allowedRoles = ["ADMIN", "STUDENT", "PARENT", "TEACHER"];
    if (!allowedRoles.includes(role)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!email || !full_name || !password) {
      await client.query("ROLLBACK");
      res.status(400);
      throw new Error("Email, full name, and password are required.");
    }

    if (password !== confirmPassword) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (role === "STUDENT") {
      if (grade_level === undefined || !phone_no) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Grade level and phone number are required for students.",
        });
      }
    }

    if (role === "PARENT") {
      if (!phone_no) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Phone number is required for parents.",
        });
      }
    }
    const existingUser = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Email already in Use" });
    }

    const hashedPassword = await hashPassword(password);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const userResult = await client.query(
      `INSERT INTO users(email, password_hash, role, email_verification_code, email_code_expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, role`,
      [email, hashedPassword, role, otp, otpExpiry]
    );

    const user_id = userResult.rows[0].user_id;

    if (role == "STUDENT") {
      await client.query(
        `INSERT INTO student_profiles (user_id,full_name,grade_level,phone_no,parent_id)
        VALUES ($1,$2,$3,$4,$5)`,
        [user_id, full_name, grade_level, phone_no, parent_id]
      );
    } else if (role == "PARENT") {
      await client.query(
        `INSERT INTO parent_profiles (user_id,full_name,phone_no)
            VALUES ($1,$2,$3)
            `,
        [user_id, full_name, phone_no]
      );
    } else if (role == "TEACHER") {
      await client.query(
        `INSERT INTO teacher_profiles (user_id, full_name)
            VALUES ($1,$2)
            `,
        [user_id, full_name]
      );
    }

    await client.query("COMMIT");

    await sendEmail(
      email,
      "Verify your Email",
      `Your OTP code is: ${otp}`,
      otpEmailTemplate(full_name, otp.toString())
    );
    return res.status(201).json({
      message: "Sign up successful. OTP sent to your email.",
      user_id,
      role,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("SignUp error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body as LoginInput;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const userResult = await pool.query(
      "Select * from users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const user = userResult.rows[0];

    if (!user.is_verified) {
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in." });
    }
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const responseData: any = {
      message: "Login successful",
      user_id: user.user_id,
      role: user.role,
    };

    if (user.role === "STUDENT") {
      const studentRes = await pool.query(
        "SELECT full_name, grade_level FROM student_profiles WHERE user_id = $1",
        [user.user_id]
      );
      Object.assign(responseData, studentRes.rows[0]);
    } else if (user.role === "PARENT") {
      const parentRes = await pool.query(
        "SELECT full_name FROM parent_profiles WHERE user_id = $1",
        [user.user_id]
      );
      Object.assign(responseData, parentRes.rows[0]);
    } else if (user.role === "TEACHER") {
      const teacherRes = await pool.query(
        "SELECT full_name FROM teacher_profiles WHERE user_id = $1",
        [user.user_id]
      );
      Object.assign(responseData, teacherRes.rows[0]);
    }

    const accessToken = generateAccessToken({
      user_id: user.user_id,
      role: user.role,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      user_id: user.user_id,
      role: user.role,
      email: user.email,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // set true in prod w/ HTTPS
      sameSite: "lax",
      maxAge: 30 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set true in prod w/ HTTPS
      sameSite: "lax",
      maxAge: 5 * 24 * 60 * 60 * 1000,
    });

    //Return token + user info
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      ...responseData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    sameSite: "lax",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const userRes = await pool.query(
      "SELECT email_verification_code, email_code_expires_at FROM users WHERE email = $1",
      [email]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userRes.rows[0];
    if (
      user.email_verification_code !== otp ||
      new Date() > new Date(user.email_code_expires_at)
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    await pool.query(
      "UPDATE users SET is_verified = TRUE, email_verification_code = NULL, email_code_expires_at = NULL WHERE email = $1",
      [email]
    );
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resendOTP = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const userRes = await pool.query(
      "SELECT is_verified FROM users WHERE email = $1",
      [email]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userRes.rows[0].is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "UPDATE users SET email_verification_code = $1, email_code_expires_at = $2 WHERE email = $3",
      [otp, otpExpiry, email]
    );

    await sendEmail(email, "Verify your Email", `Your OTP code is: ${otp}`);
    return res.status(200).json({ message: "OTP resent to your email" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword  = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body as ResetPasswordInput;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // find user
  const { rows } = await pool.query(
    `SELECT user_id FROM users WHERE email = $1`,
    [email]
  );
  if (!rows.length) {
    return res
      .status(200)
      .json({
        message: "If that account exists, you’ll get an email shortly.",
      });
  }
  const user_id = rows[0].user_id;

  // generate token + expiration
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await pool.query(
    `INSERT INTO password_resets(reset_token, user_id, expires_at)
     VALUES($1,$2,$3)
     ON CONFLICT(reset_token) DO UPDATE
       SET user_id = $2, expires_at = $3, created_at = now()`,
    [resetToken, user_id, expiresAt]
  );

  // send email
  // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  if (!process.env.FRONTEND_URL) {
    await sendEmail(
      email,
      "Reset your password",
      `Click here to reset your password: ${resetToken}`,
      `<p>You requested a password reset. Click <a href="${resetToken}">this link</a> to choose a new one. It expires in 1 hour.</p>`
    );
  } else {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      "Reset your password",
      `Click here to reset your password: ${resetLink}`,
      `<p>You requested a password reset. Click <a href="${resetLink}">this link</a> to choose a new one. It expires in 1 hour.</p>`
    );
  }

  return res.json({
    message: "If that account exists, you’ll get an email shortly.",
  });
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, password, confirmPassword } = req.body as ResetPasswordInput;
  if (!token || !password || !confirmPassword)
    return res
      .status(400)
      .json({ message: "token, password & confirmPassword required" });

  if (password !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  
  const { rows } = await pool.query(
    `SELECT user_id, expires_at FROM password_resets WHERE reset_token = $1`,
    [token]
  );
  if (!rows.length)
    return res.status(400).json({ message: "Invalid or expired token" });

  const { user_id, expires_at } = rows[0];
  if (new Date(expires_at) < new Date())
    return res.status(400).json({ message: "Token has expired" });

  // hash & update password
  const hashed = await hashPassword(password);
  await pool.query(`UPDATE users SET password_hash = $1 WHERE user_id = $2`, [
    hashed,
    user_id,
  ]);

  // remove the reset row
  await pool.query(`DELETE FROM password_resets WHERE reset_token = $1`, [
    token,
  ]);

  return res.json({ message: "Password has been reset successfully." });
};
