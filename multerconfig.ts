import multer from "multer";
import path from "path";

// Storage setup for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products"); // Save uploaded images to "uploads/products"
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Unique filename based on timestamp
  }
});

export const uploadFile = multer({ storage });
