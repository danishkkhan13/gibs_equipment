import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Product } from "../models";
import BaseController from "./BaseController";

// Get the base URL from environment (localhost for development, actual domain for production)
const BASE_URL = process.env.BASE_URL || "http://localhost:8050"; // Default to localhost

export default class ProductController extends BaseController {
  /**
   * Helper function to save the uploaded file from memory storage to the disk
   */
  private saveFileToDisk(file?: Express.Multer.File): string | null {
    if (!file) return null;

    const uploadDir = path.join(process.cwd(), "uploads/products");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/products/${fileName}`; // URL path to save in the DB
  }

  /**
   * Get all products with image URL properly formatted
   */
  public getAll = async (_req: Request, res: Response) => {
    try {
      const products = await Product.findAll();

      // Ensure image URLs are full paths
      const productsWithImage = products.map((product: any) => {
        return {
          ...product.dataValues,
          image_url: product.image_url
            ? `${BASE_URL}${product.image_url}` // Full URL path for the image
            : null, // If no image, return null
        };
      });

      return this.sendSuccess(res, productsWithImage, "Products fetched successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Get single product by ID with image URL
   */
  public getOne = async (req: Request, res: Response) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return this.sendError(res, {}, "Product not found", 404);
      }

      const productWithImage = {
        ...product.dataValues,
        image_url: product.image_url
          ? `${BASE_URL}${product.image_url}` // Full URL path for the image
          : null, // If no image, return null
      };

      return this.sendSuccess(res, productWithImage, "Product fetched successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Create a new product
   */
  public create = async (req: Request, res: Response) => {
    try {
      const { name, description, price, user_id } = req.body;

      // Check if essential fields are provided
      if (!name || price == null || !user_id) {
        return this.sendError(res, {}, "name, price, and user_id are required", 400);
      }

      // Handle image upload and save to the file system
      const image_url = this.saveFileToDisk(req.file); // multer adds file to req.file

      // Create the product in the database
      const product = await Product.create({ name, description, price, user_id, image_url });

      return this.sendSuccess(res, product, "Product created successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };
  /**
   * Update a product (ID from body)
   */
  public update = async (req: Request, res: Response) => {
    try {
      const { id, name, description, price, user_id } = req.body;
      const product = await Product.findByPk(id);

      if (!product) {
        return this.sendError(res, {}, "Product not found", 404);
      }

      // If new image is uploaded, save it; else keep the existing image URL
      const image_url = req.file
        ? this.saveFileToDisk(req.file) // If new image, save it
        : product.getDataValue("image_url"); // Else keep the existing image URL

      await product.update({ name, description, price, user_id, image_url });

      return this.sendSuccess(res, product, "Product updated successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Delete a product (ID from body)
   */
  public delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;

      if (!id) return this.sendError(res, {}, "Product id is required", 400);

      const product = await Product.findByPk(id);
      if (!product) return this.sendError(res, {}, "Product not found", 404);

      await product.destroy();

      return this.sendSuccess(res, {}, "Product deleted successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };
}
