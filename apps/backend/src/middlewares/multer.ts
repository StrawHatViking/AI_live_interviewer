import type { Request } from "express";
import multer from "multer";
import type { FileFilterCallback } from "multer";
import path from "path";

// 1. Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// 2. Strongly typed file filter for PDFs
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === "application/pdf";

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"));
  }
};

// 3. Export the memory-based upload middleware
export const uploadPdfInMemory = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
