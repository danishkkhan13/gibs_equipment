import express, { Express, Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

import SystemuserRouter from "./routes/SystemuserRoute";
import { sequelize } from "./models";
import { syncDatabase } from "./database/sync"; // ✅ correct import of the sync function

dotenv.config();

// Log GIBS_EQUIPMENT variable from environment
console.log("🛠️ GIBS_EQUIPMENT =", process.env.GIBS_EQUIPMENT);

const app: Express = express();

// --- Serve static files (uploads folder) ---
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// --- Port setup from environment variable ---
const port = Number(process.env.GIBS_EQUIPMENT) || 3000; // Default to 3000 if GIBS_EQUIPMENT is not defined

// --- Middleware ---
app.use(
  cors({
    origin: "*", // Allow all origins (adjust as needed)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false, // If you don't need credentials, set to false
  })
);
app.use(express.json()); // JSON parsing middleware
app.use(express.urlencoded({ extended: true })); // URL encoded body parser

// --- Routes ---
app.use("/api/v1/gibsequipment", SystemuserRouter);

// Basic test route to ensure server is running
app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript server is running.");
});

// --- Initialize server ---
async function startServer() {
  try {
    console.log("📦 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    await syncDatabase(sequelize);

    console.log("🚀 Launching server...");
    app.listen(port, "0.0.0.0", () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); // Exit process with failure code
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

// Start the server
startServer();
