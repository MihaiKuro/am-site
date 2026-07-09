import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

const populateProductFields = async (product) => {
	if (!product) return null;

	const populatedProduct = await Product.findById(product._id)
		.populate('category', 'name slug subcategories')
		.lean(); // Use lean() for better performance as we're modifying it

	if (populatedProduct && populatedProduct.subcategory && populatedProduct.category && populatedProduct.category.subcategories) {
		const foundSubcategory = populatedProduct.category.subcategories.find(
			(sub) => sub._id.toString() === populatedProduct.subcategory.toString()
		);
		// Replace the subcategory ObjectId with the actual subcategory object for frontend consumption
		populatedProduct.subcategory = foundSubcategory || null;
	}
	return populatedProduct;
};

export const getAllProducts = async (req, res) => {
	try {
		const { category, subcategory, minPrice, maxPrice, minStock, maxStock, isFeatured, productId } = req.query;
		const filter = {};

		if (category) {
			filter.category = category;
		}
		if (subcategory) {
			filter.subcategory = subcategory;
		}
		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = parseFloat(minPrice);
			if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
		}
		if (minStock || maxStock) {
			filter.stock = {};
			if (minStock) filter.stock.$gte = parseInt(minStock);
			if (maxStock) filter.stock.$lte = parseInt(maxStock);
		}
		if (isFeatured === 'true') {
			filter.isFeatured = true;
		}
		if (productId) {
			filter._id = productId;
		}

		const products = await Product.find(filter);
		const populatedProducts = await Promise.all(
			products.map(product => populateProductFields(product))
		);
		res.json({ products: populatedProducts.filter(Boolean) });
	} catch (error) {
		console.log("Error in getAllProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");
		if (featuredProducts) {
			const cached = JSON.parse(featuredProducts).filter((p) => p && p.stock > 0);
			if (cached.length > 0) {
				return res.json(cached);
			}
		}

		const rawFeaturedProducts = await Product.find({ isFeatured: true, stock: { $gt: 0 } }).lean();
		featuredProducts = await Promise.all(
			rawFeaturedProducts.map(product => populateProductFields(product))
		);
		const inStockFeatured = featuredProducts.filter(Boolean);

		await redis.set("featured_products", JSON.stringify(inStockFeatured));

		res.json(inStockFeatured);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProduct = async (req, res) => {
	try {
		const { name, description, price, image, category, subcategory, stock, basePrice } = req.body;

		// Verify that the category and subcategory exist and match
		const categoryDoc = await Category.findById(category);
		if (!categoryDoc) {
			return res.status(404).json({ message: "Category not found" });
		}

		const subcategoryDoc = categoryDoc.subcategories.id(subcategory);
		if (!subcategoryDoc) {
			return res.status(404).json({ message: "Subcategory not found in this category" });
		}

		let cloudinaryResponse = null;
		if (image) {
			cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
		}

		const product = await Product.create({
			name,
			description,
			price,
			basePrice,
			image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
			category,
			subcategory,
			stock: parseInt(stock) || 0,
		});

		const populatedProduct = await populateProductFields(product);

		res.status(201).json(populatedProduct);
	} catch (error) {
		console.log("Error in createProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("deleted image from cloudinary");
			} catch (error) {
				console.log("error deleting image from cloudinary", error);
			}
		}

		const wasFeatured = product.isFeatured;
		await Product.findByIdAndDelete(req.params.id);

		if (wasFeatured) {
			await updateFeaturedProductsCache();
		}

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$lookup: {
					from: 'categories',
					localField: 'category',
					foreignField: '_id',
					as: 'category'
				}
			},
			{
				$unwind: '$category'
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
					stock: 1,
					'category.name': 1,
					'subcategory.name': 1
				},
			},
		]);

		// Manually populate subcategory for aggregated results
		const finalProducts = await Promise.all(
			products.map(async (product) => {
				if (product.subcategory && product.category && product.category.subcategories) {
					const foundSubcategory = product.category.subcategories.find(
						(sub) => sub._id.toString() === product.subcategory.toString()
					);
					product.subcategory = foundSubcategory || null;
				}
				return product;
			})
		);

		res.json(finalProducts);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		const populatedProducts = await Promise.all(
			products.map(product => populateProductFields(product))
		);
		res.json({ products: populatedProducts.filter(Boolean) });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductsBySubcategory = async (req, res) => {
	const { subcategory } = req.params;
	try {
		const products = await Product.find({ subcategory })
			.populate('category', 'name slug subcategories')
			.lean();
		
		const populatedProducts = await Promise.all(
			products.map(async (product) => {
				if (product.category && product.category.subcategories) {
					const foundSubcategory = product.category.subcategories.find(
						(sub) => sub._id.toString() === product.subcategory.toString()
					);
					product.subcategory = foundSubcategory || null;
				}
				return product;
			})
		);
		
		res.json({ products: populatedProducts.filter(Boolean) });
	} catch (error) {
		console.log("Error in getProductsBySubcategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			await updateFeaturedProductsCache();
			res.json(await populateProductFields(updatedProduct));
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export async function updateFeaturedProductsCache() {
	try {
		const rawFeaturedProducts = await Product.find({ isFeatured: true, stock: { $gt: 0 } }).lean();
		const featuredProducts = await Promise.all(
			rawFeaturedProducts.map(product => populateProductFields(product))
		);
		await redis.set("featured_products", JSON.stringify(featuredProducts.filter(Boolean)));
	} catch (error) {
		console.log("error in update cache function");
	}
}

export const updateProduct = async (req, res) => {
	try {
		const { name, description, price, image, category, subcategory, stock } = req.body;
		const productId = req.params.id;

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		// Verify that the category and subcategory exist and match if they're being updated
		if (category) {
			const categoryDoc = await Category.findById(category);
			if (!categoryDoc) {
				return res.status(404).json({ message: "Category not found" });
			}

			if (subcategory) {
				const subcategoryDoc = categoryDoc.subcategories.id(subcategory);
				if (!subcategoryDoc) {
					return res.status(404).json({ message: "Subcategory not found in this category" });
				}
			}
		}

		// Handle image update if a new image is provided
		let imageUrl = product.image;
		if (image && image !== product.image) {
			// Delete old image from Cloudinary if it exists
			if (product.image) {
				const publicId = product.image.split("/").pop().split(".")[0];
				try {
					await cloudinary.uploader.destroy(`products/${publicId}`);
				} catch (error) {
					console.log("Error deleting old image from cloudinary", error);
				}
			}

			// Upload new image
			const cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
			imageUrl = cloudinaryResponse.secure_url;
		}

		// Update product fields
		const updatedProduct = await Product.findByIdAndUpdate(
			productId,
			{
				name: name || product.name,
				description: description || product.description,
				price: price || product.price,
				image: imageUrl,
				category: category || product.category,
				subcategory: subcategory || product.subcategory,
				stock: stock !== undefined ? parseInt(stock) : product.stock,
			},
			{ new: true }
		);

		const populatedProduct = await populateProductFields(updatedProduct);
		if (product.isFeatured || updatedProduct.isFeatured) {
			await updateFeaturedProductsCache();
		}
		res.json(populatedProduct);
	} catch (error) {
		console.log("Error in updateProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
