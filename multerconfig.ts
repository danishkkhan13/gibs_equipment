import multer from "multer";
import path from "path";

// Storage setup for multer (using memory storage)
const storage = multer.memoryStorage(); // Store file in memory

export const uploadFile = multer({ storage });
