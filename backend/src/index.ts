import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import pool from "./config/db";
import cookieParser from "cookie-parser";
import protectedRoutes from "./routes/protected.routes";
import teacherRoutes from "./routes/teacher.routes";
import teacherEmailRoutes from "./routes/teacher.routes";
import studentRoutes from "./routes/student.routes";
import adminRoutes from "./routes/admin.routes";
import zoomAuth from './routes/zoom.auth'
import path from "path";
import courseRoutes from "./routes/course.routes";

import { fileURLToPath } from "url";
import classesRoutes from "./routes/classes.routes";

// These lines replicate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,// allow requests from your frontend
  credentials: true // allow cookies/authorization headers
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes, classesRoutes, courseRoutes);
app.use("/api/zoom", zoomAuth);
app.use("/api/teacher", teacherRoutes);
app.use("/api/teacher", teacherEmailRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));



// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("EduHub backend");
});

//Db Conncetion & Start Server
pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
    app.listen(PORT, () => {
      console.log(`Servers running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });



