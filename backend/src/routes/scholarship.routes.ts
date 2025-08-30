// import express from "express";
// import multer from "multer";
// import { authenticateToken } from "../middleware/authMiddleware";
// import {
//   uploadScholarshipForm,
//   getLatestScholarshipForm,
//   uploadFilledForm,
// } from "../controllers/scholarshipController";

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// // Admin uploads blank scholarship form
// router.post(
//   "/admin/scholarship/upload",
//   authenticateToken,
//   upload.single("form"),
//   uploadScholarshipForm
// );

// // Student fetches latest blank form
// router.get("/student/scholarship/form", authenticateToken, getLatestScholarshipForm);

// // Student uploads filled form
// router.post(
//   "/student/scholarship/upload",
//   authenticateToken,
//   upload.single("filledForm"),
//   uploadFilledForm
// );

// export default router;
