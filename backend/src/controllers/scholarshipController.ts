// src/controllers/scholarship.controller.ts

import { Request, Response } from "express";
import pool from "../config/db";

export const uploadScholarshipForm = async (req: Request, res: Response) => {
  const { title, description, eligibility, amount, deadline, document_url, created_by } = req.body;

  try {
    // Optional: Verify user is an admin
    const adminCheck = await pool.query(
      "SELECT role FROM users WHERE user_id = $1",
      [created_by]
    );

    if (adminCheck.rows[0]?.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins can upload scholarships" });
    }

    const result = await pool.query(
      `INSERT INTO scholarships (title, description, eligibility, amount, deadline, document_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, eligibility, amount, deadline, document_url, created_by]
    );

    res.status(201).json({ message: "Scholarship uploaded successfully", data: result.rows[0] });
  } catch (err) {
    console.error("Error uploading scholarship:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
