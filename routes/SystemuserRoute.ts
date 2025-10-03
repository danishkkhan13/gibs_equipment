import { Router } from "express";
import AuthController from "../controllers/AuthController";
import ProductController from "../controllers/ProductController";
import { uploadFile } from "../multerconfig"; // ✅ use your existing multer config

const router = Router();

const authController = new AuthController();
const productController = new ProductController();

/* ---------------------- AUTH ---------------------- */
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users", authController.getAllUsers);

/* ---------------------- PRODUCTS ---------------------- */
// ✅ use uploadFile.single("image") to accept an image file with the field name "image"
router.post("/products", uploadFile.single("image"), productController.create);
router.get("/products", productController.getAll);
router.get("/products/:id", productController.getOne);
router.put("/products/:id", uploadFile.single("image"), productController.update);
router.delete("/products/:id", productController.delete);

export default router;
