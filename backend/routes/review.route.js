import express from "express";
import {
	createProductReview,
	deleteReview,
	getProductReviews,
} from "../controllers/review.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", protectRoute, createProductReview);
router.delete("/:id", protectRoute, deleteReview);

export default router;
