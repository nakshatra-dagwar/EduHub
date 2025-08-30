import type { Request, Response } from 'express';

export interface CreateClassBody {
  body: { course_id: any; topic: any; start_time: any; duration: any; };
  course_id: number;
  topic: string;
  start_time: string;
  duration: number;
  user?: {
    full_name: any;
    user_id: number;
    role: string;
    email: string;
  };
}