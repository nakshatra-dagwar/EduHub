import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (
to: string, subject: string, text: string, html?: string, emails?: any[]) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
};

export function otpEmailTemplate(userName: string, otp: string): string {
  return `
    <div style="background: #111; color: #fff; padding: 32px; border-radius: 8px; font-family: Arial, sans-serif;">
              <h1 style="color: #fff; text-align: center;">Welcome to EduHub</h1>
      <p style="font-size: 18px;">Welcome ${userName},</p>
      <p style="font-size: 16px;">
        Please verify your email address using the OTP below:
      </p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 24px 0; text-align: center;">
        ${otp}
      </div>
      <p style="font-size: 14px;">This OTP is valid for 10 minutes.</p>
      <p style="font-size: 14px;">If you did not request this, please ignore this email.</p>
    </div>
  `;
}