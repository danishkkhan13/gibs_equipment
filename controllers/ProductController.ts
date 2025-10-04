import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Product } from "../models";  // Adjust to your model path
import BaseController from "./BaseController";

// Get the base URL from environment (localhost for development, actual domain for production)
const BASE_URL = process.env.BASE_URL || "http://localhost:8050"; // Default to localhost

export default class ProductController extends BaseController {

  /**
   * Helper function to save the uploaded file from memory storage to the disk
   */
  private saveFileToDisk(file?: Express.Multer.File): string | null {
    if (!file) return null;

    console.log("File received:", file); // Log the file object
    console.log("File buffer type:", typeof file.buffer); // Check the type of file.buffer
    console.log("File buffer length:", file.buffer?.length); // Log the length of the buffer

    if (!Buffer.isBuffer(file.buffer)) {
      console.log("Error: The file buffer is invalid.");
      return null;
    }

    const uploadDir = path.join(process.cwd(), "uploads/products");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    console.log("Saving file to:", filePath); // Log the file path
    fs.writeFileSync(filePath, file.buffer); // Write the buffer to disk

    return `/uploads/products/${fileName}`; // Return the URL to save in DB
  }

  /**
   * Get all products with image URL properly formatted
   */
  public getAll = async (_req: Request, res: Response) => {
    try {
      const products = await Product.findAll();
  
      const productsWithImage = products.map((product: any) => {
        const imageUrl = product.image_url ? `${BASE_URL}${product.image_url.replace(/^\/+/, '')}` : null;
        console.log("Image URL:", imageUrl); // Log the image URL for debugging
  
        return {
          ...product.dataValues,
          image_url: imageUrl, // Full URL for image
        };
      });
  
      return this.sendSuccess(res, productsWithImage, "Products fetched successfully");
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

      if (!name || price == null || !user_id) {
        return this.sendError(res, {}, "name, price, and user_id are required", 400);
      }

      // Ensure file is present in the request
      if (!req.file) {
        return this.sendError(res, {}, "No image file uploaded", 400); // Ensure file is uploaded
      }

      // Save image and get the URL path
      const image_url = this.saveFileToDisk(req.file);
      console.log("Image URL:", image_url); // Log the image URL for debugging

      // Create the product in the database
      const product = await Product.create({ name, description, price, user_id, image_url });
      return this.sendSuccess(res, product, "Product created successfully");
    } catch (err) {
      console.error("Error:", err); // Log any error
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  public getOne = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      if (!id) {
        return this.sendError(res, {}, "Product id is required in request body", 400);
      }
  
      const product = await Product.findByPk(id);
      if (!product) {
        return this.sendError(res, {}, "Product not found", 404);
      }
  
      // Ensure that the image_url is a full URL (including the base URL)
      const productWithImage = {
        ...product.dataValues,
        image_url: product.image_url
          ? `${BASE_URL}${product.image_url.replace(/^\/+/, '')}` // Concatenate BASE_URL with the image URL path
          : null, // If no image URL, return null
      };
  
      return this.sendSuccess(res, productWithImage, "Product fetched successfully");
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
  
      // Find the product to update
      const product = await Product.findByPk(id);
      if (!product) {
        return this.sendError(res, {}, "Product not found", 404);
      }
  
      // Default to the existing image URL if no new image is uploaded
      let image_url = product.image_url;
  
      if (req.file) {
        // Delete the old image file if a new one is uploaded
        const oldImagePath = path.join(process.cwd(), product.image_url || "");
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Delete old image from disk
        }
  
        // Save the new image file and get the URL
        image_url = this.saveFileToDisk(req.file);
        console.log("New Image URL:", image_url); // Log the new image URL
      }
  
      // Update the product with the new image URL and other fields
      await product.update({ name, description, price, user_id, image_url });
  
      return this.sendSuccess(res, product, "Product updated successfully");
    } catch (err) {
      console.error("Error:", err);
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
