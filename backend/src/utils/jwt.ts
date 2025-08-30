import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const ACCESS_EXPIRES_IN = "20m";
const REFRESH_EXPIRES_IN = "7d";

export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, REFRESH_SECRET);
};