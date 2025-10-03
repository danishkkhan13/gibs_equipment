import multer from "multer";
import { Request } from "express";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = ["application/pdf"];
const ALLOWED_EXCEL_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (
    [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES, ...ALLOWED_EXCEL_TYPES].includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WEBP, PDF, CSV, and Excel files are allowed."
      )
    );
  }
};

export const uploadFile = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});
