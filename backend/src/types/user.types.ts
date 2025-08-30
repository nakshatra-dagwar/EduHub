export type UserRole = "ADMIN" | "STUDENT" | "PARENT" | "TEACHER";

export interface SignUpInput {
  email: string;
  password: string;
  confirmPassword?: string;
  full_name: string;
  role: UserRole;
  grade_level?: number; // For Student role
  phone_no?: string;
  parent_id?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}
