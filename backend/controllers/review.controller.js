import mongoose from "mongoose";
import Review from "../models/review.model.js";

export const getProductReviewStats = async (productId) => {
	const stats = await Review.aggregate([
		{
			$match: {
				product: new mongoose.Types.ObjectId(productId),
			},
		},
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				reviewCount: { $sum: 1 },
			},
		},
	]);

	if (!stats.length) {
		return { averageRating: 0, reviewCount: 0 };
	}

	return {
		averageRating: Math.round(stats[0].averageRating * 10) / 10,
		reviewCount: stats[0].reviewCount,
	};
};

export const attachReviewStatsToProducts = async (products) => {
	if (!products?.length) return products;

	const productIds = products
		.map((product) => product._id)
		.filter(Boolean)
		.map((id) => new mongoose.Types.ObjectId(id));

	const stats = await Review.aggregate([
		{
			$match: {
				product: { $in: productIds },
			},
		},
		{
			$group: {
				_id: "$product",
				averageRating: { $avg: "$rating" },
				reviewCount: { $sum: 1 },
			},
		},
	]);

	const statsMap = stats.reduce((acc, item) => {
		acc[item._id.toString()] = {
			rating: Math.round(item.averageRating * 10) / 10,
			reviewCount: item.reviewCount,
		};
		return acc;
	}, {});

	return products.map((product) => {
		const productStats = statsMap[product._id.toString()] || {
			rating: 0,
			reviewCount: 0,
		};

		return {
			...product,
			rating: productStats.rating,
			reviewCount: productStats.reviewCount,
		};
	});
};

export const getProductReviews = async (req, res) => {
	try {
		const { productId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).json({ message: "Invalid product ID" });
		}

		const [reviews, stats] = await Promise.all([
			Review.find({ product: productId })
				.populate("user", "firstName lastName")
				.sort({ createdAt: -1 }),
			getProductReviewStats(productId),
		]);

		res.json({ reviews, ...stats });
	} catch (error) {
		console.error("Error in getProductReviews:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProductReview = async (req, res) => {
	try {
		const { productId } = req.params;
		const { rating, comment } = req.body;

		if (!mongoose.Types.ObjectId.isValid(productId)) {
			return res.status(400).json({ message: "Invalid product ID" });
		}

		const parsedRating = Number(rating);
		if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
			return res.status(400).json({ message: "Rating must be between 1 and 5" });
		}

		if (!comment?.trim()) {
			return res.status(400).json({ message: "Comment is required" });
		}

		const existingReview = await Review.findOne({
			user: req.user._id,
			product: productId,
		});

		if (existingReview) {
			return res.status(400).json({ message: "Ai lăsat deja o recenzie pentru acest produs" });
		}

		const review = await Review.create({
			user: req.user._id,
			product: productId,
			rating: parsedRating,
			comment: comment.trim(),
		});

		const populatedReview = await Review.findById(review._id).populate(
			"user",
			"firstName lastName"
		);
		const stats = await getProductReviewStats(productId);

		res.status(201).json({ review: populatedReview, ...stats });
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ message: "Ai lăsat deja o recenzie pentru acest produs" });
		}
		console.error("Error in createProductReview:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const deleteReview = async (req, res) => {
	try {
		const review = await Review.findById(req.params.id);

		if (!review) {
			return res.status(404).json({ message: "Recenzia nu a fost găsită" });
		}

		const isOwner = review.user.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";

		if (!isOwner && !isAdmin) {
			return res.status(403).json({ message: "Nu poți șterge această recenzie" });
		}

		const productId = review.product;
		await review.deleteOne();

		const stats = await getProductReviewStats(productId);
		res.json({ message: "Recenzie ștearsă", productId, ...stats });
	} catch (error) {
		console.error("Error in deleteReview:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
