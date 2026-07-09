import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		slug: {
			type: String,
			required: true,
		},
		image: {
			type: String,
		},
		description: {
			type: String,
		},
	},
	{ _id: true }
);

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
		},
		image: {
			type: String,
			required: [true, "Image is required"],
		},
		subcategories: [subcategorySchema],
	},
	{ timestamps: true }
);

// Create slug from name before saving
categorySchema.pre("save", function (next) {
	if (!this.isModified("name")) {
		return next();
	}
	this.slug = this.name
		.toLowerCase()
		.replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special characters
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
	next();
});

// Create slug for subcategories before saving
categorySchema.pre("save", function (next) {
	if (this.isModified("subcategories")) {
		this.subcategories.forEach((subcategory) => {
			if (!subcategory.slug) {
				subcategory.slug = subcategory.name
					.toLowerCase()
					.replace(/[^a-zA-Z0-9\s-]/g, "")
					.replace(/\s+/g, "-")
					.replace(/-+/g, "-");
			}
		});
	}
	next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category; 