import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token =
    req.cookies?.accessToken ||
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      user_id: number;
      role: string;
      email: string;
      full_name:string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};