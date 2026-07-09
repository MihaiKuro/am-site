import express from "express";
import {
	getAllCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	addSubcategory,
	updateSubcategory,
	deleteSubcategory,
} from "../controllers/category.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);

// Admin routes
router.post("/", protectRoute, adminRoute, createCategory);
router.put("/:id", protectRoute, adminRoute, updateCategory);
router.delete("/:id", protectRoute, adminRoute, deleteCategory);

// Subcategory routes
router.post("/:id/subcategories", protectRoute, adminRoute, addSubcategory);
router.put("/:categoryId/subcategories/:subcategoryId", protectRoute, adminRoute, updateSubcategory);
router.delete("/:categoryId/subcategories/:subcategoryId", protectRoute, adminRoute, deleteSubcategory);

export default router; 