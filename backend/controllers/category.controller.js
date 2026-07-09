import Category from "../models/category.model.js";
import cloudinary from "../lib/cloudinary.js";

// Get all categories
export const getAllCategories = async (req, res) => {
	try {
		const categories = await Category.find().sort({ createdAt: -1 });
		res.status(200).json(categories);
	} catch (error) {
		console.error("Error in getAllCategories:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Create a new category
export const createCategory = async (req, res) => {
	try {
		const { name, image, subcategories } = req.body;

		// Check if category already exists
		const existingCategory = await Category.findOne({ name });
		if (existingCategory) {
			return res.status(400).json({ message: "Category already exists" });
		}

		// Create slug from name
		const slug = name
			.toLowerCase()
			.replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen

		let cloudinaryResponse = null;
		if (image) {
			cloudinaryResponse = await cloudinary.uploader.upload(image, {
				folder: "categories",
			});
		}

		const category = await Category.create({
			name,
			slug,
			image: cloudinaryResponse?.secure_url || "",
			subcategories: subcategories || [],
		});

		res.status(201).json(category);
	} catch (error) {
		console.error("Error in createCategory:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Update a category
export const updateCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, image, subcategories } = req.body;

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		// Check if new name already exists for another category
		if (name !== category.name) {
			const existingCategory = await Category.findOne({ name });
			if (existingCategory) {
				return res.status(400).json({ message: "Category name already exists" });
			}

			// Update slug if name changes
			category.slug = name
				.toLowerCase()
				.replace(/[^a-zA-Z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-");
		}

		// Update image if new one is provided
		if (image && image !== category.image) {
			// Delete old image from Cloudinary if it exists
			if (category.image) {
				const publicId = category.image.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy(`categories/${publicId}`);
			}

			// Upload new image
			const cloudinaryResponse = await cloudinary.uploader.upload(image, {
				folder: "categories",
			});
			category.image = cloudinaryResponse.secure_url;
		}

		// Update subcategories if provided
		if (subcategories) {
			category.subcategories = subcategories;
		}

		category.name = name;
		await category.save();

		res.status(200).json(category);
	} catch (error) {
		console.error("Error in updateCategory:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Delete a category
export const deleteCategory = async (req, res) => {
	try {
		const { id } = req.params;

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		// Delete image from Cloudinary if it exists
		if (category.image) {
			const publicId = category.image.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(`categories/${publicId}`);
		}

		await category.deleteOne();
		res.status(200).json({ message: "Category deleted successfully" });
	} catch (error) {
		console.error("Error in deleteCategory:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Add a subcategory to a category
export const addSubcategory = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, image, description } = req.body;

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		// Check if subcategory already exists
		const existingSubcategory = category.subcategories.find(
			(sub) => sub.name.toLowerCase() === name.toLowerCase()
		);
		if (existingSubcategory) {
			return res.status(400).json({ message: "Subcategory already exists" });
		}

		// Create slug from name
		const slug = name
			.toLowerCase()
			.replace(/[^a-zA-Z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");

		let subcategoryImage = "";
		if (image) {
			const cloudinaryResponse = await cloudinary.uploader.upload(image, {
				folder: "categories/subcategories",
			});
			subcategoryImage = cloudinaryResponse.secure_url;
		}

		category.subcategories.push({
			name,
			slug,
			image: subcategoryImage,
			description,
		});

		await category.save();
		res.status(200).json(category);
	} catch (error) {
		console.error("Error in addSubcategory:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Update a subcategory
export const updateSubcategory = async (req, res) => {
	try {
		const { categoryId, subcategoryId } = req.params;
		const { name, image, description } = req.body;

		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		const subcategory = category.subcategories.id(subcategoryId);
		if (!subcategory) {
			return res.status(404).json({ message: "Subcategory not found" });
		}

		// Check if new name already exists for another subcategory
		if (name !== subcategory.name) {
			const existingSubcategory = category.subcategories.find(
				(sub) => sub.name.toLowerCase() === name.toLowerCase() && sub._id.toString() !== subcategoryId
			);
			if (existingSubcategory) {
				return res.status(400).json({ message: "Subcategory name already exists" });
			}

			// Update slug if name changes
			subcategory.slug = name
				.toLowerCase()
				.replace(/[^a-zA-Z0-9\s-]/g, "")
				.replace(/\s+/g, "-")
				.replace(/-+/g, "-");
		}

		// Update image if new one is provided
		if (image && image !== subcategory.image) {
			// Delete old image from Cloudinary if it exists
			if (subcategory.image) {
				const publicId = subcategory.image.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy(`categories/subcategories/${publicId}`);
			}

			// Upload new image
			const cloudinaryResponse = await cloudinary.uploader.upload(image, {
				folder: "categories/subcategories",
			});
			subcategory.image = cloudinaryResponse.secure_url;
		}

		subcategory.name = name;
		subcategory.description = description;
		await category.save();

		res.status(200).json(category);
	} catch (error) {
		console.error("Error in updateSubcategory:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Delete a subcategory
export const deleteSubcategory = async (req, res) => {
	try {
		const { categoryId, subcategoryId } = req.params;

		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		const subcategory = category.subcategories.id(subcategoryId);
		if (!subcategory) {
			return res.status(404).json({ message: "Subcategory not found" });
		}

		// Delete image from Cloudinary if it exists
		if (subcategory.image) {
			const publicId = subcategory.image.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(`categories/subcategories/${publicId}`);
		}

		subcategory.deleteOne();
		await category.save();

		res.status(200).json({ message: "Subcategory deleted successfully" });
	} catch (error) {
		console.error("Error in deleteSubcategory:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
}; 