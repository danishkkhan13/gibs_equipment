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
router.post("/products", uploadFile.single("image"), productController.create); // Using multer for image upload
router.get("/allproducts", productController.getAll);
router.get("/getallproduct", productController.getAllproduct);
router.post("/singleproduct", productController.getOne);
router.post("/sendqoute", productController.sendQuote);
router.put("/updateproduct", uploadFile.single("image"), productController.update); // Using multer for image upload
router.delete("/deleteproduct", productController.delete);
router.get("/getcategories", productController.getCategories);
router.post("/getcategoryById", productController.getCategoryById);

router.post("/createCategory", productController.createCategory);

export default router;
