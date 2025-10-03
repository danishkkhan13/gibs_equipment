import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models"; // ✅ from index.ts exports
import BaseController from "./BaseController";

export default class AuthController extends BaseController {
  /**
   * Register a new user
   */
  public register = async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return this.sendError(res, {}, "Name, Email and Password are required", 400);
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return this.sendError(res, {}, "Email already registered", 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword });

      return this.sendSuccess(
        res,
        { id: user.id, email: user.email },
        "User registered successfully"
      );
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Login user and return JWT token
   */
  public login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return this.sendError(res, {}, "Email and password are required", 400);
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return this.sendError(res, {}, "Invalid email or password", 401);
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return this.sendError(res, {}, "Invalid email or password", 401);
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1d" } // token valid for 1 day
      );

      return this.sendSuccess(res, {
        token,
        user: { id: user.id, name: user.name, email: user.email }
      }, "Login successful");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Get all users
   */
  public getAllUsers = async (_req: Request, res: Response) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "name", "email", "created_at", "updated_at"] // exclude password
      });

      return this.sendSuccess(res, users, "Users fetched successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };
}
