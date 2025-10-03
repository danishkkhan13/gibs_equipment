import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Product } from "../models";
import BaseController from "./BaseController";

export default class ProductController extends BaseController {
  /**
   * Helper: save file buffer from memoryStorage to /uploads/products and return URL path
   */
  private saveFileToDisk(file?: Express.Multer.File): string | null {
    if (!file) return null;

    const uploadDir = path.join(process.cwd(), "uploads/products");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/products/${fileName}`;
  }

  /**
   * Create a new product
   */
  public create = async (req: Request, res: Response) => {
    try {
      const { name, description, price, user_id } = req.body;

      if (!name || price == null || !user_id) {
        return this.sendError(res, {}, "name, price, and user_id are required", 400);
      }

      const image_url = this.saveFileToDisk(req.file || undefined);

      const product = await Product.create({ name, description, price, user_id, image_url });

      return this.sendSuccess(res, product, "Product created successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Get all products
   */
  public getAll = async (_req: Request, res: Response) => {
    try {
      const products = await Product.findAll();
      return this.sendSuccess(res, products, "Products fetched successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Get single product by ID
   */
  public getOne = async (req: Request, res: Response) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return this.sendError(res, {}, "Product not found", 404);
      }
      return this.sendSuccess(res, product, "Product fetched successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Update a product
   */
  public update = async (req: Request, res: Response) => {
    try {
      const { name, description, price, user_id } = req.body;
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        return this.sendError(res, {}, "Product not found", 404);
      }

      const image_url = req.file ? this.saveFileToDisk(req.file) : product.getDataValue("image_url");

      await product.update({ name, description, price, user_id, image_url });

      return this.sendSuccess(res, product, "Product updated successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Delete a product
   */
  public delete = async (req: Request, res: Response) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return this.sendError(res, {}, "Product not found", 404);
      }

      await product.destroy();
      return this.sendSuccess(res, {}, "Product deleted successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };
}
