import { Request } from "express";

export interface JwtUser {
  user_id: number;
  role: string;
  email: string;
  full_name:string;
}

export interface AuthenticatedReq extends Request {
  user?: {
    user_id: number;
    role: string;
    email: string;
    full_name:string;
  };
}
