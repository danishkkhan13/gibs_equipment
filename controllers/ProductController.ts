import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { Product, Category } from "../models";  // Import both models
import BaseController from "./BaseController";

const BASE_URL = process.env.BASE_URL || "http://localhost:8050"; // Default to localhost

export default class ProductController extends BaseController {

  private saveFileToDisk(file?: Express.Multer.File): string | null {
    if (!file) return null;

    if (!Buffer.isBuffer(file.buffer)) {
      return null;
    }

    const uploadDir = path.join(process.cwd(), "uploads/products");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return `/uploads/products/${fileName}`; // Return the URL to save in DB
  }

  // Get all products with category filter
  public getAll = async (req: Request, res: Response) => {
    try {
      const { category_id } = req.query;

      const where: any = {};
      if (category_id) {
        where.category_id = category_id as string; // Filter by category_id
      }

      const products = await Product.findAll({
        where,
        order: [["createdAt", "DESC"]],
        include: [{
          model: Category,
          as: "category",
          attributes: ["id", "name"],
          where: { is_hidden: false } // Only include products from visible categories
        }],
      });

      const productsWithImage = products.map((product: any) => {
        const imageUrl = product.image_url ? `${BASE_URL}${product.image_url.replace(/^\/+/, '')}` : null;
        return {
          ...product.dataValues,
          image_url: imageUrl,
        };
      });

      return this.sendSuccess(res, productsWithImage, "Products fetched successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };
  public getAllproduct = async (_req: Request, res: Response) => {
    try {
      const products = await Product.findAll({
        include: [{ model: Category, as: "category" }],  // Optionally include category details
        order: [["createdAt", "DESC"]],  // Sort by created date (optional)
      });

      return res.status(200).json({ success: true, data: products });
    } catch (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
  };

  // Create a new product
  public create = async (req: Request, res: Response) => {
    try {
      const { name, description, user_id, meta_title, meta_description, category_id } = req.body;

      if (!name || !user_id || !category_id) {
        return this.sendError(res, {}, "name, user_id, category_id, meta_title, and meta_description are required", 400);
      }

      if (!req.file) {
        return this.sendError(res, {}, "No image file uploaded", 400);
      }

      const image_url = this.saveFileToDisk(req.file);

      const category = await Category.findByPk(category_id);
      if (!category) {
        return this.sendError(res, {}, "Category not found", 404);
      }

      const product = await Product.create({
        name,
        description,
        user_id,
        image_url,
        meta_title,
        meta_description,
        category_id,
      });

      return this.sendSuccess(res, product, "Product created successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  // Get product by ID
  public getOne = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return this.sendError(res, {}, "Product id is required", 400);
      }

      const product = await Product.findByPk(id, {
        include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
      });

      if (!product) {
        return this.sendError(res, {}, "Product not found", 404);
      }

      const productWithImage = {
        ...product.dataValues,
        image_url: product.image_url ? `${BASE_URL}${product.image_url.replace(/^\/+/, '')}` : null,
      };

      return this.sendSuccess(res, productWithImage, "Product fetched successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  // Update product
  public update = async (req: Request, res: Response) => {
    try {
      const { id, name, description, user_id, meta_title, meta_description, category_id } = req.body;

      if (!category_id) {
        return this.sendError(res, {}, "category_id is required", 400);
      }

      const product = await Product.findByPk(id);
      if (!product) {
        return this.sendError(res, {}, "Product not found", 404);
      }

      const category = await Category.findByPk(category_id);
      if (!category) {
        return this.sendError(res, {}, "Category not found", 404);
      }

      let image_url = product.image_url;

      if (req.file) {
        const oldImagePath = path.join(process.cwd(), product.image_url || "");
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }

        image_url = this.saveFileToDisk(req.file);
      }

      await product.update({
        name,
        description,
        user_id,
        image_url,
        meta_title,
        meta_description,
        category_id,
      });

      return this.sendSuccess(res, product, "Product updated successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  // Delete product
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
  /**
 * Create a product quote and send via email
 */
  public sendQuote = async (req: Request, res: Response) => {
    try {
      const { mobileNumber, name, description, image } = req.body;

      // Validate input
      if (!mobileNumber || !name || !description || !image) {
        return this.sendError(res, {}, "Mobile number and product details (name, description, and image URL) are required", 400);
      }

      // Prepare the email body for the product
      const emailBody = `
          <h3>Quote for Product</h3>
          <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
          <table border="1" cellpadding="10">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><img src="${image}" alt="${name}" style="width: 100px; height: 100px;" /></td>
                <td>${name}</td>
                <td>${description}</td>
              </tr>
            </tbody>
          </table>
        `;

      // Create the transporter for sending emails using custom SMTP server
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // Use your SMTP host (e.g., mail.dynsimulation.com)
        port: Number(process.env.SMTP_PORT), // Use your SMTP port (587)
        secure: false, // True for 465, false for other ports (587 is non-secure)
        auth: {
          user: process.env.SMTP_USER, // SMTP user (e.g., webmaster@dynsimulation.com)
          pass: process.env.SMTP_PASS, // SMTP password
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates (optional)
        },
      });

      // Setup email options
      const mailOptions = {
        from: process.env.SMTP_FROM, // Sender email address
        to: "danishkkhan13@gmail.com", // Recipient email address (client)
        subject: `New Product Quote: ${name}`, // Subject with product name
        html: emailBody, // Email body in HTML format
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
          return this.sendError(res, error, "Failed to send quote", 500);
        } else {
          console.log("Email sent: " + info.response);
          return this.sendSuccess(res, {}, "Quote sent successfully");
        }
      });

    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };


  public createCategory = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name) {
        return this.sendError(res, {}, "Category name is required", 400);
      }

      // The 'unique' constraint on the name column in the Category model
      // will prevent duplicates. We can rely on the database to enforce this.
      const category = await Category.create({ name });

      return this.sendSuccess(res, category, "Category created successfully", 201);
    } catch (err: any) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return this.sendError(res, err, "Category with this name already exists", 409);
      }
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Get all categories
   */
  public getCategories = async (_req: Request, res: Response) => {
    try {
      const categories = await Category.findAll({
        where: { is_hidden: false }, // Filter out hidden categories
        order: [["name", "ASC"]]
      });
      return this.sendSuccess(res, categories, "Categories fetched successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Get a single category by its ID
   */
  public getCategoryById = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;

      if (!id) {
        return this.sendError(res, {}, "Category ID is required", 400);
      }

      const category = await Category.findByPk(id);

      if (!category) {
        return this.sendError(res, {}, "Category not found", 404);
      }

      return this.sendSuccess(res, category, "Category fetched successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  
  public updateCategory = async (req: Request, res: Response) => {
    try {
      const { id, name } = req.body;

      if (!id || !name) {
        return this.sendError(res, {}, "Category ID and name are required", 400);
      }

      const category = await Category.findByPk(id);

      if (!category) {
        return this.sendError(res, {}, "Category not found", 404);
      }

      await category.update({ name });

      return this.sendSuccess(res, category, "Category updated successfully");
    } catch (err: any) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return this.sendError(res, err, "A category with this name already exists", 409);
      }
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  
  public deleteCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;

      if (!id) {
        return this.sendError(res, {}, "Category ID is required", 400);
      }

      // Check if any products are associated with this category
      const productCount = await Product.count({ where: { category_id: id } });
      if (productCount > 0) {
        return this.sendError(res, {}, "Cannot delete category as it is associated with existing products", 400);
      }

      const category = await Category.findByPk(id);
      if (!category) {
        return this.sendError(res, {}, "Category not found", 404);
      }

      await category.destroy();

      return this.sendSuccess(res, {}, "Category deleted successfully");
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };

  /**
   * Toggles the visibility of a category (hide or unhide).
   */
  public hideCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;

      if (!id) {
        return this.sendError(res, {}, "Category ID is required", 400);
      }

      const category = await Category.findByPk(id);

      if (!category) {
        return this.sendError(res, {}, "Category not found", 404);
      }

      // Toggle the current is_hidden status
      const is_hidden = !category.is_hidden;
      await category.update({ is_hidden });

      const message = is_hidden ? "Category hidden successfully" : "Category unhidden successfully";
      return this.sendSuccess(res, category, message);
    } catch (err) {
      return this.sendError(res, err, "Internal server error", 500);
    }
  };
}
